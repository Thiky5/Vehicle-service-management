"use client";

import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { apiFetch, endpoints } from "../../utils/api";
import "./billing.css";

export default function BillingPage() {
  const [vehicles, setVehicles] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedWorkItems, setSelectedWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, wData, cData] = await Promise.all([
          apiFetch(endpoints.VEHICLES),
          apiFetch(endpoints.WORK_ITEMS),
          apiFetch(endpoints.CUSTOMERS),
        ]);
        
        setVehicles(vData);
        setWorkItems(wData);
        setCustomers(cData);
      } catch (err) {
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const servicedVehicles = vehicles.filter(v => v.status === "Serviced" && !v.isDispatched);

  const handleToggleWorkItem = (item) => {
    setSelectedWorkItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const calculateTotal = () => {
    return selectedWorkItems.reduce((acc, item) => acc + parseInt(item.price), 0);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedVehicle) return;
    const total = calculateTotal();

    try {
      const data = await apiFetch(`${endpoints.VEHICLES}/${selectedVehicle.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          billableItems: selectedWorkItems,
          totalAmount: total,
        }),
      });
      setVehicles(prev => prev.map(v => v.id === data.id ? data : v));
      setSelectedVehicle(data);
      alert("Invoice Generated Successfully!");
    } catch (err) {
      console.error("Error generating invoice:", err);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedVehicle) return;

    try {
      const data = await apiFetch(`${endpoints.VEHICLES}/${selectedVehicle.id}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "Paid" }),
      });
      setVehicles(prev => prev.map(v => v.id === data.id ? data : v));
      setSelectedVehicle(data);
      alert("Payment Processed Successfully!");
    } catch (err) {
      console.error("Error processing payment:", err);
    }
  };

  const handleDispatch = async () => {
    if (!selectedVehicle) return;
    if (selectedVehicle.paymentStatus !== "Paid") {
      alert("Please process payment before dispatching!");
      return;
    }

    try {
      const data = await apiFetch(`${endpoints.VEHICLES}/${selectedVehicle.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isDispatched: true, status: "Dispatched" }),
      });
      setVehicles(prev => prev.filter(v => v.id !== data.id));
      setSelectedVehicle(null);
      setSelectedWorkItems([]);
      alert("Vehicle Dispatched Successfully!");
    } catch (err) {
      console.error("Error dispatching vehicle:", err);
    }
  };

  const getCustomerName = (cId) => {
    const customer = customers.find(c => c.id === cId);
    return customer ? customer.name : "Unknown";
  };

  return (
    <div className="billing-container">
      <Sidebar />

      <div className="billing-main">
        <div className="billing-topbar">
          <h1 className="billing-title">Billing & Dispatch</h1>
          <div className="billing-user">Admin</div>
        </div>

        <div className="billing-content">
          <div className="list-section">
            <h2 className="section-header">Vehicles Ready for Billing</h2>
            {loading ? <p>Loading...</p> : (
              servicedVehicles.length === 0 ? <p>No serviced vehicles pending billing.</p> : (
                <div className="billing-grid">
                  {servicedVehicles.map(v => (
                    <div key={v.id} className="vehicle-card">
                      <div className="card-info">
                        <h3 className="reg-no">{v.reg}</h3>
                        <p className="model-name">{v.model}</p>
                        <p className="owner-name">Owner: {getCustomerName(v.customer)}</p>
                      </div>
                      <button 
                        className="review-btn"
                        onClick={() => {
                          setSelectedVehicle(v);
                          setSelectedWorkItems(v.billableItems || []);
                        }}
                      >
                        Review & Bill
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {selectedVehicle && (
            <div className="billing-side">
              <div className="sidebar-card">
                <div className="sidebar-header">
                  <h3>Billing Details - {selectedVehicle.reg}</h3>
                  <button className="close-btn" onClick={() => setSelectedVehicle(null)}>×</button>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h4>Select Work Items</h4>
                  <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
                    {workItems.map(item => (
                      <label key={item.id} className="workItem-label">
                        <input 
                          type="checkbox" 
                          checked={selectedWorkItems.some(i => i.id === item.id)}
                          onChange={() => handleToggleWorkItem(item)}
                          disabled={selectedVehicle.paymentStatus === "Paid"}
                        />
                        <span>{item.name}</span>
                        <span className="price-tag">₹{item.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="invoice-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span>Grand Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  {selectedVehicle.paymentStatus !== "Paid" ? (
                    <>
                      <button className="update-invoice-btn" onClick={handleGenerateInvoice}>Update Invoice</button>
                      <button 
                        className="process-payment-btn" 
                        onClick={handleProcessPayment}
                        disabled={calculateTotal() === 0}
                      >
                        Process Payment
                      </button>
                    </>
                  ) : (
                    <div className="paid-status-container">
                      <span className="paid-label">PAID</span>
                      <button className="dispatch-vehicle-btn" onClick={handleDispatch}>Dispatch Vehicle</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
