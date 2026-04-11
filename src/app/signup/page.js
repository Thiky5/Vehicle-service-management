"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, endpoints } from "../../utils/api";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" // Defaulting to admin for this application
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if user already exists
      const users = await apiFetch(endpoints.USERS);
      if (users.find(u => u.email === formData.email)) {
        alert("Email already registered!");
        setLoading(false);
        return;
      }

      // Add new user
      await apiFetch(endpoints.USERS, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          id: `U${Date.now()}`
        })
      });

      alert("Registration successful! You can now login.");
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our premium vehicle management system</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>Log In</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundImage: "url('/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "'Inter', sans-serif",
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15, 23, 42, 0.7)", // Deep navy overlay
    backdropFilter: "blur(8px)",
  },
  form: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "40px",
    borderRadius: "24px",
    width: "400px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(16px)",
    color: "#fff",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "8px",
    textAlign: "center",
    background: "linear-gradient(to right, #22D3EE, #818CF8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94A3B8",
    marginBottom: "32px",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#22D3EE",
    marginBottom: "8px",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    background: "linear-gradient(to right, #0891B2, #4F46E5)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
    color: "#94A3B8",
  },
  link: {
    color: "#22D3EE",
    textDecoration: "none",
    fontWeight: "bold",
  }
};