"use client";

import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { apiFetch, endpoints } from "../../utils/api";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    apiFetch(endpoints.VEHICLES)
      .then(data => setVehicles(data))
      .catch(err => console.error("Error fetching vehicles:", err));
  }, []);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case "Serviced": return "#22c55e";
      case "Under Servicing": return "#3b82f6";
      case "Due This Week": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  const markComplete = (id) => {
    apiFetch(`${endpoints.VEHICLES}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Serviced" })
    })
    .then(updatedVehicle => {
      setVehicles((prev) => prev.map((v) => v.id === id ? updatedVehicle : v));
    });
  };

  const assignToSA = (id) => {
    apiFetch(`${endpoints.VEHICLES}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Under Servicing" })
    })
    .then(updatedVehicle => {
      setVehicles((prev) => prev.map((v) => v.id === id ? updatedVehicle : v));
      alert("Vehicle assigned to Service Advisor");
    });
  };

  const underServicing = vehicles.filter(
    (v) => v.status === "Under Servicing"
  );
  const servicedVehicles = vehicles.filter(
    (v) => v.status === "Serviced"
  );
  const dueThisWeek = vehicles.filter(
    (v) => v.status === "Due This Week"
  );

  const getVehicleImage = (model) => {
    const m = model.toLowerCase();
    if (m.includes("575") || m.includes("tractor")) return "/vehicles/tractor.png";
    if (m.includes("xuv")) return "/vehicles/suv.png";
    if (m.includes("pickup") || m.includes("bolero")) return "/vehicles/pickup.png";
    if (m.includes("leyland") || m.includes("truck")) return "/vehicles/truck.png";
    return "/vehicles/suv.png"; // Fallback
  };

  return (
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <div style={styles.user}>Admin</div>
        </div>

        <div style={styles.grid}>
          {/* Due This Week */}
          <div style={styles.card}>
            <h3> Due This Week</h3>

            {dueThisWeek.length === 0 ? (
              <p>No vehicles due.</p>
            ) : (
              dueThisWeek.map((v) => (
                <div key={v.id} style={styles.vehicleBox}>
                  <div style={styles.vehicleHeader}>
                    <img src={getVehicleImage(v.model)} alt={v.model} style={styles.thumbnail} />
                    <div>
                      <p style={styles.regNo}>{v.reg}</p>
                      <p style={styles.modelName}>{v.model}</p>
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      style={styles.btn2}
                      onClick={() => setSelectedVehicle(v)}
                    >
                      View Details
                    </button>

                    <button
                      style={styles.assignBtn}
                      onClick={() => assignToSA(v.id)}
                    >
                      Assign to SA
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Under Servicing */}
          <div style={styles.card}>
            <h3> Under Servicing</h3>

            {underServicing.length === 0 ? (
              <p>No vehicles currently under servicing.</p>
            ) : (
              underServicing.map((v) => (
                <div key={v.id} style={styles.vehicleBox}>
                    <div style={styles.vehicleHeader}>
                    <img src={getVehicleImage(v.model)} alt={v.model} style={styles.thumbnail} />
                    <div>
                      <p style={styles.regNo}>{v.reg}</p>
                      <p style={styles.modelName}>{v.model}</p>
                    </div>
                  </div>

                  <button
                    style={styles.btn}
                    onClick={() => markComplete(v.id)}
                  >
                    Mark Complete
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Serviced Vehicles */}
          <div style={styles.card}>
            <h3> Serviced Vehicles</h3>

            {servicedVehicles.length === 0 ? (
              <p>No serviced vehicles yet.</p>
            ) : (
              servicedVehicles.map((v) => (
                <div key={v.id} style={styles.vehicleBox}>
                  <div style={styles.vehicleHeader}>
                    <img src={getVehicleImage(v.model)} alt={v.model} style={styles.thumbnail} />
                    <div>
                      <p style={styles.regNo}>{v.reg}</p>
                      <p style={styles.modelName}>{v.model}</p>
                    </div>
                  </div>

                  <button
                    style={styles.btn2}
                    onClick={() => setSelectedVehicle(v)}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicle Details Modal */}
        {selectedVehicle && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalHeader}>Vehicle Details</h3>

              <div style={styles.modalBody}>
                <div style={styles.detailRow}>
                  <strong>Reg No:</strong> <span>{selectedVehicle.reg}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Model:</strong> <span>{selectedVehicle.model}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Customer ID:</strong> <span>{selectedVehicle.customer}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong>Status:</strong> <span style={{...styles.statusBadge, background: getStatusColor(selectedVehicle.status)}}>{selectedVehicle.status}</span>
                </div>
                {selectedVehicle.totalAmount > 0 && (
                   <div style={styles.detailRow}>
                   <strong>Total Bill:</strong> <span>₹{selectedVehicle.totalAmount}</span>
                 </div>
                )}
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setSelectedVehicle(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
  },

  main: {
    flex: 1,
    padding: "20px",
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/admin_bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    color: "#fff",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
  },

  title: {
    fontSize: "20px",
  },

  user: {
    background: "#6366f1",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },

  vehicleBox: {
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },

  vehicleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "12px",
  },

  thumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    objectFit: "cover",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  regNo: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff",
  },

  modelName: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
  },

  btn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  btn2: {
    padding: "8px 12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  assignBtn: {
    padding: "8px 12px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    width: "350px",
    textAlign: "left",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    color: "#1e293b",
  },

  modalHeader: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#22D3EE",
    textAlign: "center",
  },

  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "25px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f5f9",
  },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
  },

  closeBtn: {
    width: "100%",
    padding: "12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
};