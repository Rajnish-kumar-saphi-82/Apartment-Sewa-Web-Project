"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Megaphone,
  FileText,
  Plus,
  HelpCircle,
  AlertTriangle,
  Eye,
  Send,
} from "lucide-react";
import { getNotices, addNotice, Notice, STORAGE_KEYS } from "@/lib/mockData";
import { useAuth } from "@/lib/context/AuthContext";

export default function ReportsPage() {
  const { user } = useAuth();

  // States
  const [notices, setNotices] = useState<Notice[]>([]);

  // Admin form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNotices(getNotices());
  }, []);

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert("Please provide both a title and message.");
      return;
    }

    addNotice(title, message);

    // Refresh notices
    setNotices(getNotices());

    // Reset
    setTitle("");
    setMessage("");
    alert("Notice successfully published on Notice Board for all residents!");
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      const stored = getNotices();
      const filtered = stored.filter((n) => n.id !== noticeId);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(filtered));
      }
      setNotices(filtered);
    }
  };

  // 1. ADMIN VIEW: SYSTEM NOTICE BOARD CREATOR (Page 6)
  const renderAdminNoticeBoard = () => {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">System Notice Board</h1>
            <p className="page-subtitle">
              Publish system notices and emergency broadcast announcements
            </p>
          </div>
        </div>

        <div className="dashboard-grid-2">
          {/* Creator Form */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Draft Notice</span>
            </div>
            <form
              onSubmit={handlePublishNotice}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notice Title</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Scheduled Elevator Inspection"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Announcement Content</label>
                <div
                  className="form-input-wrapper"
                  style={{ height: "auto", padding: "12px" }}
                >
                  <textarea
                    className="form-input"
                    rows={6}
                    placeholder="Write detailed announcements for all users..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      outline: "none",
                      resize: "none",
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                <Send size={18} /> Publish Notice
              </button>
            </form>
          </div>

          {/* Live Preview Box */}
          <div className="invoice-preview-card">
            <div
              className="invoice-preview-header"
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Eye size={18} style={{ color: "#64748b" }} />
              <span className="invoice-preview-title">Live Preview Window</span>
            </div>
            <div
              className="notice-card"
              style={{
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <div className="notice-header">
                <span className="notice-title">
                  {title || "Notice Title Goes Here"}
                </span>
                <span className="notice-date">Today</span>
              </div>
              <p className="notice-body" style={{ whiteSpace: "pre-wrap" }}>
                {message ||
                  "Draft message contents will render live in this card preview window..."}
              </p>
            </div>
          </div>
        </div>

        {/* Existing Notices Table */}
        <div className="table-card">
          <span className="table-title">Published System Notices</span>
          <div style={{ marginTop: "20px" }}>
            {notices.map((n) => (
              <div
                key={n.id}
                className="notice-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <div className="notice-header">
                    <span className="notice-title">{n.title}</span>
                    <span className="notice-date">{n.date}</span>
                  </div>
                  <p className="notice-body">{n.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(n.id)}
                  className="card-btn primary"
                  style={{
                    background: "#ef4444",
                    border: "none",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: 0,
                    marginLeft: "20px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. OWNER/TENANT VIEW: NOTICE LIST (Page 15)
  const renderNoticesList = () => {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Community Bulletin</h1>
            <p className="page-subtitle">
              Official statements and notice announcements from the management
              suite
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {notices.length === 0 ? (
            <div
              className="chart-card"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <Megaphone
                size={36}
                style={{ color: "#94a3b8", margin: "0 auto 12px" }}
              />
              <span style={{ fontSize: "16px", color: "#64748b" }}>
                No official notices posted.
              </span>
            </div>
          ) : (
            notices.map((n) => (
              <div key={n.id} className="notice-card">
                <div className="notice-header">
                  <span
                    className="notice-title"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Megaphone size={18} style={{ color: "#1a56db" }} />{" "}
                    {n.title}
                  </span>
                  <span className="notice-date">{n.date}</span>
                </div>
                <p className="notice-body" style={{ whiteSpace: "pre-wrap" }}>
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Switch views
  if (!user)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );

  if (user.role === "Admin") {
    return renderAdminNoticeBoard();
  } else {
    return renderNoticesList();
  }
}
