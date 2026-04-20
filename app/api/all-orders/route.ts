import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET() {
  const { data, error } = await supabase.from("orders").select("*");

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }

  return NextResponse.json(data);
}