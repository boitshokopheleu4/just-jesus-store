import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import crypto from "crypto";

// ✅ Correct PayFast signature generator (NO passphrase)
function generateSignature(data: Record<string, any>) {
  const pfData: Record<string, string> = {};

  // 1. Remove signature + empty values
  Object.keys(data).forEach((key) => {
    if (key !== "signature" && data[key] !== "") {
      pfData[key] = String(data[key]).trim();
    }
  });

  // 2. Sort keys alphabetically
  const sortedKeys = Object.keys(pfData).sort();

  // 3. Build string with CORRECT encoding
  let output = "";

  sortedKeys.forEach((key, index) => {
    const value = encodeURIComponent(pfData[key]).replace(/%20/g, "+"); // 🔥 FIX
    output += `${key}=${value}`;

    if (index !== sortedKeys.length - 1) {
      output += "&";
    }
  });

  console.log("🔍 STRING TO HASH:", output);

  // 4. Hash
  return crypto.createHash("md5").update(output).digest("hex");
}

export async function POST(req: Request) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    console.log("📦 RAW DATA:", params);

    const receivedSignature = params.signature;

    // ✅ Generate expected signature
    const expectedSignature = generateSignature(params);

    console.log("🔐 RECEIVED:", receivedSignature);
    console.log("🔐 EXPECTED:", expectedSignature);

    // 🚨 SECURITY CHECK
    if (receivedSignature !== expectedSignature) {
      console.log("❌ INVALID SIGNATURE - REJECTED");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
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

    // 🔥 UPDATE ORDER STATUS
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