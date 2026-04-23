import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const orderId = crypto.randomUUID();

    const result = await supabase
      .from("orders")
      .insert({
        id: orderId,           // internal UUID (primary key)
        order_id: orderId,     // 🔥 THIS is used by PayFast webhook
        total: body.amount ?? 100,
        items: body.items ?? [],
        status: "pending"
      })
      .select()
      .single();

    console.log("SUPABASE RESULT:", result);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "No data returned from insert" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      order: result.data
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}