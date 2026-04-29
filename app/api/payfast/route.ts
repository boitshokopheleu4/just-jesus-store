import { NextResponse } from "next/server";
import crypto from "crypto";

function generateSignature(data: Record<string, any>, passphrase = "") {
  const filtered: Record<string, string> = {};

  for (const key in data) {
    if (
      data[key] !== "" &&
      data[key] !== null &&
      typeof data[key] !== "undefined" &&
      key !== "signature" &&
      key !== "merchant_key"
    ) {
      filtered[key] = String(data[key]).trim();
    }
  }

  const sortedKeys = Object.keys(filtered).sort();

  let pfString = sortedKeys
    .map(
      (key) =>
        `${key}=${encodeURIComponent(filtered[key]).replace(/%20/g, "+")}`
    )
    .join("&");

  if (passphrase) {
    pfString += `&passphrase=${encodeURIComponent(passphrase).replace(
      /%20/g,
      "+"
    )}`;
  }

  console.log("🔐 STRING TO HASH:", pfString);

  return crypto.createHash("md5").update(pfString).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const merchant_id = process.env.PAYFAST_MERCHANT_ID!;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY!;
    const baseUrl = process.env.NEXT_PUBLIC_URL!;
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // 🚨 ENV DEBUG CHECK (YOU ASKED FOR THIS)
    console.log("ENV CHECK:", {
      merchant: process.env.PAYFAST_MERCHANT_ID,
      key: process.env.PAYFAST_MERCHANT_KEY,
      url: process.env.NEXT_PUBLIC_URL,
    });

    // 🚨 FAIL FAST IF ENV IS BROKEN
    if (!merchant_id || !merchant_key || !baseUrl) {
      console.log("❌ Missing env variables");

      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    // 💳 PAYFAST PAYLOAD
    const payload = {
      merchant_id,
      merchant_key,
      return_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      notify_url: `${baseUrl}/api/payfast-notify`,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: `Order ${orderId}`,
    };

    // 🔐 SIGNATURE
    const signature = generateSignature(payload, passphrase);

    console.log("📦 PAYFAST PAYLOAD:", payload);
    console.log("🔐 SIGNATURE:", signature);

    return NextResponse.json({
      action: "https://sandbox.payfast.co.za/eng/process",
      payload: {
        ...payload,
        signature,
      },
    });
  } catch (err: any) {
    console.error("🔥 PAYFAST ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}