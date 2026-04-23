"use client";

import { useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      console.log("🟡 Starting checkout...");

      // 🔐 GET USER
      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      console.log("👤 USER:", user);

      if (!user) {
        alert("Please login first");
        return;
      }

      // 🧾 CREATE ORDER
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total: 100,
          items: [],
          user_id: user.id
        })
      });

      const data = await res.json();

      console.log("📦 ORDER RESPONSE:", data);

      if (!res.ok || !data?.data) {
        alert("Checkout failed");
        return;
      }

      const order = data.data;

      if (!order?.order_id) {
        alert("Missing order_id");
        return;
      }

      // 💳 PAYFAST REQUEST
      const payRes = await fetch("/api/payfast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: order.order_id,
          amount: order.total
        })
      });

      const resData = await payRes.json();

      console.log("🔥 PAYFAST RESPONSE:", resData);

      const { action, payload } = resData;

      if (!action || !payload) {
        alert("Invalid PayFast response");
        return;
      }

      // 🚀 BUILD FORM (IMPORTANT FIX)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;

      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);

      console.log("🚀 Submitting to PayFast...");

      // IMPORTANT: delay prevents Next.js interrupting navigation
      setTimeout(() => {
        form.submit();
      }, 0);

    } catch (err) {
      console.error("🔥 Checkout error:", err);
      alert("Checkout crashed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "gray" : "black",
          color: "white",
          cursor: "pointer"
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
  