"use client";

import Sidebar from "../../components/Sidebar";
import { useState } from "react";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([
    {
      id: "V001",
      reg: "TN-01-AB-1234",
      model: "Honda City",
      status: "Under Servicing",
      customer: "C001",
      serviceDate: "2026-04-08",
    },
    {
      id: "V002",
      reg: "TN-12-PQ-9988",
      model: "Hyundai Creta",
      status: "Serviced",
      customer: "C002",
      serviceDate: "2026-04-07",
    },
    {
      id: "V003",
      reg: "TN-05-XY-5678",
      model: "Tata Nexon",
      status: "Under Servicing",
      customer: "C003",
      serviceDate: "2026-04-10",
    },
    {
      id: "V004",
      reg: "TN-09-UV-1234",
      model: "Maruti Swift",
      status: "Due This Week",
      customer: "C004",
      serviceDate: "2026-04-09",
    },
    {
      id: "V005",
      reg: "TN-02-CD-5678",
      model: "Toyota Innova",
      status: "Due This Week",
      customer: "C005",
      serviceDate: "2026-04-10",
    },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const markComplete = (id) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Serviced" } : v
      )
    );
  };

  const assignToSA = (id) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Under Servicing" } : v
      )
    );
    alert("Vehicle assigned to Service Advisor");
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
                  <p>{v.reg}</p>
                  <p>{v.model}</p>

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
                  <p>{v.reg}</p>
                  <p>{v.model}</p>

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
                  <p>{v.reg}</p>
                  <p>{v.model}</p>

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
              <h3>Vehicle Details</h3>

              <p>
                <strong>Reg No:</strong> {selectedVehicle.reg}
              </p>

              <p>
                <strong>Model:</strong> {selectedVehicle.model}
              </p>

              <p>
                <strong>Customer:</strong> {selectedVehicle.customer}
              </p>

              <p>
                <strong>Service Date:</strong>{" "}
                {selectedVehicle.serviceDate}
              </p>

              <p>
                <strong>Status:</strong> {selectedVehicle.status}
              </p>

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
    background: "#ffffff",
    minHeight: "100vh",
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
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  vehicleBox: {
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
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
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
  },

  closeBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};