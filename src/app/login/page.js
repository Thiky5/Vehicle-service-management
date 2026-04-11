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

      // Store basic user data in session (optional but helpful)
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
      <div style={styles.overlay} />
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.logoContainer}>
            <div style={styles.logo}>V</div>
            <h2 style={styles.title}>Welcome Back</h2>
        </div>
        
        <p style={styles.subtitle}>Enter your credentials to access the dashboard</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Admin Email</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Authenticating..." : "Login to System"}
        </button>

        <p style={styles.signup}>
          New to the platform?{" "}
          <Link href="/signup" style={styles.link}> Create Account</Link>
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
    background: "rgba(15, 23, 42, 0.7)", 
    backdropFilter: "blur(10px)",
  },
  form: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "40px",
    borderRadius: "28px",
    width: "420px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(20px)",
    color: "#fff",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logo: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #22D3EE, #818CF8)",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "900",
    color: "#fff",
    marginBottom: "16px",
    boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(to bottom, #fff, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94A3B8",
    marginBottom: "32px",
    textAlign: "center",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#FCA5A5",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "20px",
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
    padding: "14px 18px",
    borderRadius: "14px",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s",
  },
  button: {
    width: "100%",
    padding: "16px",
    marginTop: "10px",
    background: "linear-gradient(to right, #0891B2, #4F46E5)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s",
  },
  signup: {
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