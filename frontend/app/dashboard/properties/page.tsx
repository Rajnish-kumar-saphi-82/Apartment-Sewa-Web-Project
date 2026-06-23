"use client";


import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, CheckCircle, ShieldAlert, X } from "lucide-react";
import { getUnits, addUnit, getTenants, STORAGE_KEYS } from "@/lib/mockData";
import { useAuth } from "@/lib/context/AuthContext";

export default function PropertiesPage() {
  const { user } = useAuth();
  
  // States
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Filters / Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    flatNo: "",
    floor: "",
    rent: "",
    image: ""
  });

  useEffect(() => {
    setUnits(getUnits());
    setTenants(getTenants());
    
    // Sync with localStorage
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.adminUsers);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        localStorage.setItem(STORAGE_KEYS.adminUsers, JSON.stringify([]));
        setUsers([]);
      }
    }
  }, []);

  const saveUsers = (newList: any[]) => {
    setUsers(newList);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.adminUsers, JSON.stringify(newList));
    }
  };

  // 1. ADMIN VIEW: USER MANAGEMENT (Page 4)
  const handleToggleStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      const filtered = users.filter(u => u.id !== userId);
      saveUsers(filtered);
    }
  };

  const renderAdminUserManagement = () => {
    const filteredUsers = users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
      const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchStatus = statusFilter === "all" ? true : u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Verify, suspend, or manage platform users</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="table-card" style={{ marginBottom: "24px", padding: "16px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
            {/* Search */}
            <div className="header-search-wrapper" style={{ width: "280px", margin: 0 }}>
              <Search className="header-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search user name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="header-search-input"
              />
            </div>
            
            {/* Dropdowns */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div className="form-select-wrapper" style={{ width: "140px" }}>
                <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="Owner">Owner</option>
                  <option value="Tenant">Tenant</option>
                </select>
              </div>
              <div className="form-select-wrapper" style={{ width: "140px" }}>
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>No users found matching filters.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`status-badge ${u.role === "Owner" ? "active" : "success"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.status === "Active" ? "success" : "suspended"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className="card-btn secondary"
                            style={{ padding: "6px 12px", border: "1px solid #64748b", color: u.status === "Active" ? "#ef4444" : "#10b981", minWidth: "90px" }}
                          >
                            {u.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="card-btn primary"
                            style={{ padding: "6px 12px", background: "#ef4444", border: "none", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 2. OWNER VIEW: FLAT MANAGEMENT (Page 8)
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitData.flatNo || !newUnitData.floor || !newUnitData.rent) {
      alert("Please fill in all required fields.");
      return;
    }
    
    addUnit(newUnitData.flatNo, newUnitData.floor, Number(newUnitData.rent), newUnitData.image);
    setUnits(getUnits());
    setShowAddUnitModal(false);
    setNewUnitData({ flatNo: "", floor: "", rent: "", image: "" });
  };

  const handleDeleteUnit = (unitId: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      const stored = getUnits();
      const filtered = stored.filter(u => u.id !== unitId);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.units, JSON.stringify(filtered));
      }
      setUnits(filtered);
    }
  };

  const renderOwnerFlatManagement = () => {
    const filteredUnits = units.filter(u => 
      u.flatNo.includes(search) || u.floor.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Unit Management</h1>
            <p className="page-subtitle">Configure flats, view rent structures, and occupancy status</p>
          </div>
          <div className="page-actions">
            <button onClick={() => setShowAddUnitModal(true)} className="sidebar-add-btn" style={{ width: "auto" }}>
              <Plus size={16} /> Add Unit
            </button>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="table-card" style={{ marginBottom: "24px", padding: "16px 24px" }}>
          <div className="header-search-wrapper" style={{ width: "320px", margin: 0 }}>
            <Search className="header-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by Flat No or Floor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="header-search-input"
            />
          </div>
        </div>

        {/* Units Grid */}
        <div className="cards-grid">
          {filteredUnits.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No units registered. Add a unit using the button above.
            </div>
          ) : (
            filteredUnits.map((u) => (
              <div key={u.id} className="interactive-card">
                <div className="card-image-wrapper">
                  <img src={u.image} className="card-image" alt="flat" />
                  <span className={`card-badge ${u.status === "Occupied" ? "success" : "suspended"}`} style={{ position: "absolute", top: "12px", right: "12px", background: u.status === "Occupied" ? "#10b981" : "#64748b" }}>
                    {u.status}
                  </span>
                </div>
                <div className="card-body">
                  <span className="card-title">Flat {u.flatNo}</span>
                  <span className="card-meta">{u.floor}</span>
                  <div className="card-details-row">
                    <span className="card-price">NPR {Number(u.rent).toLocaleString()} /mo</span>
                  </div>
                  {u.tenantName && (
                    <div style={{ fontSize: "12px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      Tenant: <b>{u.tenantName}</b>
                    </div>
                  )}
                  <div className="card-footer-actions" style={{ marginTop: "12px" }}>
                    <button
                      onClick={() => handleDeleteUnit(u.id)}
                      className="card-btn primary"
                      style={{ background: "#ef4444", borderColor: "#ef4444", flexGrow: 0, padding: "8px 12px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Unit Modal */}
        {showAddUnitModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Add New Flat Unit</h3>
                <button onClick={() => setShowAddUnitModal(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUnit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Flat / Room Number</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 402, 108"
                      value={newUnitData.flatNo}
                      onChange={(e) => setNewUnitData({ ...newUnitData, flatNo: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Floor Location</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 4th Floor, Ground Floor"
                      value={newUnitData.floor}
                      onChange={(e) => setNewUnitData({ ...newUnitData, floor: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Rent (NPR)</label>
                  <div className="form-input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 35000"
                      value={newUnitData.rent}
                      onChange={(e) => setNewUnitData({ ...newUnitData, rent: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Photo URL (Optional)</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Image address URL"
                      value={newUnitData.image}
                      onChange={(e) => setNewUnitData({ ...newUnitData, image: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Create Flat Unit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. TENANT VIEW: RESIDENCE DETAILS
  const renderTenantResidenceInfo = () => {
    const tenantUnit = units.find(u => u.tenantPhone === user?.phone || u.tenantName === user?.full_name) || units[0];

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">My Residence</h1>
            <p className="page-subtitle">Registered occupancy details and active lease info</p>
          </div>
        </div>

        {tenantUnit ? (
          <div className="interactive-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="card-image-wrapper" style={{ height: "300px" }}>
              <img src={tenantUnit.image} className="card-image" alt="residence" />
              <span className="card-badge">Active Lease</span>
            </div>
            <div className="card-body" style={{ padding: "32px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Unit {tenantUnit.flatNo}</h2>
              <span style={{ fontSize: "14px", color: "#64748b" }}>{tenantUnit.floor}</span>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Rent Amount</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a56db", marginTop: "4px" }}>NPR {Number(tenantUnit.rent).toLocaleString()} /mo</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Lease Holder</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>{user?.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Registered Phone</div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#0f172a", marginTop: "4px" }}>{user?.phone || "Not provided"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Occupancy Code</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>Assigned by owner</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", color: "#64748b" }}>
            No registered active leases found for your profile. Contact your landlord.
          </div>
        )}
      </div>
    );
  };

  // Route Routing
  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  if (user.role === "Admin") {
    return renderAdminUserManagement();
  } else if (user.role === "Owner") {
    return renderOwnerFlatManagement();
  } else {
    return renderTenantResidenceInfo();
  }
}
