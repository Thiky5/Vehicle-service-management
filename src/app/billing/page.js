"use client";

import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";

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
        const [vMsg, wMsg, cMsg] = await Promise.all([
          fetch("http://localhost:3001/vehicles"),
          fetch("http://localhost:3001/workItems"),
          fetch("http://localhost:3001/customers"),
        ]);
        const vData = await vMsg.json();
        const wData = await wMsg.json();
        const cData = await cMsg.json();
        
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
    
    const updatedVehicle = {
      ...selectedVehicle,
      billableItems: selectedWorkItems,
      totalAmount: total,
    };

    try {
      const res = await fetch(`http://localhost:3001/vehicles/${selectedVehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billableItems: selectedWorkItems,
          totalAmount: total,
        }),
      });
      const data = await res.json();
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
      const res = await fetch(`http://localhost:3001/vehicles/${selectedVehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "Paid" }),
      });
      const data = await res.json();
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
      const res = await fetch(`http://localhost:3001/vehicles/${selectedVehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDispatched: true, status: "Dispatched" }),
      });
      const data = await res.json();
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
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Billing & Dispatch</h1>
          <div style={styles.user}>Admin</div>
        </div>

        <div style={styles.content}>
          <div style={styles.listSection}>
            <h2 style={styles.sectionHeader}>Vehicles Ready for Billing</h2>
            {loading ? <p>Loading...</p> : (
              servicedVehicles.length === 0 ? <p>No serviced vehicles pending billing.</p> : (
                <div style={styles.grid}>
                  {servicedVehicles.map(v => (
                    <div key={v.id} style={styles.card}>
                      <div style={styles.cardInfo}>
                        <h3 style={styles.reg}>{v.reg}</h3>
                        <p style={styles.model}>{v.model}</p>
                        <p style={styles.customer}>Owner: {getCustomerName(v.customer)}</p>
                      </div>
                      <button 
                        style={styles.reviewBtn}
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
            <div style={styles.billingSide}>
              <div style={styles.billingCard}>
                <div style={styles.billingHeader}>
                  <h3>Billing Details - {selectedVehicle.reg}</h3>
                  <button style={styles.closeBtn} onClick={() => setSelectedVehicle(null)}>×</button>
                </div>

                <div style={styles.workItemsSelection}>
                  <h4>Select Work Items</h4>
                  <div style={styles.workList}>
                    {workItems.map(item => (
                      <label key={item.id} style={styles.workItemLabel}>
                        <input 
                          type="checkbox" 
                          checked={selectedWorkItems.some(i => i.id === item.id)}
                          onChange={() => handleToggleWorkItem(item)}
                          disabled={selectedVehicle.paymentStatus === "Paid"}
                        />
                        <span>{item.name}</span>
                        <span style={styles.price}>₹{item.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.invoiceSummary}>
                  <div style={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div style={{...styles.summaryRow, fontWeight: "bold", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", marginTop: "10px"}}>
                    <span>Grand Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  {selectedVehicle.paymentStatus !== "Paid" ? (
                    <>
                      <button style={styles.primaryBtn} onClick={handleGenerateInvoice}>Update Invoice</button>
                      <button 
                        style={styles.payBtn} 
                        onClick={handleProcessPayment}
                        disabled={calculateTotal() === 0}
                      >
                        Process Payment
                      </button>
                    </>
                  ) : (
                    <div style={styles.paidStatus}>
                      <span style={styles.paidBadge}>PAID</span>
                      <button style={styles.dispatchBtn} onClick={handleDispatch}>Dispatch Vehicle</button>
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

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  main: {
    flex: 1,
    padding: "40px",
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%), url('/billing_bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    overflowY: "auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(to right, #22d3ee, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  user: {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#818cf8",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid rgba(99, 102, 241, 0.3)",
  },
  content: {
    display: "flex",
    gap: "30px",
  },
  listSection: {
    flex: 2,
  },
  sectionHeader: {
    fontSize: "20px",
    marginBottom: "20px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s, background 0.2s",
    ":hover": {
      transform: "translateY(-4px)",
      background: "rgba(255, 255, 255, 0.05)",
    }
  },
  cardInfo: {
    marginBottom: "20px",
  },
  reg: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
    color: "#22d3ee",
  },
  model: {
    fontSize: "16px",
    margin: "0 0 8px 0",
    color: "#f1f5f9",
  },
  customer: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  reviewBtn: {
    padding: "12px",
    background: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
    ":hover": {
      background: "#3b82f6",
      color: "white",
    }
  },
  billingSide: {
    flex: 1.2,
  },
  billingCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(40px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    padding: "30px",
    position: "sticky",
    top: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  billingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "15px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer",
  },
  workItemsSelection: {
    marginBottom: "24px",
  },
  workList: {
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "10px",
  },
  workItemLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "8px",
    background: "rgba(255,255,255,0.02)",
    cursor: "pointer",
    transition: "background 0.2s",
    ":hover": {
      background: "rgba(255,255,255,0.05)",
    }
  },
  price: {
    marginLeft: "auto",
    color: "#22d3ee",
    fontWeight: "600",
  },
  invoiceSummary: {
    background: "rgba(0,0,0,0.2)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    color: "#cbd5e1",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryBtn: {
    padding: "14px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  payBtn: {
    padding: "14px",
    background: "linear-gradient(to right, #22c55e, #10b981)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.3)",
  },
  paidStatus: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },
  paidBadge: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
    padding: "8px 20px",
    borderRadius: "20px",
    fontWeight: "bold",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  dispatchBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(to right, #f59e0b, #ea580c)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
  }
};
