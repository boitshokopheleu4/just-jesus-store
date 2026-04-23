"use client";

import { useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      console.log("🟡 Starting checkout...");

      // 🔐 GET LOGGED IN USER
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

      // ⚠️ SAFETY CHECK
      if (!order?.order_id) {
        console.error("Missing order_id:", order);
        alert("Order creation failed");
        return;
      }

      // 💳 SEND TO PAYFAST
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

      const payData = await payRes.json();
      console.log("💳 PAYFAST RESPONSE:", payData);

      if (!payRes.ok || !payData?.redirectUrl) {
        alert("PayFast failed");
        return;
      }

      // 🔁 REDIRECT TO PAYFAST
      window.location.href = payData.redirectUrl;

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