"use client";

import { useRouter, usePathname } from "next/navigation";

export default function SASidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <span style={styles.logoIcon}>🔧</span>
        <h2 style={styles.logo}>VSM</h2>
      </div>
      <p style={styles.roleTag}>Service Advisor</p>

      <nav style={styles.nav}>
        <button
          onClick={() => router.push("/service-advisor")}
          style={pathname === "/service-advisor" ? styles.active : styles.link}
        >
          <span style={styles.icon}>🚗</span> My Vehicles
        </button>
      </nav>

      <button onClick={handleLogout} style={styles.logout}>
        <span style={styles.icon}>🚪</span> Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  logoIcon: {
    fontSize: "22px",
  },
  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "1px",
  },
  roleTag: {
    margin: "0 0 28px 0",
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    paddingLeft: "4px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  link: {
    background: "none",
    border: "none",
    padding: "10px 14px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    color: "#94a3b8",
    borderRadius: "8px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  active: {
    background: "rgba(56, 189, 248, 0.15)",
    border: "none",
    padding: "10px 14px",
    textAlign: "left",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderLeft: "3px solid #38bdf8",
  },
  icon: {
    fontSize: "16px",
  },
  logout: {
    marginTop: "auto",
    padding: "10px 14px",
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.2s",
  },
};
