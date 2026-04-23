import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    // 🔥 DEBUG: confirms PayFast hit the endpoint
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    console.log("🔥 RAW WEBHOOK BODY:", text);

    const params = new URLSearchParams(text);

    const orderId =
      params.get("m_payment_id") ||
      params.get("pf_payment_id");

    console.log("📦 ORDER ID RECEIVED:", orderId);

    if (!orderId) {
      console.log("❌ Missing order ID");
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId); // IMPORTANT: matches your DB

    if (error) {
      console.log("❌ Supabase update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ ORDER UPDATED TO PAID:", orderId);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 WEBHOOK CRASH:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}