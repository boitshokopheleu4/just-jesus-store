import { NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const body = await req.json();

    const { data, error } = await supabase
      .from("orders")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}