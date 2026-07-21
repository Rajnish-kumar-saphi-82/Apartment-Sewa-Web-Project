"use client";

import { useEffect, useState } from "react";
import { Search, Wrench, Plus, Upload, Check, AlertCircle, Clock, Trash2, X } from "lucide-react";
import { getTickets as fetchTicketsApi, createTicket as addTicketApi, updateTicketStatus as updateTicketStatusApi, deleteTicket as deleteTicketApi, getUnits as fetchUnitsApi } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/context/AuthContext";
import { handleAnalyzeImage } from "@/lib/actions/ai/gemini-action";
import { useAlert } from "@/lib/context/AlertContext";

export default function MaintenancePage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useAlert();
  
  // States
  const [tickets, setTickets] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  
  // Tenant states
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [urgency, setUrgency] = useState("Medium");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadData = async () => {
    try {
      const [ticketsRes, unitsRes] = await Promise.all([
        fetchTicketsApi(),
        fetchUnitsApi()
      ]);
      setTickets(ticketsRes.data.data || []);
      setUnits(unitsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tenant submits repair request
  const handleTenantRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      showAlert("Please provide a description of the issue.", "Required");
      return;
    }

    const assignedUnit = units.find(u => u.tenantPhone === user?.phone || u.tenantName === user?.full_name);
    
    try {
      const formData = new FormData();
      formData.append("flatNo", assignedUnit?.flatNo || "Unassigned");
      formData.append("description", description);
      formData.append("category", category);
      formData.append("urgency", urgency);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      await addTicketApi(formData);
      
      // Refresh tickets
      await loadData();
      
      // Reset
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      showAlert("Maintenance ticket successfully submitted and sent to the landlord!", "Success");
    } catch (error) {
      console.error("Failed to submit ticket", error);
      showAlert("Failed to submit maintenance ticket.", "Error");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Auto-analyze image for description
      setIsAnalyzing(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Data = reader.result?.toString().split(',')[1];
          if (base64Data) {
            const res = await handleAnalyzeImage(base64Data, file.type);
            if (res.success && res.data) {
              setDescription(res.data);
            } else {
              console.warn("Failed to analyze image description.");
            }
          }
          setIsAnalyzing(false);
        };
      } catch (err) {
        console.error("Error analyzing image:", err);
        setIsAnalyzing(false);
      }
    }
  };

  // Owner status actions
  const handleUpdateStatus = async (ticketId: string, status: "Pending" | "In Progress" | "Fixed") => {
    try {
      await updateTicketStatusApi(ticketId, status);
      await loadData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (await showConfirm("Are you sure you want to delete this maintenance ticket record?")) {
      try {
        await deleteTicketApi(ticketId);
        await loadData();
      } catch (error) {
        console.error("Failed to delete ticket", error);
      }
    }
  };

  //  OWNER VIEW: MAINTENANCE CONTROL (Page 11)
  const renderOwnerMaintenance = () => {
    const displayedTickets = tickets.filter(t => activeTab === "Active" ? t.status !== "Fixed" : t.status === "Fixed");

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Maintenance Inbox</h1>
            <p className="page-subtitle">Review and manage AI-triaged repair requests across your properties</p>
          </div>
        </div>

        {/* Tab filters (Active / History) */}
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === "Active" ? "active" : ""}`}
            onClick={() => setActiveTab("Active")}
          >
            Active Requests ({tickets.filter(t => t.status !== "Fixed").length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "History" ? "active" : ""}`}
            onClick={() => setActiveTab("History")}
          >
            Archived History ({tickets.filter(t => t.status === "Fixed").length})
          </button>
        </div>

        {/* Tickets Grid */}
        <div className="maintenance-grid">
          {displayedTickets.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", color: "#64748b" }}>
              No maintenance requests filed.
            </div>
          ) : (
            displayedTickets.map((t, i) => (
              <div key={t._id || t.id || i} className="maintenance-ticket-card">
                <div className="ticket-header-img">
                  <img src={t.image} alt="leak" />
                  <span className={`ticket-urgency-badge ${t.urgency}`}>
                    {t.urgency}
                  </span>
                </div>
                
                <div className="ticket-body">
                  <div className="ticket-meta-row">
                    <span>TICKET #{(t._id || t.id || "000000").slice(-6).toUpperCase()}</span>
                    <span>Flat {t.flatNo}</span>
                  </div>
                  
                  <span className="ticket-title">Repair Ticket</span>
                  <p className="ticket-desc">{t.description}</p>
                  
                  {/* AI Diagnostic report (Page 11 requirement) */}
                  {t.diagnostic && (
                    <div className="ticket-diagnostic-box">
                      <div className="diagnostic-title">🤖 GEMINI AI DIAGNOSTIC</div>
                      <div className="diagnostic-text">{t.diagnostic}</div>
                    </div>
                  )}
                </div>

                <div className="ticket-footer">
                  <div className="ticket-cost-info">
                    <span className="ticket-cost-label">Est. Cost</span>
                    <span className="ticket-cost-val">{t.cost || "To Be Determined"}</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {t.status !== "Fixed" ? (
                      <>
                        {t.status === "Pending" && (
                          <button
                            onClick={() => handleUpdateStatus(t._id || t.id, "In Progress")}
                            className="card-btn secondary"
                            style={{ padding: "6px 10px", border: "1px solid #1a56db", fontSize: "12px", flexShrink: 0 }}
                          >
                            Set In Progress
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(t._id || t.id, "Fixed")}
                          className="card-btn primary"
                          style={{ padding: "6px 10px", background: "#10b981", borderColor: "#10b981", fontSize: "12px", color: "#ffffff", flexShrink: 0 }}
                        >
                          Mark Fixed
                        </button>
                      </>
                    ) : (
                      <span className="status-badge success" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Check size={14} /> Resolved
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteTicket(t._id || t.id)}
                      className="card-btn primary"
                      style={{ padding: "8px", background: "#ef4444", border: "none", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 2. TENANT VIEW: FILE REPAIR REQUEST (Page 14)
  const renderTenantMaintenance = () => {
    const assignedUnit = units.find(u => u.tenantPhone === user?.phone || u.tenantName === user?.full_name);
    const tenantTickets = tickets.filter(t => t.flatNo === (assignedUnit?.flatNo || "Unassigned"));

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Maintenance Request</h1>
            <p className="page-subtitle">Report physical issues to your landlord with smart photo diagnostics</p>
          </div>
        </div>

        <div className="chart-card" style={{ marginBottom: "32px" }}>
          <form onSubmit={handleTenantRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* File Upload Box */}
            <div className="form-group">
              <label className="form-label">Upload Evidence Photos / Videos</label>
              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "40px 20px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => document.getElementById("tenant-ticket-file")?.click()}
              >
                {imagePreview ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={imagePreview} style={{ maxHeight: "180px", borderRadius: "8px" }} alt="preview" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(""); setImageFile(null); }}
                      style={{ position: "absolute", top: "-10px", right: "-10px", background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Upload size={32} style={{ color: "#94a3b8" }} />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                      Drop photos or videos here
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      High resolution images help AI diagnostic accuracy
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  id="tenant-ticket-file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label className="form-label">
                Issue Description
                {isAnalyzing && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#1a56db", fontWeight: "bold" }}>✨ AI Analyzing Image...</span>}
              </label>
              <div className="form-input-wrapper" style={{ height: "auto", padding: "12px" }}>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder={isAnalyzing ? "AI is diagnosing the issue..." : "Tell us exactly what is wrong, including location in the unit..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ height: "100%", width: "100%", border: "none", outline: "none", resize: "none" }}
                  disabled={isAnalyzing}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Submit Repair Request
            </button>
          </form>
        </div>

        {/* Existing requests track */}
        <div className="table-card">
          <div className="table-header-row">
            <span className="table-title">My Filed Repair Tickets</span>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Description</th>
                  <th>AI Diagnostic Report</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      You haven&apos;t filed any repair requests yet.
                    </td>
                  </tr>
                ) : (
                  tenantTickets.map((t, i) => (
                    <tr key={t._id || t.id || i}>
                      <td><span style={{ fontWeight: 700 }}>#{(t._id || t.id || "000000").slice(-6).toUpperCase()}</span></td>
                      <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {t.diagnostic || "AI Scanning in progress..."}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${t.status === "Pending" ? "failed" : t.status === "In Progress" ? "active" : "success"}`}>
                          {t.status}
                        </span>
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

  // Routing
  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  if (user.role === "Owner" || user.role === "Admin") {
    return renderOwnerMaintenance();
  } else {
    return renderTenantMaintenance();
  }
}
