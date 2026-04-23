import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ order: data });
}