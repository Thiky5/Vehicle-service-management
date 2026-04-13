"use client";

import CustomerSidebar from "../../components/CustomerSidebar";
import { useState, useEffect } from "react";
import { apiFetch, endpoints } from "../../utils/api";
import { getVehicleImage } from "../../utils/vehicleImages";
import { printInvoice } from "../../utils/invoicePdf";
import "./customer.css";

const STATUS_STEPS = [
  { key: "awaiting", label: "Awaiting", icon: "🕐" },
  { key: "servicing", label: "Under Servicing", icon: "🔧" },
  { key: "ready", label: "Ready for Pickup", icon: "✅" },
];

function getStepIndex(status) {
  if (status === "Due This Week") return 0;
  if (status === "Under Servicing") return 1;
  if (status === "Serviced" || status === "Dispatched") return 2;
  return 0;
}

export default function CustomerPage() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Vehicle Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ reg: "", model: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch(endpoints.VEHICLES),
      apiFetch(endpoints.CUSTOMERS),
    ]).then(([vData, cData]) => {
      const myVehicles = vData.filter((v) => v.customer === user.customerId);
      setVehicles(myVehicles);
      setCustomers(cData);
      setLoading(false);
    });
  }, [user]);

  const getCustomerName = () => {
    if (!user) return "Customer";
    const c = customers.find((c) => c.id === user.customerId);
    return c ? c.name : user.name;
  };

  const activeVehicles = vehicles.filter((v) => !v.isDispatched);
  const historyVehicles = vehicles.filter((v) => v.isDispatched);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  // Add Vehicle handler
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.reg.trim() || !addForm.model.trim()) {
      setAddError("Please fill in all fields.");
      return;
    }
    setAddLoading(true);
    try {
      const newVehicle = {
        id: `V${Date.now()}`,
        reg: addForm.reg.trim().toUpperCase(),
        model: addForm.model.trim(),
        customer: user.customerId,
        status: "Due This Week",
        assignedSA: null,
        billableItems: [],
        totalAmount: 0,
        paymentStatus: "Pending",
        isDispatched: false,
        serviceCompletedAt: null,
      };
      const created = await apiFetch(endpoints.VEHICLES, {
        method: "POST",
        body: JSON.stringify(newVehicle),
      });
      setVehicles((prev) => [...prev, created]);
      setShowAddModal(false);
      setAddForm({ reg: "", model: "" });
    } catch (err) {
      setAddError("Failed to add vehicle. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f2027", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="customer-container">
      <CustomerSidebar />

      <div className="customer-main">
        {/* Topbar */}
        <div className="customer-topbar">
          <h1 className="customer-title">Welcome, {user.name} 👋</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="add-vehicle-btn" onClick={() => { setShowAddModal(true); setAddError(""); setAddForm({ reg: "", model: "" }); }}>
              + Add Vehicle
            </button>
            <div className="customer-badge">Customer Portal</div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#64748b", fontSize: "15px" }}>Loading vehicle data...</p>
        ) : (
          <>
            {/* Active Vehicles */}
            <div className="active-section">
              <h2 className="section-title">🚗 Active Vehicle Status</h2>

              {activeVehicles.length === 0 ? (
                <div className="no-vehicle">
                  No active vehicles found.{" "}
                  <span
                    style={{ color: "#67e8f9", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add your vehicle
                  </span>{" "}to get started.
                </div>
              ) : (
                activeVehicles.map((vehicle) => {
                  const stepIndex = getStepIndex(vehicle.status);
                  return (
                    <div key={vehicle.id} className="status-tracker">
                      <div className="tracker-header">
                        <div className="tracker-vehicle-info">
                          <h2>{vehicle.reg}</h2>
                          <p>{vehicle.model}</p>
                        </div>
                        <img src={getVehicleImage(vehicle.model)} alt={vehicle.model} className="tracker-thumb" />
                      </div>

                      {/* Progress Steps */}
                      <div className="progress-steps">
                        {STATUS_STEPS.map((step, idx) => (
                          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "0 0 auto" }}>
                              <div className={`step-circle ${idx < stepIndex ? "done" : idx === stepIndex ? "active" : ""}`}>
                                {step.icon}
                              </div>
                              <span className={`step-label ${idx < stepIndex ? "done" : idx === stepIndex ? "active" : ""}`}>
                                {step.label}
                              </span>
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                              <div className={`step-connector ${idx < stepIndex ? "done" : ""}`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* BOM preview if serviced */}
                      {vehicle.status === "Serviced" && vehicle.billableItems?.length > 0 && (
                        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Services Performed
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                            {vehicle.billableItems.map((item) => (
                              <span key={item.id} className="history-item-tag">
                                {item.name} ×{item.quantity || 1}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Total Amount</span>
                            <span style={{ fontSize: "20px", fontWeight: "800", color: "#67e8f9" }}>
                              ₹{(vehicle.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Service History */}
            <div>
              <h2 className="section-title">📜 Service History</h2>
              {historyVehicles.length === 0 ? (
                <div className="no-history">No past service records found yet.</div>
              ) : (
                <div className="history-cards">
                  {historyVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="history-card">
                      <div className="history-card-header">
                        <div>
                          <div className="history-reg">{vehicle.reg}</div>
                          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{vehicle.model}</div>
                        </div>
                        <div className="history-date">{formatDate(vehicle.serviceCompletedAt)}</div>
                      </div>

                      <div className="history-items">
                        {(vehicle.billableItems || []).map((item) => (
                          <span key={item.id} className="history-item-tag">
                            {item.name} ×{item.quantity || 1}
                          </span>
                        ))}
                        {(!vehicle.billableItems || vehicle.billableItems.length === 0) && (
                          <span style={{ color: "#64748b", fontSize: "13px" }}>No service items recorded</span>
                        )}
                      </div>

                      <div className="history-footer">
                        <div className="history-total">
                          ₹{(vehicle.totalAmount || 0).toLocaleString("en-IN")}
                          <span style={{ fontSize: "12px", color: "#22c55e", marginLeft: "8px", fontWeight: "600" }}>PAID</span>
                        </div>
                        <button className="download-btn" onClick={() => printInvoice(vehicle, getCustomerName())}>
                          🖨️ Download Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-vehicle-modal">
            <div className="modal-header">
              <h3 className="modal-title">🚗 Add Your Vehicle</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <p className="modal-subtitle">Register your vehicle to start tracking its service status.</p>

            <form onSubmit={handleAddVehicle}>
              <div className="modal-field">
                <label className="modal-label">Registration Number</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. TN-52-AB-1234"
                  value={addForm.reg}
                  onChange={(e) => setAddForm({ ...addForm, reg: e.target.value })}
                  required
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Vehicle Model</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Mahindra XUV, Ashok Leyland"
                  value={addForm.model}
                  onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                  required
                />
              </div>

              {addError && <p className="modal-error">{addError}</p>}

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={addLoading}>
                  {addLoading ? "Adding..." : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
