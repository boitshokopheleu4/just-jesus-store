"use client";

export default function Checkout() {
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST"
      });

      const data = await res.json();

      console.log("Checkout response:", data);

      // 🛑 STOP HERE if order failed
      if (!data.order) {
        alert("Checkout failed — check console");
        console.error("ERROR:", data);
        return;
      }

      const order = data.order;

      const pf = await fetch("/api/payfast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total
        })
      });

      const pfData = await pf.json();

      console.log("PayFast response:", pfData);

      if (!pfData.redirectUrl) {
        console.error("PayFast error:", pfData);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = pfData.redirectUrl;

      Object.entries(pfData.payload).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("Checkout crash:", err);
    }
  };

  return <button onClick={handleCheckout}>Pay Now</button>;
}