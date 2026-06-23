"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function TopHeader() {
  const { user } = useAuth();

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
