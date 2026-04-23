import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();


    console.log("SUPABASE KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);



    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server-only key
    );

    const orderId = crypto.randomUUID();

    console.log("🧾 CREATING ORDER:", {
      orderId,
      total: body.total,
      user_id: body.user_id
    });

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          id: orderId,
          order_id: orderId,
          total: body.total,
          items: body.items ?? [],
          user_id: body.user_id ?? null,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.log("✅ ORDER CREATED:", data);

    return NextResponse.json({
      data
    });

  } catch (err: any) {
    console.error("🔥 CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}