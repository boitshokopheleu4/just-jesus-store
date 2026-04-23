import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = crypto.randomUUID();

    //const body = await req.json();

const { data, error } = await supabase
  .from("orders")
  .insert([
    {
      id: crypto.randomUUID(),
      order_id: crypto.randomUUID(),
      total: body.total,
      items: body.items,
      user_id: body.user_id,   // 🔥 IMPORTANT
      status: "pending"
    }
  ])
  .select()
  .single();

    console.log("SUPABASE INSERT RESULT:", { data, error });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: data // 🔥 must return this exactly
    });

  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}