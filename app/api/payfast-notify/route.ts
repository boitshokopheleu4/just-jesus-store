import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const text = await req.text();

    console.log("🔥 RAW WEBHOOK BODY:", text);

    const params = new URLSearchParams(text);

    const orderId =
      params.get("m_payment_id") ||
      params.get("pf_payment_id");

    if (!orderId) {
      console.log("❌ NO ORDER ID FOUND");
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    console.log("✅ ORDER ID RECEIVED:", orderId);

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId); // 👈 IMPORTANT (since id === order_id)

    if (error) {
      console.log("❌ SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ ORDER UPDATED:", data);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 WEBHOOK CRASH:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}