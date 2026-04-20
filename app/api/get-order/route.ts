import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({
      success: false,
      error: "No order ID provided"
    });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }

  return NextResponse.json({
    success: true,
    order: data
  });
}