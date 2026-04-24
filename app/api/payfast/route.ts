import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * PAYFAST SIGNATURE RULES:
 * - exclude merchant_key
 * - exclude signature
 * - sort alphabetically
 * - encode correctly
 */
function generateSignature(
  data: Record<string, any>,
  passphrase: string = ""
) {
  const pfOutput: string[] = [];

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (
      value !== "" &&
      value !== null &&
      typeof value !== "undefined" &&
      key !== "signature" &&
      key !== "merchant_key" // 🔥 CRITICAL: NEVER INCLUDE THIS
    ) {
      pfOutput.push(
        `${key}=${encodeURIComponent(String(value).trim()).replace(
          /%20/g,
          "+"
        )}`
      );
    }
  });

  // MUST sort alphabetically
  pfOutput.sort();

  let queryString = pfOutput.join("&");

  // Optional passphrase (sandbox can be empty)
  if (passphrase) {
    queryString += `&passphrase=${encodeURIComponent(passphrase).replace(
      /%20/g,
      "+"
    )}`;
  }

  return crypto.createHash("md5").update(queryString).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // 🚨 ENV CHECK
    if (!merchant_id || !merchant_key || !baseUrl) {
      return NextResponse.json(
        { error: "Missing PayFast environment variables" },
        { status: 500 }
      );
    }

    // 💳 PAYFAST PAYLOAD
    const payload: Record<string, any> = {
      merchant_id,
      merchant_key, // ✅ REQUIRED for PayFast form
      return_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      notify_url: `${baseUrl}/api/payfast-notify`,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: `Order ${orderId}`,
    };

    // 🔐 SIGNATURE (merchant_key automatically excluded)
    payload.signature = generateSignature(payload, passphrase);

    console.log("🔥 PAYFAST PAYLOAD GENERATED:", payload);

    return NextResponse.json({
      action: "https://sandbox.payfast.co.za/eng/process",
      payload,
    });
  } catch (err: any) {
    console.error("🔥 PAYFAST ROUTE ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}