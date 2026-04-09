"use client";

import Sidebar from "../../components/Sidebar";
import { useState } from "react";

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [search, setSearch] = useState("");

  // ===== Master Data States =====
  const [vehicles, setVehicles] = useState([
    { id: "V001", reg: "TN-01-AB-1234", customer: "C001", model: "Honda City", status: "Under Servicing" },
    { id: "V002", reg: "TN-12-PQ-9988", customer: "C002", model: "Hyundai Creta", status: "Serviced" },
  ]);

  const [customers, setCustomers] = useState([
    { id: "C001", name: "John Doe", email: "john@example.com", phone: "9876543210" },
    { id: "C002", name: "Jane Smith", email: "jane@example.com", phone: "8765432109" },
  ]);

  const [serviceAdvisors, setServiceAdvisors] = useState([
    { id: "SA001", name: "Michael Scott", email: "michael@dundermifflin.com", phone: "9998887776" },
  ]);

  const [workItems, setWorkItems] = useState([
    { id: "W001", name: "Engine Oil", price: 1500 },
    { id: "W002", name: "Fuel Filter", price: 500 },
  ]);

  // ===== Form States =====
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [editingId, setEditingId] = useState(null);

  // ===== CREATE & UPDATE =====
  const handleAddOrUpdate = () => {
    if (activeTab === "vehicles") {
      if (!newItem.id || !newItem.reg || !newItem.customer || !newItem.model || !newItem.status) return alert("Fill all fields");
      if (editingId) setVehicles(prev => prev.map(v => v.id === editingId ? newItem : v));
      else setVehicles(prev => [...prev, newItem]);
    } else if (activeTab === "customers") {
      if (!newItem.id || !newItem.name || !newItem.email || !newItem.phone) return alert("Fill all fields");
      if (editingId) setCustomers(prev => prev.map(c => c.id === editingId ? newItem : c));
      else setCustomers(prev => [...prev, newItem]);
    } else if (activeTab === "Service Advisor") {
      if (!newItem.id || !newItem.name || !newItem.email || !newItem.phone) return alert("Fill all fields");
      if (editingId) setServiceAdvisors(prev => prev.map(sa => sa.id === editingId ? newItem : sa));
      else setServiceAdvisors(prev => [...prev, newItem]);
    } else if (activeTab === "work") {
      if (!newItem.id || !newItem.name || !newItem.price) return alert("Fill all fields");
      if (editingId) setWorkItems(prev => prev.map(w => w.id === editingId ? newItem : w));
      else setWorkItems(prev => [...prev, newItem]);
    }

    setNewItem({});
    setEditingId(null);
    setShowForm(false);
  };

  // ===== DELETE =====
  const handleDelete = (id) => {
    if (activeTab === "vehicles") setVehicles(prev => prev.filter(v => v.id !== id));
    else if (activeTab === "customers") setCustomers(prev => prev.filter(c => c.id !== id));
    else if (activeTab === "Service Advisor") setServiceAdvisors(prev => prev.filter(sa => sa.id !== id));
    else if (activeTab === "work") setWorkItems(prev => prev.filter(w => w.id !== id));
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setNewItem(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  // ===== SEARCH FILTER =====
  const filteredVehicles = vehicles.filter(v =>
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.reg.toLowerCase().includes(search.toLowerCase()) ||
    v.customer.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSAs = serviceAdvisors.filter(sa =>
    sa.id.toLowerCase().includes(search.toLowerCase()) ||
    sa.name.toLowerCase().includes(search.toLowerCase()) ||
    sa.email.toLowerCase().includes(search.toLowerCase()) ||
    sa.phone.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWorkItems = workItems.filter(w =>
    w.id.toLowerCase().includes(search.toLowerCase()) ||
    w.name.toLowerCase().includes(search.toLowerCase()) ||
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

      <div style={{ flex: 1, padding: 20, background: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h1>Master Data</h1>
          <div style={{ width: 32, height: 32, background: "#6366f1", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
          {["vehicles", "customers", "Service Advisor", "work"].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); setSearch(""); }}
              style={{
                border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #6366f1" : "none",
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
          <div style={{ marginBottom: 20, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
            <h4>{editingId ? "Edit" : "Add New"} {activeTab}</h4>
            {activeTab === "vehicles" && (
              <>
                <input placeholder="ID" value={newItem.id || ""} onChange={e => setNewItem({ ...newItem, id: e.target.value })} style={inputStyle} />
                <input placeholder="Reg No" value={newItem.reg || ""} onChange={e => setNewItem({ ...newItem, reg: e.target.value })} style={inputStyle} />
                <input placeholder="Customer ID" value={newItem.customer || ""} onChange={e => setNewItem({ ...newItem, customer: e.target.value })} style={inputStyle} />
                <input placeholder="Model" value={newItem.model || ""} onChange={e => setNewItem({ ...newItem, model: e.target.value })} style={inputStyle} />
                <input placeholder="Status" value={newItem.status || ""} onChange={e => setNewItem({ ...newItem, status: e.target.value })} style={inputStyle} />
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
        {activeTab === "vehicles" && renderTable(filteredVehicles, ["ID","Reg No","Customer","Model","Status","Actions"], v => [v.id,v.reg,v.customer,v.model,v.status])}
        {activeTab === "customers" && renderTable(filteredCustomers, ["ID","Name","Email","Phone","Actions"], c => [c.id,c.name,c.email,c.phone])}
        {activeTab === "Service Advisor" && renderTable(filteredSAs, ["ID","Name","Email","Phone","Actions"], sa => [sa.id,sa.name,sa.email,sa.phone])}
        {activeTab === "work" && renderTable(filteredWorkItems, ["ID","Name","Price","Actions"], w => [w.id,w.name,w.price])}
      </div>
    </div>
  );
}

// ===== Styles =====
const inputStyle = { display: "block", width: "100%", marginBottom: 10, padding: 8, borderRadius: 5, border: "1px solid #ccc" };
const addBtnStyle = { padding: 8, color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", background: "#6366f1" };
const searchInputStyle = { padding: 8, borderRadius: 5, border: "1px solid #ccc" };
const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "center" };
const theadStyle = { background: "#f1f5f9" };
const thStyle = { padding: 8 };
const tdStyle = { padding: 8 };
const editBtnStyle = { marginRight: 5, padding: 5, borderRadius: 5, background: "#07f8d0", border: "none", color: "#fff", cursor: "pointer" };
const deleteBtnStyle = { padding: 5, borderRadius: 5, background: "#ef4444", border: "none", color: "#fff", cursor: "pointer" };