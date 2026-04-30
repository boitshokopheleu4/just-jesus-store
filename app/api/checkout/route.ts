import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const orderId = crypto.randomUUID();

    // 1. Insert the order into Supabase first
    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          id: orderId,
          total: body.total,
          items: body.items ?? [],
          user_id: body.user_id ?? null,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Prepare PayFast Data
    // IMPORTANT: The order of these keys must stay consistent
    const payfastData: any = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/payfast`,
      m_payment_id: orderId, // Use the ID we just created
      amount: parseFloat(body.total).toFixed(2),
      item_name: `Just Jesus Store Order #${orderId.slice(0, 8)}`,
    };

    // 3. Generate Signature
    // Rule: Concatenate all fields (URL encoded) then append passphrase
    let signatureString = "";
    Object.keys(payfastData).forEach((key) => {
      const value = payfastData[key];
      if (value !== undefined && value !== "") {
        signatureString += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}&`;
      }
    });

    // Remove the trailing '&' and add the passphrase
    const finalString = signatureString.slice(0, -1);
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    
    const signature = crypto
      .createHash("md5")
      .update(passphrase ? `${finalString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}` : finalString)
      .digest("hex");

    // 4. Return everything to the frontend
    return NextResponse.json({
      ...payfastData,
      signature,
      payfast_url: "https://sandbox.payfast.co.za/eng/process"
    });

  } catch (err: any) {
    console.error("🔥 CHECKOUT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}