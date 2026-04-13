"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    alert("Logged out successfully");
    router.push("/login");
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>Vehicle Service Management</h2>

      <button
        onClick={() => router.push("/admin")}
        style={pathname === "/admin" ? styles.active : styles.link}
      >
        Dashboard
      </button>

      <button
        onClick={() => router.push("/master")}
        style={pathname === "/master" ? styles.active : styles.link}
      >
        Master Data
      </button>

      <button
        onClick={() => router.push("/billing")}
        style={pathname === "/billing" ? styles.active : styles.link}
      >
        Billing & Dispatch
      </button>

      <button onClick={handleLogout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#2d9c9c",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    borderRight: "1px solid #ddd",
  },

  logo: {
    marginBottom: "30px",
  },

  link: {
    background: "none",
    border: "none",
    padding: "10px",
    textAlign: "left",
    cursor: "pointer",
    marginBottom: "10px",
    fontSize: "15px",
  },

  active: {
    background: "#e0e7ff",
    border: "none",
    padding: "10px",
    textAlign: "left",
    marginBottom: "10px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  logout: {
    marginTop: "auto",
    padding: "10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};