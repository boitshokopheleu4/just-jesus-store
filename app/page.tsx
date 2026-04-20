"use client";

import { useState } from "react";

type CartItem = {
  name: string;
  price: number;
};

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addToCart = (name: string, price: number) => {
    setCart((prev) => [...prev, { name, price }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

 const checkout = async () => {
  const res = await fetch("/api/payfast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: cart,
      total: total,
      orderId: "JJ-" + Date.now()
    })
  });

  const data = await res.json();

  window.location.href = data.url;
};

  return (
    <main style={{
      textAlign: "center",
      fontFamily: "Arial",
      padding: "60px",
      background: "#fff",
      color: "#111"
    }}>
      
      <h1 style={{
        fontSize: "60px",
        letterSpacing: "8px",
        fontWeight: "300"
      }}>
        JUST JESUS
      </h1>

      <p style={{ color: "#777" }}>
        Pure • Set Apart • For His Glory
      </p>

      <hr style={{ margin: "40px 0" }} />

      <h2>SHOP</h2>

      <div style={{ marginTop: "30px" }}>
        <h3>PURE HEART TEE</h3>
        <p>R250</p>
        <button onClick={() => addToCart("Pure Heart Tee", 250)}>
          Add to Cart
        </button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>SET APART HOODIE</h3>
        <p>R500</p>
        <button onClick={() => addToCart("Set Apart Hoodie", 500)}>
          Add to Cart
        </button>
      </div>

      <hr style={{ margin: "40px 0" }} />

      <h2>YOUR CART</h2>

      {cart.length === 0 ? (
        <p>No items yet</p>
      ) : (
        <div>
          {cart.map((item, index) => (
            <p key={index}>
              {item.name} - R{item.price}
            </p>
          ))}

          <h3>Total: R{total}</h3>

          <button
            onClick={checkout}
            disabled={loading}
            style={{ marginTop: "20px" }}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}

    </main>
  );
}