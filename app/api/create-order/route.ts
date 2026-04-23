import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = crypto.randomUUID();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_id: orderId,
        total: body.total ?? 0,
        items: body.items ?? [],
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}