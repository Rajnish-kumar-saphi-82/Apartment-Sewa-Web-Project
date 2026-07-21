"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  UserPlus,
  X,
  Hash,
  User,
  Phone,
  Check,
} from "lucide-react";
import { getTenants as fetchTenantsApi, createTenant as addTenantApi, getUnits as fetchUnitsApi } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/context/AuthContext";
import { useAlert } from "@/lib/context/AlertContext";

export default function TenantsPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // States
  const [tenants, setTenants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Search
  const [search, setSearch] = useState("");

  // Modal
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: "",
    phone: "",
    flatNo: "",
  });

  const loadData = async () => {
    try {
      const [tenantsRes, unitsRes] = await Promise.all([
        fetchTenantsApi(),
        fetchUnitsApi()
      ]);
      setTenants(tenantsRes.data.data || []);
      setUnits(unitsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, flatNo } = newTenantData;
    if (!name || !phone || !flatNo) {
      showAlert("Please fill in all details.", "Required");
      return;
    }

    try {
      await addTenantApi({ name, phone, flatNo });
      
      // Refresh states
      await loadData();
      
      // Reset and Close
      setShowAddTenantModal(false);
      setNewTenantData({ name: "", phone: "", flatNo: "" });
      showAlert("Tenant added successfully and unique House Code generated!", "Success");
    } catch (error) {
      console.error("Failed to add tenant", error);
      showAlert("Failed to add tenant.", "Error");
    }
  };

  const getVacantUnits = () => {
    return units.filter((u) => u.status === "Vacant");
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.flatNo.includes(search),
  );

  // 1. OWNER VIEW: TENANT MANAGEMENT (Page 9)
  const renderOwnerTenantManagement = () => {
    const vacantFlats = getVacantUnits();

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Tenant Management</h1>
            <p className="page-subtitle">
              Add tenants, issue house codes, and oversee apartment occupants
            </p>
          </div>
          <div className="page-actions">
            <button
              onClick={() => setShowAddTenantModal(true)}
              className="sidebar-add-btn"
              style={{ width: "auto" }}
            >
              <UserPlus size={16} /> Add Tenant
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className="table-card"
          style={{ marginBottom: "24px", padding: "16px 24px" }}
        >
          <div
            className="header-search-wrapper"
            style={{ width: "320px", margin: 0 }}
          >
            <Search className="header-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name, flat, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="header-search-input"
            />
          </div>
        </div>

        {/* Tenants Table */}
        <div className="table-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Contact Phone</th>
                  <th>Flat / Room</th>
                  <th>House Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No active tenants found. Add a tenant to get started.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t, i) => (
                    <tr key={t._id || t.id || i}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {t.name}
                        </div>
                      </td>
                      <td>{t.phone}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#1a56db" }}>
                          Unit {t.flatNo}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge active"
                          style={{ fontFamily: "monospace", fontSize: "13px" }}
                        >
                          {t.houseCode}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Tenant Modal */}
        {showAddTenantModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Register Tenant</h3>
                <button
                  onClick={() => setShowAddTenantModal(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleAddTenantSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-wrapper">
                    <User className="form-input-icon" size={18} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter full name"
                      value={newTenantData.name}
                      onChange={(e) =>
                        setNewTenantData({
                          ...newTenantData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="form-input-wrapper">
                    <Phone className="form-input-icon" size={18} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 98XXXXXXXX"
                      value={newTenantData.phone}
                      onChange={(e) =>
                        setNewTenantData({
                          ...newTenantData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Vacant Flat</label>
                  <div className="form-select-wrapper">
                    <select
                      className="form-select"
                      value={newTenantData.flatNo}
                      onChange={(e) =>
                        setNewTenantData({
                          ...newTenantData,
                          flatNo: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Choose Flat --</option>
                      {vacantFlats.map((vf, i) => (
                        <option key={vf._id || vf.id || i} value={vf.flatNo}>
                          Flat {vf.flatNo} ({vf.floor}) - NPR{" "}
                          {vf.rent.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  {vacantFlats.length === 0 && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "4px",
                      }}
                    >
                      No vacant flats available. Please create a flat under Unit
                      Management first.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={vacantFlats.length === 0}
                >
                  Generate House Code & Save
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 2. ADMIN/TENANT VIEW: UNIFIED NEIGHBORS / DIRECTORY LIST
  const renderUnifiedTenantDirectory = () => {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Tenant Directory</h1>
            <p className="page-subtitle">
              Residents network and flat contacts list
            </p>
          </div>
        </div>

        {/* Search */}
        <div
          className="table-card"
          style={{ marginBottom: "24px", padding: "16px 24px" }}
        >
          <div
            className="header-search-wrapper"
            style={{ width: "320px", margin: 0 }}
          >
            <Search className="header-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="header-search-input"
            />
          </div>
        </div>

        {/* Tenants list table */}
        <div className="table-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Flat No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No directory contacts matching search.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t, i) => (
                    <tr key={t._id || t.id || i}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {t.name}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#1a56db" }}>
                          Unit {t.flatNo}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge success">Resident</span>
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

  // Switch views
  if (!user)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );

  if (user.role === "Owner") {
    return renderOwnerTenantManagement();
  } else {
    return renderUnifiedTenantDirectory();
  }
}
