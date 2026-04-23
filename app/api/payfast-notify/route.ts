import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    const params = new URLSearchParams(text);

    const orderId =
      params.get("m_payment_id") ||
      params.get("pf_payment_id");

    console.log("📦 PAYFAST ORDER ID:", orderId);

    if (!orderId) {
      console.log("❌ Missing orderId from PayFast");
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // 🔥 DEBUG CHECK (IMPORTANT)
    const check = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId);

    console.log("🔍 ORDER FOUND:", check);

    // 🔥 ACTUAL UPDATE
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .select();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ UPDATED ROW:", data);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 WEBHOOK CRASH:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}