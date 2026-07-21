"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Eye, Trash2, Bell, Plus } from "lucide-react";
import { getNotices as fetchNoticesApi, createNotice as addNoticeApi, deleteNotice as deleteNoticeApi } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/context/AuthContext";
import { useAlert } from "@/lib/context/AlertContext";

export default function NoticesPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useAlert();
  const [notices, setNotices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  const loadNotices = async () => {
    try {
      const res = await fetchNoticesApi();
      setNotices(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch notices", error);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) { showAlert("Please provide both a title and message.", "Required"); return; }
    setPublishing(true);
    try {
      await addNoticeApi({ title, message });
      await loadNotices();
      setTitle(""); setMessage("");
      showAlert("Notice published to all residents!", "Success");
    } catch { showAlert("Failed to publish notice.", "Error"); }
    finally { setPublishing(false); }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (await showConfirm("Delete this notice?")) {
      try { await deleteNoticeApi(noticeId); await loadNotices(); } catch {}
    }
  };

  const isAdminOrOwner = user?.role === "Admin" || user?.role === "Owner";

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">
            {isAdminOrOwner ? "Notice Board Manager" : "Community Bulletin"}
          </h1>
          <p className="page-subtitle">
            {isAdminOrOwner
              ? "Publish and manage announcements for all residents"
              : "Official notices and announcements from management"}
          </p>
        </div>
      </div>

      {/* Admin/Owner: Draft + Preview */}
      {isAdminOrOwner && (
        <div className="dashboard-grid-2" style={{ marginBottom: "28px" }}>
          {/* Creator Form */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={16} style={{ color: "#1a56db" }} /> Draft Notice
              </span>
            </div>
            <form onSubmit={handlePublishNotice} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notice Title</label>
                <div className="form-input-wrapper">
                  <input type="text" className="form-input" placeholder="e.g. Scheduled Water Supply Interruption" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Announcement Content</label>
                <div className="form-input-wrapper" style={{ height: "auto", padding: "12px" }}>
                  <textarea className="form-input" rows={5} placeholder="Write detailed announcement for all residents..." value={message} onChange={e => setMessage(e.target.value)} style={{ width: "100%", border: "none", outline: "none", resize: "none" }} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={publishing} style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <Send size={16} /> {publishing ? "Publishing..." : "Publish Notice"}
              </button>
            </form>
          </div>

          {/* Live Preview */}
          <div className="chart-card" style={{ background: "#f8fafc" }}>
            <div className="chart-header">
              <span className="chart-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={16} style={{ color: "#64748b" }} /> Live Preview
              </span>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#ffffff", padding: "16px", marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{title || "Notice Title Goes Here"}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Today</span>
              </div>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {message || "Your notice content will appear here in real time as you type..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="table-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        </div>

        {notices.length === 0 ? (
          <div style={{ display: "none" }}></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {notices.map((n, i) => (
              <div key={n._id || n.id || i} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", background: "#ffffff", display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <Megaphone size={18} style={{ color: "#1a56db" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{n.title}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "12px" }}>{n.date}</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>{n.message}</p>
                </div>
                {isAdminOrOwner && (
                  <button onClick={() => handleDeleteNotice(n._id || n.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", width: "34px", height: "34px", minWidth: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
