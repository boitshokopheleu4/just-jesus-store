"use client";

import { useState } from "react";

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async () => {
    setLoading(true);

    const res = await fetch(`/api/get-order?orderId=${orderId}`);
    const data = await res.json();

    setOrder(data.order);
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <h1>Track Your Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ padding: 10, marginTop: 20 }}
      />

      <br />

      <button onClick={trackOrder} style={{ marginTop: 20 }}>
        Track Order
      </button>

      {loading && <p>Loading...</p>}

      {order && (
        <div style={{ marginTop: 30 }}>
          <h3>Order Found</h3>
          <p>Order ID: {order.order_id}</p>
          <p>Status: {order.status}</p>
          <p>Total: R{order.total}</p>
        </div>
      )}
    </div>
  );
}