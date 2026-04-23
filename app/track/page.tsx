"use client";
import { useState } from "react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);

  const track = async () => {
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ orderId })
    });

    const data = await res.json();
    setOrder(data.order);
  };

  return (
    <div>
      <h1>Track Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />

      <button onClick={track}>Track</button>

      {order && (
        <div>
          <p>Status: {order.status}</p>
          <p>Total: {order.total}</p>
        </div>
      )}
    </div>
  );
}