import { NextResponse } from "next/server";
import crypto from "crypto";

function generateSignature(data: Record<string, any>) {
  let output = "";

  Object.keys(data).forEach((key) => {
    if (data[key] !== "" && data[key] !== null && key !== "signature") {
      output += `${key}=${encodeURIComponent(String(data[key]).trim()).replace(/%20/g, "+")}&`;
    }
  });

  output = output.slice(0, -1);

  return crypto.createHash("md5").update(output).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const merchant_id = process.env.PAYFAST_MERCHANT_ID!;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY!;
    const baseUrl = process.env.NEXT_PUBLIC_URL!;

    if (!merchant_id || !merchant_key || !baseUrl) {
      return NextResponse.json(
        { error: "Missing env variables" },
        { status: 500 }
      );
    }

    // ✅ BUILD PAYFAST PAYLOAD (THIS IS THE FIX)
    const payload: Record<string, any> = {
      merchant_id,
      merchant_key,
      return_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      notify_url: `${baseUrl}/api/payfast-notify`,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: `Order ${orderId}`,
    };

    // 🔐 ADD SIGNATURE
    payload.signature = generateSignature(payload);

    console.log("PAYFAST PAYLOAD:", payload);

    // 🚨 RETURN CORRECT STRUCTURE
   {
  return NextResponse.json({
  action: "https://sandbox.payfast.co.za/eng/process",
  payload
});
}
  } catch (err: any) {
    console.error("PAYFAST ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}