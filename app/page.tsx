"use client";

import { useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabaseClient.auth.getUser();

      if (!user) {
        alert("Please login first");
        return;
      }

      // 1. Create the Order in Supabase
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: 100.00, // Ensure this is a number
          items: [],
          user_id: user.id,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Order creation failed");

      const order = orderData.data;

      // 2. Get PayFast Signature & Payload
      const payRes = await fetch("/api/payfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id, // Use the ID returned from Supabase
          amount: order.total,
        }),
      });

      const payfastResponse = await payRes.json();
      if (!payRes.ok) throw new Error(payfastResponse.error || "Signature failed");

      // 3. Create and Submit Form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payfastResponse.url; // Use the URL from backend

      Object.entries(payfastResponse.payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err: any) {
      console.error("🔥 Error:", err);
      alert(err.message || "Checkout crashed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">JUST JESUS STORE</h1>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-black text-white px-8 py-3 rounded-lg font-bold disabled:bg-gray-400"
      >
        {loading ? "PREPARING..." : "PAY R100.00 NOW"}
      </button>
    </div>
  );
}