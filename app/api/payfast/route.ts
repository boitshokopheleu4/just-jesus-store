import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { total, orderId } = body;

  // PayFast sandbox endpoint
  const payfastUrl = "https://sandbox.payfast.co.za/eng/process";

  const payload = {
    merchant_id: "10000100",
    merchant_key: "46f0cd694581a",
    return_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    notify_url: "http://localhost:3000/api/payfast-notify",
    amount: total,
    item_name: orderId
  };

  const queryString = new URLSearchParams(payload as any).toString();

  return NextResponse.json({
    url: `${payfastUrl}?${queryString}`
  });
}