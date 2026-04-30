import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const payload: any = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/payfast`,
      m_payment_id: orderId,
      amount: parseFloat(amount).toFixed(2), // MUST have 2 decimals
      item_name: `Order #${orderId}`,
    };

    // Construct the signature string
    let pfOutput = "";
    for (let key in payload) {
      if (payload.hasOwnProperty(key)) {
        pfOutput += `${key}=${encodeURIComponent(payload[key].toString().trim()).replace(/%20/g, "+")}&`;
      }
    }

    // Remove last ampersand
    let finalString = pfOutput.slice(0, -1);

    // Add passphrase if it exists in your environment
    if (process.env.PAYFAST_PASSPHRASE) {
      finalString += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE.trim()).replace(/%20/g, "+")}`;
    }

    const signature = crypto.createHash("md5").update(finalString).digest("hex");

    return NextResponse.json({
      url: "https://sandbox.payfast.co.za/eng/process",
      payload: { ...payload, signature },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}