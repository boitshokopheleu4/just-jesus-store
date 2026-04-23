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

      if (!user) {
        alert("Please login first");
        return;
      }

      console.log("👤 USER:", user.id);

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

      // 💳 REQUEST PAYFAST DATA
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

console.log("PAYFAST RESPONSE:", resData);

const { action, payload } = resData;

if (!action || !payload) {
  alert("Missing PayFast data");
  return;
}

// 🚨 FORM SUBMIT (REQUIRED BY PayFast)
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
form.submit();

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