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
        order_id: orderId, // 🔥 MUST MATCH PAYFAST
        total: body.total ?? 100,
        items: body.items ?? [],
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE ORDER ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}