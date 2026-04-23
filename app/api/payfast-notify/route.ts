import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    console.log("📦 RAW:", text);

    const params = Object.fromEntries(new URLSearchParams(text));
    const orderId = params.m_payment_id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    // 🔥 STEP 1: VERIFY WITH PAYFAST SERVER
    const verifyRes = await fetch(
      "https://sandbox.payfast.co.za/eng/query/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: text,
      }
    );

    const verifyText = await verifyRes.text();

    console.log("🔐 PAYFAST VERIFY RESPONSE:", verifyText);

    if (verifyText !== "VALID") {
      console.log("❌ INVALID PAYMENT");
      return NextResponse.json({ error: "Invalid payment" }, { status: 403 });
    }

    // 🔥 STEP 2: CHECK STATUS
    if (params.payment_status !== "COMPLETE") {
      console.log("⚠️ Payment not complete");
      return NextResponse.json({ success: false });
    }

    // 🔥 STEP 3: UPDATE ORDER
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .select();

    console.log("UPDATED:", data);
    console.log("ERROR:", error);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}