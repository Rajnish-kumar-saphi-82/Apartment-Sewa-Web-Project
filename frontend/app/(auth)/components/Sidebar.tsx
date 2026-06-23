"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  Plus,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/dashboard/properties", icon: Building },
    { name: "Tenants", href: "/dashboard/tenants", icon: Users },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
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
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <Building2 size={24} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-title">Apartment Sewa</span>
          <span className="sidebar-subtitle">Management Suite</span>
        </div>
      </div>

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
        <button className="sidebar-add-btn">
          <Plus size={16} />
          <span>Add New Property</span>
        </button>

        <div className="sidebar-utilities">
          <Link href="/dashboard/settings" className="sidebar-utility-link">
            <HelpCircle size={18} />
            <span>Support</span>
          </Link>
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
