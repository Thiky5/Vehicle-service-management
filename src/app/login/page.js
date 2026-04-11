"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, endpoints } from "../../utils/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const users = await apiFetch(endpoints.USERS);
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }

      router.push("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Enter Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.signup}>
          Don't have an account?{" "}
          <Link href="/signup" style={styles.link}>
            Sign Up
          </Link>
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
    backgroundImage: "url('/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  form: {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "30px",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(4px)",
  },

  title: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#111827",
    fontSize: "24px",
    fontWeight: "bold",
  },

  input: {
    padding: "12px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },

  error: {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },

  signup: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
    color: "#111827",
  },

  link: {
    color: "#0070f3",
    textDecoration: "underline",
    fontWeight: "bold",
  },
};