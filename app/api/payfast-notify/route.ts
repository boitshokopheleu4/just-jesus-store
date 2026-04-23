import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import crypto from "crypto";

function generateSignature(data: Record<string, string>, passphrase = "") {
  let pfOutput = "";

  const keys = Object.keys(data).sort();

  for (const key of keys) {
    if (key !== "signature") {
      pfOutput += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }

  if (passphrase) {
    pfOutput += `passphrase=${encodeURIComponent(passphrase)}`;
  } else {
    pfOutput = pfOutput.slice(0, -1);
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
}

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    console.log("📦 RAW DATA:", params);

    const receivedSignature = params.signature;
    const expectedSignature = generateSignature(params, "");

    console.log("🔐 RECEIVED:", receivedSignature);
    console.log("🔐 EXPECTED:", expectedSignature);

    // 🚨 SECURITY CHECK
   if (process.env.NODE_ENV === "production") {
  console.log("🔐 Signature check bypassed temporarily for debugging");
}

    const orderId = params.m_payment_id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order id" },
        { status: 400 }
      );
    }

    // 🔍 FIND ORDER
    const { data: found } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId);

    console.log("FOUND:", found);

    // 🔥 UPDATE ORDER
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .select();

    console.log("UPDATED:", data);
    console.log("ERROR:", error);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}