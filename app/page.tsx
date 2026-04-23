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
      console.log("📦 Checkout response:", data);

      if (!res.ok) {
        console.error("❌ Checkout API failed:", data);
        alert(data?.error || "Checkout failed");
        return;
      }

      const order = data.data;

      if (!order?.order_id) {
        console.error("❌ Missing order_id:", order);
        alert("Order creation failed");
        return;
      }

      // STEP 2: Send to PayFast
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
      console.log("💳 PayFast response:", payData);

      if (!payRes.ok) {
        console.error("❌ PayFast API failed:", payData);
        alert(payData?.error || "PayFast failed");
        return;
      }

      if (!payData?.redirectUrl) {
        alert("Missing PayFast redirect URL");
        return;
      }

      // STEP 3: Redirect to PayFast
      window.location.href = payData.redirectUrl;

    } catch (err) {
      console.error("🔥 Checkout error:", err);
      alert("Checkout crashed — check console");
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