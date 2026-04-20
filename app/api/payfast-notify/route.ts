import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.formData();

    const orderId = body.get("item_name") as string;
    const paymentStatus = body.get("payment_status") as string;

    console.log("PAYFAST WEBHOOK:", orderId, paymentStatus);

    if (paymentStatus === "COMPLETE") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Paid" })
        .eq("order_id", orderId);

      if (error) {
        console.error(error);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false
    });
  }
}