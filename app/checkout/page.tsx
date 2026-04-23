"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      console.log("🟡 Starting checkout...");

      // STEP 1: Create order
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total: 100,
          items: []
        })
      });

      const data = await res.json();
      console.log("📦 Order response:", data);

      if (!res.ok || !data?.data) {
        alert("Checkout failed");
        return;
      }

      const order = data?.data;

if (!order?.order_id) {
  console.error("FULL RESPONSE:", data);
  alert("Missing order_id");
  return;
}

      // STEP 2: PayFast request (THIS is where your line goes)
      const payRes = await fetch("/api/payfast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: order.order_id, // 🔥 THIS IS THE EXACT PLACE
          amount: order.total
        })
      });

      const payData = await payRes.json();
      console.log("💳 PayFast response:", payData);

      if (!payRes.ok || !payData?.redirectUrl) {
        alert("PayFast failed");
        return;
      }

      // STEP 3: Redirect user to PayFast
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