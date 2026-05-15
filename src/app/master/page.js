"use client";

import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { apiFetch, endpoints } from "../../utils/api";

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [search, setSearch] = useState("");

  // ===== Master Data States =====
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [serviceAdvisors, setServiceAdvisors] = useState([]);
  const [workItems, setWorkItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, cData, saData, wData] = await Promise.all([
          apiFetch(endpoints.VEHICLES),
          apiFetch(endpoints.CUSTOMERS),
          apiFetch(endpoints.SERVICE_ADVISORS),
          apiFetch(endpoints.WORK_ITEMS)
        ]);
        setVehicles(vData);
        setCustomers(cData);
        setServiceAdvisors(saData);
        setWorkItems(wData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchData();
  }, []);

  // ===== Form States =====
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [editingId, setEditingId] = useState(null);

  // ===== CREATE & UPDATE =====
  const handleAddOrUpdate = async () => {
    let endpoint = "";
    let setState = null;

    if (activeTab === "vehicles") {
      if (!newItem.id || !newItem.reg || !newItem.customer || !newItem.model || !newItem.status) return alert("Fill all fields");
      endpoint = "vehicles"; setState = setVehicles;
    } else if (activeTab === "customers") {
      if (!newItem.id || !newItem.name || !newItem.email || !newItem.phone) return alert("Fill all fields");
      endpoint = "customers"; setState = setCustomers;
    } else if (activeTab === "Service Advisor") {
      if (!newItem.id || !newItem.name || !newItem.email || !newItem.phone) return alert("Fill all fields");
      endpoint = "serviceAdvisors"; setState = setServiceAdvisors;
    } else if (activeTab === "work") {
      if (!newItem.id || !newItem.name || !newItem.price) return alert("Fill all fields");
      endpoint = "workItems"; setState = setWorkItems;
    }

    try {
      if (editingId) {
        const updated = await apiFetch(`${endpoint}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(newItem)
        });
        setState(prev => prev.map(item => item.id === editingId ? updated : item));
      } else {
        const added = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify({
            ...newItem,
            billableItems: activeTab === "vehicles" ? [] : newItem.billableItems,
            totalAmount: activeTab === "vehicles" ? 0 : newItem.totalAmount,
            paymentStatus: activeTab === "vehicles" ? "Pending" : newItem.paymentStatus,
            isDispatched: activeTab === "vehicles" ? false : newItem.isDispatched
          })
        });
        setState(prev => [...prev, added]);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }

    setNewItem({});
    setEditingId(null);
    setShowForm(false);
  };

  // ===== DELETE =====
  const handleDelete = async (id) => {
    let endpoint = "";
    let setState = null;

    if (activeTab === "vehicles") { endpoint = "vehicles"; setState = setVehicles; }
    else if (activeTab === "customers") { endpoint = "customers"; setState = setCustomers; }
    else if (activeTab === "Service Advisor") { endpoint = "serviceAdvisors"; setState = setServiceAdvisors; }
    else if (activeTab === "work") { endpoint = "workItems"; setState = setWorkItems; }

    try {
      await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
      setState(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setNewItem(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  // ===== SEARCH FILTER =====
  const filteredVehicles = vehicles.filter(v =>
    (v.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (v.reg?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (v.customer?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (v.model?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (v.status?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    (c.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.phone?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const filteredSAs = serviceAdvisors.filter(sa =>
    (sa.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (sa.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (sa.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (sa.phone?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const filteredWorkItems = workItems.filter(w =>
    (w.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (w.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (w.price + "").includes(search)
  );

  // ===== RENDER TABLE =====
  const renderTable = (data, headers, rowMapper) => (
    <table style={tableStyle}>
      <thead style={theadStyle}>
        <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
            {rowMapper(item).map((v, i) => <td key={i} style={tdStyle}>{v}</td>)}
            <td>
              <button style={editBtnStyle} onClick={() => handleEdit(item)}>Edit</button>
              <button style={deleteBtnStyle} onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{
        flex: 1,
        padding: 20,
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/master_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        color: "#E2E8F0"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ color: "#22D3EE" }}>Master Data</h1>
          <div style={{ width: 32, height: 32, background: "#22D3EE", color: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>A</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
          {["vehicles", "customers", "Service Advisor", "work"].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); setSearch(""); }}
              style={{
                border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #22D3EE" : "none",
                color: activeTab === tab ? "#22D3EE" : "#94A3B8",
                fontWeight: activeTab === tab ? "bold" : "normal", padding: 8
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <button style={addBtnStyle} onClick={() => { setShowForm(!showForm); setEditingId(null); setNewItem({}); }}>+ Add New</button>
          <input type="text" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} style={searchInputStyle} />
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ 
            marginBottom: 20, 
            background: "rgba(255, 255, 255, 0.05)", 
            padding: 15, 
            borderRadius: 8, 
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <h4 style={{ color: "#22D3EE", marginBottom: 10 }}>{editingId ? "Edit" : "Add New"} {activeTab}</h4>
            {activeTab === "vehicles" && (
              <>
                <input placeholder="ID" value={newItem.id || ""} onChange={e => setNewItem({ ...newItem, id: e.target.value })} style={inputStyle} />
                <input placeholder="Reg No" value={newItem.reg || ""} onChange={e => setNewItem({ ...newItem, reg: e.target.value })} style={inputStyle} />
                <input placeholder="Customer ID" value={newItem.customer || ""} onChange={e => setNewItem({ ...newItem, customer: e.target.value })} style={inputStyle} />
                <input placeholder="Model" value={newItem.model || ""} onChange={e => setNewItem({ ...newItem, model: e.target.value })} style={inputStyle} />
                 <select 
                  value={newItem.status || ""} 
                  onChange={e => setNewItem({ ...newItem, status: e.target.value })} 
                  style={{...inputStyle, background: "rgba(0, 0, 0, 0.5)", color: "#22D3EE", fontWeight: "bold"}}
                >
                  <option value="" disabled style={{background: "#000"}}>Select Status</option>
                  <option value="Due This Week" style={{background: "#000"}}>Due This Week</option>
                  <option value="Under Servicing" style={{background: "#000"}}>Under Servicing</option>
                  <option value="Serviced" style={{background: "#000"}}>Serviced</option>
                </select>
              </>
            )}
            {activeTab === "customers" && (
              <>
                <input placeholder="ID" value={newItem.id || ""} onChange={e => setNewItem({ ...newItem, id: e.target.value })} style={inputStyle} />
                <input placeholder="Name" value={newItem.name || ""} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} />
                <input placeholder="Email" value={newItem.email || ""} onChange={e => setNewItem({ ...newItem, email: e.target.value })} style={inputStyle} />
                <input placeholder="Phone" value={newItem.phone || ""} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} style={inputStyle} />
              </>
            )}
            {activeTab === "Service Advisor" && (
              <>
                <input placeholder="ID" value={newItem.id || ""} onChange={e => setNewItem({ ...newItem, id: e.target.value })} style={inputStyle} />
                <input placeholder="Name" value={newItem.name || ""} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} />
                <input placeholder="Email" value={newItem.email || ""} onChange={e => setNewItem({ ...newItem, email: e.target.value })} style={inputStyle} />
                <input placeholder="Phone" value={newItem.phone || ""} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} style={inputStyle} />
              </>
            )}
            {activeTab === "work" && (
              <>
                <input placeholder="ID" value={newItem.id || ""} onChange={e => setNewItem({ ...newItem, id: e.target.value })} style={inputStyle} />
                <input placeholder="Name" value={newItem.name || ""} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} />
                <input placeholder="Price" type="number" value={newItem.price || ""} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={inputStyle} />
              </>
            )}
            <button style={{ ...addBtnStyle, background: "#22c55e" }} onClick={handleAddOrUpdate}>{editingId ? "Update" : "Add"}</button>
          </div>
        )}

        {/* Render Tables */}
        {activeTab === "vehicles" && renderTable(filteredVehicles, ["ID", "Reg No", "Customer", "Model", "Status", "Actions"], v => [v.id, v.reg, v.customer, v.model, v.status])}
        {activeTab === "customers" && renderTable(filteredCustomers, ["ID", "Name", "Email", "Phone", "Actions"], c => [c.id, c.name, c.email, c.phone])}
        {activeTab === "Service Advisor" && renderTable(filteredSAs, ["ID", "Name", "Email", "Phone", "Actions"], sa => [sa.id, sa.name, sa.email, sa.phone])}
        {activeTab === "work" && renderTable(filteredWorkItems, ["ID", "Name", "Price", "Actions"], w => [w.id, w.name, w.price])}
      </div>
    </div>
  );
}

// ===== Styles =====
const inputStyle = { display: "block", width: "100%", marginBottom: 10, padding: 8, borderRadius: 5, border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(0, 0, 0, 0.3)", color: "#fff" };
const addBtnStyle = { padding: "8px 16px", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", background: "#22D3EE", fontWeight: "bold" };
const searchInputStyle = { padding: 8, borderRadius: 5, border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(0, 0, 0, 0.3)", color: "#fff" };
const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left", background: "rgba(0, 0, 0, 0.2)", backdropFilter: "blur(5px)" };
const theadStyle = { background: "rgba(34, 211, 238, 0.1)", color: "#22D3EE" };
const thStyle = { padding: "12px 8px", borderBottom: "1px solid rgba(34, 211, 238, 0.3)" };
const tdStyle = { padding: "12px 8px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" };
const editBtnStyle = { marginRight: 5, padding: 5, borderRadius: 5, background: "#000000", border: "none", color: "#fff", cursor: "pointer" };
const deleteBtnStyle = { padding: 5, borderRadius: 5, background: "#cf1f1f", border: "none", color: "#ffffff", cursor: "pointer" };