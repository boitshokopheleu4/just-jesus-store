import { NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}