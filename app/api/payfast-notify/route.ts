import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    const params = new URLSearchParams(text);

    const orderId = params.get("m_payment_id");

    console.log("PAYFAST ID:", orderId);

    // 🔍 CHECK IF ORDER EXISTS
    const check = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId);

    console.log("FOUND:", check.data);

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // 🔥 UPDATE ORDER STATUS
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .select();

    console.log("UPDATED:", data);
    console.log("ERROR:", error);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("WEBHOOK ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}