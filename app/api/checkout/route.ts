import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    const params = new URLSearchParams(text);

    const orderId = params.get("m_payment_id");

    console.log("📦 PayFast ID:", orderId);

    if (!orderId) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .select();

    console.log("✅ UPDATED:", data);
    console.log("❌ ERROR:", error);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}