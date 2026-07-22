"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell, CheckCheck, Megaphone, Wrench, CreditCard, Check, X
} from "lucide-react";
import { getNotices, getBills, getTickets } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/context/AuthContext";

const STORAGE_KEY = "sewa_read_notifications";

type Notification = {
  id: string;
  type: "notice" | "bill" | "ticket";
  title: string;
  body: string;
  rawTime: string;
  read: boolean;
  color: string;
  accentBg: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(raw: string): string {
  if (!raw) return "Recently";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // already formatted (e.g. "Jul 6, 2026")
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

// ── Icon Components ────────────────────────────────────────────────────────────
const iconMap: Record<string, { Icon: any; color: string; accentBg: string }> = {
  notice:  { Icon: Megaphone,   color: "#1a56db", accentBg: "#eff6ff" },
  bill_paid:    { Icon: CreditCard,  color: "#10b981", accentBg: "#ecfdf5" },
  bill_pending: { Icon: CreditCard,  color: "#f59e0b", accentBg: "#fffbeb" },
  ticket_fixed:   { Icon: Wrench, color: "#10b981", accentBg: "#ecfdf5" },
  ticket_progress:{ Icon: Wrench, color: "#3b82f6", accentBg: "#eff6ff" },
  ticket_pending: { Icon: Wrench, color: "#ef4444", accentBg: "#fef2f2" },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [readPage, setReadPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const buildNotifications = useCallback(async () => {
    setLoading(true);
    const readIds = getReadIds();
    try {
      const items: Notification[] = [];

      // Notices
      const noticesRes = await getNotices();
      const notices = noticesRes.data?.data || [];
      notices.forEach((n: any) => {
        const id = `notice-${n._id || n.id}`;
        const cfg = iconMap.notice;
        items.push({
          id,
          type: "notice",
          title: n.title,
          body: n.message?.slice(0, 120) + (n.message?.length > 120 ? "…" : ""),
          rawTime: n.date || n.created_at || "",
          read: readIds.has(id),
          color: cfg.color,
          accentBg: cfg.accentBg,
        });
      });

      // Bills (Admin / Owner only)
      if (user?.role === "Admin" || user?.role === "Owner") {
        const billsRes = await getBills();
        const bills = billsRes.data?.data || [];
        bills.slice(0, 6).forEach((b: any) => {
          const id = `bill-${b._id || b.id}`;
          const key = b.status === "Paid" ? "bill_paid" : "bill_pending";
          const cfg = iconMap[key];
          items.push({
            id,
            type: "bill",
            title: `${b.status === "Paid" ? "Payment Received" : "Bill Pending"} — ${b.tenantName || "Tenant"}`,
            body: `Flat ${b.flatNo} · ${b.month} · NPR ${(b.totalCost || 0).toLocaleString()}`,
            rawTime: b.paymentDate || b.created_at || "",
            read: readIds.has(id) || b.status === "Paid",
            color: cfg.color,
            accentBg: cfg.accentBg,
          });
        });

        // Tickets
        const ticketsRes = await getTickets();
        const tickets = ticketsRes.data?.data || [];
        tickets.slice(0, 6).forEach((t: any) => {
          const id = `ticket-${t._id || t.id}`;
          const key = t.status === "Fixed" ? "ticket_fixed" : t.status === "In Progress" ? "ticket_progress" : "ticket_pending";
          const cfg = iconMap[key];
          items.push({
            id,
            type: "ticket",
            title: `Maintenance — Flat ${t.flatNo || "Unassigned"}`,
            body: `${t.description?.slice(0, 80) || "Issue reported"}${t.description?.length > 80 ? "…" : ""} · ${t.status}`,
            rawTime: t.created_at || "",
            read: readIds.has(id) || t.status === "Fixed",
            color: cfg.color,
            accentBg: cfg.accentBg,
          });
        });
      }

      // Sort: unread first, then newest first
      items.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime();
      });

      setNotifications(items);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role) buildNotifications();
  }, [user, buildNotifications]);

  const markRead = (id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    window.dispatchEvent(new Event("notifications_read"));
  };

  const markAllRead = () => {
    const readIds = getReadIds();
    notifications.forEach(n => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    window.dispatchEvent(new Event("notifications_read"));
  };

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markRead(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px 0" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: "80px", borderRadius: "14px", background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  const NotifCard = ({ n }: { n: Notification }) => {
    const IconComp = n.type === "notice" ? Megaphone : n.type === "bill" ? CreditCard : Wrench;
    return (
      <div
        onClick={() => !n.read && markRead(n.id)}
        style={{
          display: "flex", alignItems: "flex-start", gap: "14px",
          padding: "16px 18px",
          borderRadius: "14px",
          border: n.read ? "1px solid var(--border, #e2e8f0)" : `1px solid ${n.color}30`,
          background: n.read ? "var(--card-bg, #ffffff)" : `${n.accentBg}`,
          cursor: n.read ? "default" : "pointer",
          transition: "all 0.18s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={e => { if (!n.read) e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {/* Left accent bar for unread */}
        {!n.read && (
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: n.color, borderRadius: "14px 0 0 14px" }} />
        )}

        {/* Icon */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: n.read ? "#f1f5f9" : n.accentBg,
          border: `1px solid ${n.read ? "#e2e8f0" : n.color + "30"}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconComp size={18} style={{ color: n.read ? "#94a3b8" : n.color }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <span style={{
              fontWeight: n.read ? 500 : 700,
              fontSize: "14px",
              color: n.read ? "var(--text-secondary, #64748b)" : "var(--text-primary, #0f172a)",
              lineHeight: 1.4,
            }}>
              {n.title}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              {!n.read && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: n.color, display: "inline-block" }} />}
              <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{formatTime(n.rawTime)}</span>
            </div>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted, #94a3b8)", margin: "5px 0 0", lineHeight: 1.6 }}>
            {n.body}
          </p>
          {!n.read && (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
              <button
                onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                style={{ fontSize: "11px", fontWeight: 600, color: n.color, background: "transparent", border: `1px solid ${n.color}40`, borderRadius: "6px", padding: "3px 10px", cursor: "pointer" }}
              >
                Mark as read
              </button>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={(e) => dismissNotification(e, n.id)}
          title="Dismiss"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: "2px", borderRadius: "6px", flexShrink: 0, marginTop: "2px", lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={24} style={{ color: "#1a56db" }} />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: "#ef4444", color: "#fff",
                fontSize: "11px", fontWeight: 700, borderRadius: "20px",
                padding: "2px 9px", letterSpacing: "0.3px"
              }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">All system alerts, billing events, and announcements in one place</p>
        </div>
        <div className="page-actions">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "10px",
              border: "none",
              background: unreadCount > 0 ? "#1a56db" : "#f1f5f9",
              color: unreadCount > 0 ? "#fff" : "#94a3b8",
              fontWeight: 600, fontSize: "13px",
              cursor: unreadCount > 0 ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Bell size={32} style={{ color: "#cbd5e1" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#64748b" }}>You're all caught up!</div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>No new notifications at the moment.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ── Unread Section ── */}
          {unread.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  New · {unread.length}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {unread.map(n => <NotifCard key={n.id} n={n} />)}
              </div>
            </div>
          )}

          {/* ── Read Section ── */}
          {read.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Check size={12} style={{ color: "#94a3b8" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Earlier · {read.length}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {read.slice((readPage - 1) * ITEMS_PER_PAGE, readPage * ITEMS_PER_PAGE).map(n => <NotifCard key={n.id} n={n} />)}
              </div>
              
              {/* Pagination */}
              {read.length > ITEMS_PER_PAGE && (
                <div className="pagination-wrapper" style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", marginTop: "16px" }}>
                  <span className="pagination-text">
                    Page {readPage} of {Math.ceil(read.length / ITEMS_PER_PAGE)}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={readPage <= 1}
                      onClick={() => setReadPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(read.length / ITEMS_PER_PAGE) }).map((_, i) => (
                      <button
                        key={i}
                        className={`pagination-btn ${readPage === i + 1 ? "active" : ""}`}
                        onClick={() => setReadPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pagination-btn"
                      disabled={readPage >= Math.ceil(read.length / ITEMS_PER_PAGE)}
                      onClick={() => setReadPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0 }
          100% { background-position: -100% 0 }
        }
      `}</style>
    </div>
  );
}
