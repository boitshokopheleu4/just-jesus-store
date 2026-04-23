import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Generate PayFast MD5 signature
 * - excludes merchant_key
 * - excludes signature field
 * - sorts keys alphabetically
 * - optionally supports passphrase (NOT required for sandbox)
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
      key !== "signature"
    ) {
      pfOutput.push(
        `${key}=${encodeURIComponent(String(data[key]).trim()).replace(
          /%20/g,
          "+"
        )}`
      );
    }
  });

  // MUST sort alphabetically
  pfOutput.sort();

  let queryString = pfOutput.join("&");

  // Only append passphrase if it exists
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
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // 🚨 HARD CHECKS
    if (!merchant_id || !baseUrl) {
      console.log("❌ Missing env vars:", {
        merchant_id,
        baseUrl,
      });

      return NextResponse.json(
        { error: "Missing PayFast environment variables" },
        { status: 500 }
      );
    }

    // 💳 PAYFAST PAYLOAD (IMPORTANT: NO merchant_key)
    const payload: Record<string, any> = {
      merchant_id,
      return_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      notify_url: `${baseUrl}/api/payfast-notify`,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: `Order ${orderId}`,
    };

    // 🔐 GENERATE SIGNATURE
    payload.signature = generateSignature(payload, passphrase);

    console.log("🔥 PAYFAST PAYLOAD GENERATED:", payload);

    // 🚀 RETURN TO FRONTEND
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