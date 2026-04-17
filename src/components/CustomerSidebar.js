"use client";

import { useRouter, usePathname } from "next/navigation";

export default function CustomerSidebar() {
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
        <span style={styles.logoIcon}>🚘</span>
        <h2 style={styles.logo}>Vehicle service management</h2>
      </div>
      <p style={styles.roleTag}>Customer Portal</p>

      <nav style={styles.nav}>
        <button
          onClick={() => router.push("/customer")}
          style={pathname === "/customer" ? styles.active : styles.link}
        >
          <span style={styles.icon}>📋</span> My Vehicle
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
    background: "linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
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
    color: "#67e8f9",
    letterSpacing: "1px",
  },
  roleTag: {
    margin: "0 0 28px 0",
    fontSize: "11px",
    color: "#94a3b8",
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
    background: "rgba(103, 232, 249, 0.15)",
    border: "none",
    padding: "10px 14px",
    textAlign: "left",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    color: "#67e8f9",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderLeft: "3px solid #67e8f9",
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
