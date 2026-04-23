import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId, amount } = await req.json();

  const merchant_id = process.env.PAYFAST_MERCHANT_ID;
  const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // 🚨 HARD CHECK (THIS WILL SHOW YOU THE REAL ISSUE)
  if (!merchant_id || !merchant_key || !baseUrl) {
    console.log("ENV ERROR:", {
      merchant_id,
      merchant_key,
      baseUrl
    });

    return NextResponse.json({
      error: "Missing environment variables"
    }, { status: 500 });
  }

  return NextResponse.json({
  redirectUrl: "https://sandbox.payfast.co.za/eng/process",
  payload: {
    merchant_id,
    merchant_key,
    return_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/cancel`,
    notify_url: `${process.env.NEXT_PUBLIC_URL}/api/payfast-notify`,
    m_payment_id: orderId,
    amount: Number(amount).toFixed(2), // 🔥 CRITICAL FIX
    item_name: `Order ${orderId}`
  
  }
  });
}