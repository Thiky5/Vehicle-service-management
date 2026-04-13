"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, endpoints } from "../../utils/api";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", icon: "🛡️", desc: "Full system access" },
  { value: "sa", label: "Service Advisor", icon: "🔧", desc: "Manage assigned vehicles" },
  { value: "customer", label: "Customer", icon: "👤", desc: "Track your vehicle" },
];

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if user already exists
      const users = await apiFetch(endpoints.USERS);
      if (users.find((u) => u.email === formData.email)) {
        setError("This email is already registered.");
        setLoading(false);
        return;
      }

      const userId = `U${Date.now()}`;
      const newUser = { ...formData, id: userId };

      // For SA role: also create a serviceAdvisor record
      if (formData.role === "sa") {
        const saId = `SA${Date.now()}`;
        const saRecord = {
          id: saId,
          name: formData.name,
          email: formData.email,
          phone: "",
        };
        await apiFetch(endpoints.SERVICE_ADVISORS, {
          method: "POST",
          body: JSON.stringify(saRecord),
        });
        newUser.saId = saId;
      }

      // For customer role: also create a customer record
      if (formData.role === "customer") {
        const customerId = `C${Date.now()}`;
        const customerRecord = {
          id: customerId,
          name: formData.name,
          email: formData.email,
          phone: "",
        };
        await apiFetch(endpoints.CUSTOMERS, {
          method: "POST",
          body: JSON.stringify(customerRecord),
        });
        newUser.customerId = customerId;
      }

      await apiFetch(endpoints.USERS, {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      alert(`Account created! Login as ${ROLE_OPTIONS.find(r => r.value === formData.role)?.label}.`);
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to register. Please try again.");
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

        {/* Role Selector */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Your Role</label>
          <div style={styles.roleGrid}>
            {ROLE_OPTIONS.map((opt) => {
              const isActive = formData.role === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleRoleSelect(opt.value)}
                  style={{
                    ...styles.roleCard,
                    ...(isActive ? styles.roleCardActive : {}),
                  }}
                >
                  <span style={styles.roleIcon}>{opt.icon}</span>
                  <span style={styles.roleLabel}>{opt.label}</span>
                  <span style={styles.roleDesc}>{opt.desc}</span>
                  {isActive && (
                    <span style={styles.roleCheck}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Name */}
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

        {/* Email */}
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

        {/* Password */}
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

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Creating Account..." : `Sign Up as ${ROLE_OPTIONS.find(r => r.value === formData.role)?.label}`}
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
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundImage: "url('/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(6px)",
  },
  form: {
    position: "relative",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "440px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
    color: "#1e293b",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "6px",
    textAlign: "center",
    background: "linear-gradient(to right, #0891b2, #4f46e5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "28px",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#0891b2",
    marginBottom: "8px",
    letterSpacing: "0.08em",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    color: "#1e293b",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  // Role Grid
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  roleCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "14px 8px",
    borderRadius: "14px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    textAlign: "center",
  },
  roleCardActive: {
    border: "1.5px solid #0891b2",
    background: "#e0f7fa",
    boxShadow: "0 0 12px rgba(8,145,178,0.15)",
  },
  roleIcon: {
    fontSize: "22px",
  },
  roleLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e293b",
  },
  roleDesc: {
    fontSize: "10px",
    color: "#94a3b8",
    lineHeight: "1.3",
  },
  roleCheck: {
    position: "absolute",
    top: "6px",
    right: "8px",
    fontSize: "11px",
    color: "#0891b2",
    fontWeight: "800",
  },

  button: {
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    background: "linear-gradient(to right, #0891B2, #4F46E5)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    transition: "transform 0.2s, opacity 0.2s",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
    textAlign: "center",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },
  link: {
    color: "#0891b2",
    textDecoration: "none",
    fontWeight: "700",
  },
};