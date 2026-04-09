"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (email !== "a@gmail.com" || password !== "123") {
      setError("Invalid admin credentials");
      return;
    }

    router.push("/admin");
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>  Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Enter Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>

        <p style={styles.signup}>
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
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
    background: "rgba(255, 255, 255, 0.88)",
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
  },

  input: {
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: "red",
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
};