"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotices } from "@/lib/api/dashboard";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function TopHeader() {
  const { user } = useAuth();
  const [noticeCount, setNoticeCount] = useState(0);

  const getSubText = () => {
    if (!user) return "Guest";
    return user.role || "User";
  };

  const initials = (user?.full_name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = user?.profile_image || "";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Fetch unread count for badge
  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        let count = 0;
        const raw = localStorage.getItem("sewa_read_notifications");
        const readIds = raw ? new Set(JSON.parse(raw)) : new Set();

        // 1. Notices
        try {
          const res = await getNotices();
          const notices = res.data?.data || [];
          notices.forEach((n: any) => {
            if (!readIds.has(`notice-${n._id || n.id}`)) count++;
          });
        } catch (e) { /* ignore */ }

        // 2. Bills & Tickets (Admin / Owner only)
        if (user.role === "Admin" || user.role === "Owner") {
          try {
            // Check top 6 bills (same logic as notifications page)
            const { getBills, getTickets } = await import("@/lib/api/dashboard");
            const billsRes = await getBills();
            const bills = billsRes.data?.data || [];
            bills.slice(0, 6).forEach((b: any) => {
              if (b.status !== "Paid" && !readIds.has(`bill-${b._id || b.id}`)) count++;
            });

            // Check top 6 tickets
            const ticketsRes = await getTickets();
            const tickets = ticketsRes.data?.data || [];
            tickets.slice(0, 6).forEach((t: any) => {
              if (t.status !== "Fixed" && !readIds.has(`ticket-${t._id || t.id}`)) count++;
            });
          } catch (e) { /* ignore */ }
        }

        setNoticeCount(count);
      } catch {
        setNoticeCount(0);
      }
    };
    
    fetchUnreadCount();
    // Re-check periodically
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Also listen to a custom event from the Notifications page
    const handleReadEvent = () => fetchUnreadCount();
    window.addEventListener("notifications_read", handleReadEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications_read", handleReadEvent);
    };
  }, [user]);

  return (
    <header className="top-header">
      <div className="header-title-block">
        <span className="header-kicker">{today}</span>
        <span className="header-greeting">
          {greeting()}, {user?.full_name || "User"}
        </span>
      </div>

      {/* Actions & Profile */}
      <div className="header-actions">
        {/* Notifications Icon with badge */}
        <Link
          href="/dashboard/notifications"
          style={{
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "50%",
            cursor: "pointer",
            transition: "background 0.2s",
            position: "relative",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Bell size={20} />
          {noticeCount > 0 && (
            <span style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              minWidth: "18px",
              height: "18px",
              borderRadius: "9px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
              border: "2px solid #ffffff",
            }}>
              {noticeCount > 9 ? "9+" : noticeCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Info & Avatar — links to /dashboard/profile */}
        <Link
          href="/dashboard/profile"
          className="header-profile-link"
          id="header-profile-link"
        >
          <div className="header-user-info">
            <span className="header-username">{user?.full_name || "User"}</span>
            <span className="header-userrole">{getSubText()}</span>
          </div>
          <div className="header-avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="header-avatar" />
            ) : (
              <span className="header-avatar-fallback">{initials}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
