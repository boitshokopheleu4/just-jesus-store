import { NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const formData = await req.formData();
    const data: any = Object.fromEntries(formData);

    // Example: update order status from PayFast callback
    const orderId = data.m_payment_id;

    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}