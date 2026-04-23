import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * PayFast signature generator
 * - excludes signature
 * - excludes merchant_key (IMPORTANT)
 * - sorts alphabetically
 */
function generateSignature(
  data: Record<string, any>,
  passphrase: string = ""
) {
  const pfOutput: string[] = [];

  Object.keys(data).forEach((key) => {
    if (
      data[key] !== "" &&
      data[key] !== null &&
      typeof data[key] !== "undefined" &&
      key !== "signature" &&
      key !== "merchant_key" // ❌ MUST be excluded from signature
    ) {
      pfOutput.push(
        `${key}=${encodeURIComponent(String(data[key]).trim()).replace(
          /%20/g,
          "+"
        )}`
      );
    }
  });

  pfOutput.sort();

  let queryString = pfOutput.join("&");

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
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY; // ✅ REQUIRED
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // 🚨 HARD CHECK
    if (!merchant_id || !merchant_key || !baseUrl) {
      return NextResponse.json(
        { error: "Missing PayFast environment variables" },
        { status: 500 }
      );
    }

    // 💳 PAYFAST PAYLOAD (merchant_key MUST be included here)
    const payload: Record<string, any> = {
      merchant_id,
      merchant_key, // ✅ REQUIRED FOR PAYFAST FORM
      return_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      notify_url: `${baseUrl}/api/payfast-notify`,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: `Order ${orderId}`,
    };

    // 🔐 SIGNATURE (merchant_key excluded automatically)
    payload.signature = generateSignature(payload, passphrase);

    console.log("🔥 PAYFAST PAYLOAD:", payload);

    return NextResponse.json({
      action: "https://sandbox.payfast.co.za/eng/process",
      payload,
    });
  } catch (err: any) {
    console.error("🔥 PAYFAST ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}