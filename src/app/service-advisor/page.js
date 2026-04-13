"use client";

import SASidebar from "../../components/SASidebar";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, endpoints } from "../../utils/api";
import { getVehicleImage } from "../../utils/vehicleImages";
import "./sa.css";

export default function ServiceAdvisorPage() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [bomState, setBomState] = useState({}); // { vehicleId: { workItemId: qty } }
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    }
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      apiFetch(endpoints.VEHICLES),
      apiFetch(endpoints.WORK_ITEMS),
    ]).then(([vData, wData]) => {
      // Filter vehicles assigned to this SA
      const myVehicles = vData.filter((v) => v.assignedSA === user.saId);
      setVehicles(myVehicles);
      setWorkItems(wData);

      // Seed BOM state from existing billableItems
      const initial = {};
      myVehicles.forEach((v) => {
        initial[v.id] = {};
        (v.billableItems || []).forEach((item) => {
          initial[v.id][item.id] = item.quantity || 1;
        });
      });
      setBomState(initial);
    });
  }, [user]);

  const getVehicleBom = (vehicleId) => bomState[vehicleId] || {};

  const isItemSelected = (vehicleId, itemId) =>
    (bomState[vehicleId]?.[itemId] || 0) > 0;

  const toggleItem = (vehicleId, item) => {
    setBomState((prev) => {
      const vBom = { ...(prev[vehicleId] || {}) };
      if (vBom[item.id]) {
        delete vBom[item.id];
      } else {
        vBom[item.id] = 1;
      }
      return { ...prev, [vehicleId]: vBom };
    });
  };

  const changeQty = (vehicleId, itemId, delta) => {
    setBomState((prev) => {
      const vBom = { ...(prev[vehicleId] || {}) };
      const current = vBom[itemId] || 1;
      const next = current + delta;
      if (next <= 0) {
        delete vBom[itemId];
      } else {
        vBom[itemId] = next;
      }
      return { ...prev, [vehicleId]: vBom };
    });
  };

  const calcTotal = (vehicleId) => {
    const vBom = getVehicleBom(vehicleId);
    return workItems.reduce((acc, item) => {
      const qty = vBom[item.id] || 0;
      return acc + item.price * qty;
    }, 0);
  };

  const buildBillableItems = (vehicleId) => {
    const vBom = getVehicleBom(vehicleId);
    return workItems
      .filter((item) => vBom[item.id])
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: vBom[item.id],
      }));
  };

  const handleSaveBom = async (vehicle) => {
    setSaving((s) => ({ ...s, [vehicle.id]: "saving" }));
    const billableItems = buildBillableItems(vehicle.id);
    const totalAmount = calcTotal(vehicle.id);

    const updated = await apiFetch(`${endpoints.VEHICLES}/${vehicle.id}`, {
      method: "PATCH",
      body: JSON.stringify({ billableItems, totalAmount }),
    });

    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? updated : v)));
    setSaving((s) => ({ ...s, [vehicle.id]: "" }));
    showToast("✅ BOM saved successfully!");
  };

  const handleMarkComplete = async (vehicle) => {
    setSaving((s) => ({ ...s, [vehicle.id]: "completing" }));
    // First save BOM, then mark complete
    const billableItems = buildBillableItems(vehicle.id);
    const totalAmount = calcTotal(vehicle.id);

    const updated = await apiFetch(`${endpoints.VEHICLES}/${vehicle.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        billableItems,
        totalAmount,
        status: "Serviced",
        serviceCompletedAt: new Date().toISOString(),
      }),
    });

    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? updated : v)));
    setSaving((s) => ({ ...s, [vehicle.id]: "" }));
    showToast("🎉 Service marked as complete! Admin can now process billing.");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Serviced": return "#22c55e";
      case "Under Servicing": return "#38bdf8";
      case "Due This Week": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="sa-container">
      <SASidebar />

      <div className="sa-main">
        <div className="sa-topbar">
          <h1 className="sa-title">My Assigned Vehicles</h1>
          <div className="sa-user-badge">👤 {user.name}</div>
        </div>
        <p className="sa-subtitle">
          {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} assigned to you
        </p>

        {vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <div className="empty-title">No Vehicles Assigned</div>
            <p className="empty-desc">
              The admin hasn&apos;t assigned any vehicles to you yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="sa-grid">
            {vehicles.map((vehicle) => {
              const vBom = getVehicleBom(vehicle.id);
              const isCompleted = vehicle.status === "Serviced";

              return (
                <div key={vehicle.id} className="sa-vehicle-card">
                  {/* Vehicle Header */}
                  <div className="card-vehicle-header">
                    <img
                      src={getVehicleImage(vehicle.model)}
                      alt={vehicle.model}
                      className="card-thumb"
                    />
                    <div>
                      <p className="card-reg">{vehicle.reg}</p>
                      <p className="card-model">{vehicle.model}</p>
                      <span
                        className="status-pill"
                        style={{
                          background: getStatusColor(vehicle.status) + "22",
                          color: getStatusColor(vehicle.status),
                          border: `1px solid ${getStatusColor(vehicle.status)}55`,
                        }}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  </div>

                  <hr className="divider" />

                  {/* BOM Section */}
                  <p className="bom-title">Bill of Materials</p>

                  {workItems.map((item) => {
                    const qty = vBom[item.id] || 0;
                    const selected = qty > 0;

                    return (
                      <div key={item.id} className="work-item-row">
                        <input
                          type="checkbox"
                          className="work-item-check"
                          checked={selected}
                          onChange={() => !isCompleted && toggleItem(vehicle.id, item)}
                          disabled={isCompleted}
                          id={`${vehicle.id}-${item.id}`}
                        />
                        <label
                          htmlFor={`${vehicle.id}-${item.id}`}
                          className="work-item-name"
                          style={{ cursor: isCompleted ? "default" : "pointer" }}
                        >
                          {item.name}
                        </label>

                        {selected && !isCompleted && (
                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => changeQty(vehicle.id, item.id, -1)}
                            >
                              −
                            </button>
                            <span className="qty-display">{qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => changeQty(vehicle.id, item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                        {selected && isCompleted && (
                          <span className="qty-display" style={{ color: "#94a3b8" }}>×{qty}</span>
                        )}

                        <span className="work-item-price">₹{item.price}</span>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="bom-summary">
                    <span className="bom-label">Estimated Total</span>
                    <span className="bom-total">
                      ₹{calcTotal(vehicle.id).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-actions">
                    {isCompleted ? (
                      <div className="completed-badge">✅ Service Completed — Awaiting Admin Billing</div>
                    ) : (
                      <>
                        <button
                          className="save-bom-btn"
                          onClick={() => handleSaveBom(vehicle)}
                          disabled={saving[vehicle.id] === "saving"}
                        >
                          {saving[vehicle.id] === "saving" ? "Saving..." : "💾 Save BOM"}
                        </button>
                        <button
                          className="complete-btn"
                          onClick={() => handleMarkComplete(vehicle)}
                          disabled={
                            saving[vehicle.id] === "completing" ||
                            Object.keys(vBom).length === 0
                          }
                          title={
                            Object.keys(vBom).length === 0
                              ? "Add at least one service item first"
                              : "Mark this vehicle as serviced"
                          }
                        >
                          {saving[vehicle.id] === "completing"
                            ? "Processing..."
                            : "✔ Mark Complete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
