import { NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("orders")
      .select("*");

    return NextResponse.json({ data, error });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}