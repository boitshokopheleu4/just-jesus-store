"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_id: string;
  items: any;
  total: number;
  status: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const res = await fetch("/api/all-orders");
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (order_id: string, status: string) => {
    await fetch("/api/update-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id, status })
    });

    fetchOrders();
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>ADMIN DASHBOARD</h1>

      {orders.map((order) => (
        <div key={order.id} style={{
          border: "1px solid #ccc",
          margin: 10,
          padding: 10
        }}>
          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Total:</b> R{order.total}</p>
          <p><b>Status:</b> {order.status}</p>

          <button onClick={() => updateStatus(order.order_id, "Processing")}>
            Processing
          </button>

          <button onClick={() => updateStatus(order.order_id, "Shipped")}>
            Shipped
          </button>

          <button onClick={() => updateStatus(order.order_id, "Delivered")}>
            Delivered
          </button>
        </div>
      ))}
    </div>
  );
}