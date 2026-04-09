"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can call your API here to save user data
    console.log("Signup Data:", formData);
    alert("Signup successful!");
    router.push("/"); // redirect to home after signup
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 30, borderRadius: 10, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: 20 }}>Sign Up</h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <button type="submit" style={submitBtnStyle}>Sign Up</button>
      </form>
    </div>
  );
}

// Styles
const inputStyle = { display: "block", width: "100%", marginBottom: 15, padding: 10, borderRadius: 5, border: "1px solid #ccc" };
const submitBtnStyle = { width: "100%", padding: 10, background: "#6366f1", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" };