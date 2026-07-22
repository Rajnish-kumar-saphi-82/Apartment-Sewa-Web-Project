"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  Wrench,
  Megaphone,
  Settings,
  LogOut,
  Building2,
  UserCircle,
  ShieldCheck,
  PhoneCall,
  ScanFace,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === "Admin"
      ? [{ name: "Admin Users", href: "/admin/users", icon: ShieldCheck }]
      : []),
    ...(user?.role !== "Tenant"
      ? [
          { name: "Properties", href: "/dashboard/properties", icon: Building },
          { name: "Tenants", href: "/dashboard/tenants", icon: Users },
        ]
      : []),
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    ...(user?.role !== "Tenant"
      ? [{ name: "Notices", href: "/dashboard/notices", icon: Megaphone }]
      : []),
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "KYC Verification", href: "/dashboard/kyc", icon: ScanFace },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar-container">
      {/* Brand Header — clicking goes to landing page */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div className="sidebar-brand" style={{ cursor: "pointer" }}>
          <div className="sidebar-logo-icon">
            <Building2 size={24} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-title">Apartment Sewa</span>
            <span className="sidebar-subtitle">Management Suite</span>
          </div>
        </div>
      </Link>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item ${Active ? "active" : ""}`}
            >
              <item.icon className="sidebar-nav-icon" size={20} />
              <span className="sidebar-nav-label">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-utilities">
          <button
            onClick={handleLogout}
            className="sidebar-utility-link logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
