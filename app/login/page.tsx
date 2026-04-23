"use client";

import { useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for login link");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, marginBottom: 10 }}
      />

      <br />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          cursor: "pointer"
        }}
      >
        Send Magic Link
      </button>
    </div>
  );
}