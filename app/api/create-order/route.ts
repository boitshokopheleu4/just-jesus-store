import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = "JJ-" + Math.floor(Math.random() * 100000);

    const { data, error } = await supabase.from("orders").insert([
      {
        order_id: orderId,
        items: body.items,
        total: body.total,
        status: "Processing"
      }
    ]);

    // ❌ If Supabase fails, return real error
    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    // ✅ Success response
    return NextResponse.json({
      success: true,
      orderId: orderId
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message || "Unknown server error"
    });
  }
}