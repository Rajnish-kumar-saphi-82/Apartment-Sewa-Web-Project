"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Play,
  ArrowUpRight,
  MessageSquare,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  getNotices,
  getUnits,
  getTenants,
  getBills,
  getTickets,
  payBill,
} from "@/lib/mockData";
import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  // Dashboard states
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Modal for Tenant Quick Pay
  const [payModal, setPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    setUnits(getUnits());
    setTenants(getTenants());
    setBills(getBills());
    setTickets(getTickets());
    setNotices(getNotices());
  }, []);

  // 1. ADMIN DASHBOARD VIEW
  const renderAdminDashboard = () => {
    const totalApartments = units.length;
    const totalOwners = 0;
    const totalTenants = tenants.length;
    const paidBills = bills.filter((b) => b.status === "Paid");
    const totalRevenue = paidBills.reduce(
      (acc, curr) => acc + curr.totalCost,
      0,
    );
    const occupiedCount = units.filter((u) => u.status === "Occupied").length;
    const vacantCount = units.filter((u) => u.status === "Vacant").length;
    const occupancyRate = units.length
      ? ((occupiedCount / units.length) * 100).toFixed(1)
      : "0";
    const monthlyRevenue = paidBills.reduce<Record<string, number>>(
      (acc, bill) => {
        acc[bill.month] = (acc[bill.month] || 0) + bill.totalCost;
        return acc;
      },
      {},
    );
    const maxRevenue = Math.max(...Object.values(monthlyRevenue), 0);
    const recentActivities = [
      ...bills.slice(0, 4).map((bill) => ({
        id: bill.id,
        user: bill.tenantName,
        action: `${bill.month} bill ${bill.status.toLowerCase()}`,
        date: bill.paymentDate || "Pending",
        amount: `NPR ${bill.totalCost.toLocaleString()}`,
        status: bill.status,
      })),
      ...tickets.slice(0, 4).map((ticket) => ({
        id: ticket.id,
        user: `Flat ${ticket.flatNo}`,
        action: "Maintenance request",
        date: ticket.status,
        amount: "",
        status: ticket.status,
      })),
    ].slice(0, 4);

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Overall system metrics and user activities
            </p>
          </div>
          <div className="page-actions">
            <button className="sidebar-add-btn" style={{ width: "auto" }}>
              Export Report
            </button>
          </div>
        </div>

        {/* Top Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper blue">
                <Building2 size={20} />
              </div>
              <span className="stat-card-trend up">
                <TrendingUp size={12} />
                Live
              </span>
            </div>
            <span className="stat-card-label">Total Apartments</span>
            <span className="stat-card-value">{totalApartments}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper green">
                <Users size={20} />
              </div>
              <span className="stat-card-trend up">
                <TrendingUp size={12} />
                Live
              </span>
            </div>
            <span className="stat-card-label">Total Owners</span>
            <span className="stat-card-value">{totalOwners}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper orange">
                <Users size={20} />
              </div>
              <span className="stat-card-trend up">
                <TrendingUp size={12} />
                Live
              </span>
            </div>
            <span className="stat-card-label">Total Tenants</span>
            <span className="stat-card-value">{totalTenants}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper red">
                <CreditCard size={20} />
              </div>
              <span className="stat-card-trend down">
                <TrendingDown size={12} />
                Live
              </span>
            </div>
            <span className="stat-card-label">Total Revenue</span>
            <span className="stat-card-value">
              NPR {totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-grid-2">
          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Monthly Revenue</span>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot blue"></span>
                  <span>Gross</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot orange"></span>
                  <span>Net</span>
                </div>
              </div>
            </div>
            <div className="mock-chart-container">
              {Object.entries(monthlyRevenue).length === 0 ? (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    padding: "40px 0",
                  }}
                >
                  No revenue data yet.
                </div>
              ) : (
                Object.entries(monthlyRevenue).map(([month, amount]) => (
                  <div key={month} className="mock-chart-bar-col">
                    <div
                      className="mock-chart-bar"
                      style={{
                        height: `${maxRevenue ? Math.max((amount / maxRevenue) * 100, 8) : 0}%`,
                      }}
                    ></div>
                    <span className="mock-chart-label">
                      {month.slice(0, 3)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Occupancy Donut */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Occupancy Status</span>
            </div>
            <div className="donut-chart-wrapper">
              <div className="donut-ring">
                <div className="donut-center-text">
                  <span className="donut-percentage">{occupancyRate}%</span>
                  <span className="donut-label">Occupied</span>
                </div>
              </div>
            </div>
            <div className="occupancy-legend">
              <div className="occ-legend-row">
                <span className="occ-legend-label">
                  <span className="legend-dot blue"></span> Rented
                </span>
                <span className="occ-legend-val">{occupiedCount}</span>
              </div>
              <div className="occ-legend-row">
                <span className="occ-legend-label">
                  <span className="legend-dot orange"></span> Vacant
                </span>
                <span className="occ-legend-val">{vacantCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="table-card">
          <div className="table-header-row">
            <span className="table-title">Recent System Activities</span>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Status/Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No recent activities yet.
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((act) => (
                    <tr key={act.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{act.user}</span>
                      </td>
                      <td>{act.action}</td>
                      <td>{act.date}</td>
                      <td>
                        {act.status === "Pending" ? (
                          <span className="status-badge failed">Pending</span>
                        ) : act.amount ? (
                          <span style={{ fontWeight: 700, color: "#16a34a" }}>
                            {act.amount}
                          </span>
                        ) : (
                          <span className="status-badge success">Success</span>
                        )}
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

  // 2. OWNER DASHBOARD VIEW
  const renderOwnerDashboard = () => {
    const occupiedCount = units.filter((u) => u.status === "Occupied").length;
    const vacantCount = units.filter((u) => u.status === "Vacant").length;
    const paidBills = bills.filter((b) => b.status === "Paid");
    const ownerRevenue = paidBills.reduce(
      (acc, curr) => acc + curr.totalCost,
      0,
    );
    const pendingMaintenance = tickets.filter(
      (t) => t.status === "Pending",
    ).length;
    const occupancyRate = units.length
      ? ((occupiedCount / units.length) * 100).toFixed(1)
      : "0";

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Owner Dashboard</h1>
            <p className="page-subtitle font-semibold text-blue-600">
              PORTFOLIO OVERVIEW
            </p>
          </div>
          <div className="page-actions">
            <button className="sidebar-add-btn" style={{ width: "auto" }}>
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper blue">
                <Building2 size={20} />
              </div>
              <span className="stat-card-trend up">Live</span>
            </div>
            <span className="stat-card-label">Occupied Units</span>
            <span className="stat-card-value">{occupiedCount} Units</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper green">
                <Building2 size={20} />
              </div>
            </div>
            <span className="stat-card-label">Vacant Units</span>
            <span className="stat-card-value">{vacantCount} Units</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper orange">
                <CreditCard size={20} />
              </div>
            </div>
            <span className="stat-card-label">Monthly Revenue</span>
            <span className="stat-card-value">
              NPR {ownerRevenue.toLocaleString()}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper red">
                <Wrench size={20} />
              </div>
            </div>
            <span className="stat-card-label">Pending Maintenance</span>
            <span className="stat-card-value">{pendingMaintenance} Issues</span>
          </div>
        </div>

        {/* Chart + Quick Actions Grid */}
        <div className="dashboard-grid-2">
          {/* Occupancy Rate */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Occupancy Rate</span>
              <span className="chart-title" style={{ color: "#10b981" }}>
                Live occupancy
              </span>
            </div>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div className="donut-chart-wrapper" style={{ flexGrow: 1 }}>
                <div className="donut-ring owner">
                  <div className="donut-center-text">
                    <span className="donut-percentage">{occupancyRate}%</span>
                    <span className="donut-label">Occupancy Rate</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "40%",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                  <div style={{ color: "#64748b" }}>Monthly Revenue</div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    NPR {ownerRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Quick Actions</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                height: "80%",
              }}
            >
              <Link
                href="/dashboard/properties"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  height: "90px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <Plus
                  size={20}
                  style={{ marginBottom: "6px", color: "#1a56db" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Add Unit
                </span>
              </Link>
              <Link
                href="/dashboard/tenants"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  height: "90px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <Users
                  size={20}
                  style={{ marginBottom: "6px", color: "#10b981" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  New Lease
                </span>
              </Link>
              <Link
                href="/dashboard/billing"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  height: "90px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <CreditCard
                  size={20}
                  style={{ marginBottom: "6px", color: "#f59e0b" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Agreements
                </span>
              </Link>
              <Link
                href="/dashboard/reports"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  height: "90px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <MessageSquare
                  size={20}
                  style={{ marginBottom: "6px", color: "#ef4444" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Broadcast
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating action Plus button */}
        <Link href="/dashboard/properties" className="floating-action-btn">
          <Plus size={24} />
        </Link>
      </div>
    );
  };

  // 3. TENANT DASHBOARD VIEW
  const renderTenantDashboard = () => {
    // Find unit of current tenant
    const myUnit = units.find(
      (u) => u.tenantPhone === user?.phone || u.tenantName === user?.full_name,
    );
    const tenantFlat = myUnit?.flatNo;

    // get tenant's unpaid bills
    const unpaidBill = tenantFlat
      ? bills.find((b) => b.status === "Pending" && b.flatNo === tenantFlat)
      : undefined;
    const totalDue = unpaidBill ? unpaidBill.totalCost : 0;

    const handlePayClick = (bill: any) => {
      setSelectedBill(bill);
      setPayModal(true);
    };

    const handleConfirmPayment = () => {
      if (selectedBill) {
        payBill(selectedBill.id);
        setBills(getBills());
        setPayModal(false);
        alert("Payment Successful via simulated Khalti SDK!");
      }
    };

    // Parse date helper
    const parseDate = (dStr: string) => {
      const parsed = Date.parse(dStr);
      return isNaN(parsed) ? Date.now() : parsed;
    };

    // Dynamic recent activities
    const tenantActivities: any[] = [];

    // 1. Add notices as activities
    notices.forEach((n) => {
      tenantActivities.push({
        id: n.id,
        type: "notice",
        title: n.title,
        desc: n.message.substring(0, 80) + (n.message.length > 80 ? "..." : ""),
        date: n.date,
        icon: "notice",
        timestamp: parseDate(n.date),
      });
    });

    // 2. Add bills as activities
    bills
      .filter((b) => b.flatNo === tenantFlat)
      .forEach((b) => {
        if (b.status === "Paid") {
          tenantActivities.push({
            id: b.id,
            type: "payment",
            title: "Rent Payment Successful",
            desc: `The payment for ${b.month} was processed successfully via ${b.paymentMethod || "wallet"}.`,
            date: b.paymentDate || "Recently",
            icon: "payment",
            timestamp: b.paymentDate
              ? parseDate(b.paymentDate)
              : Date.now() - 86400000 * 2,
          });
        } else {
          tenantActivities.push({
            id: b.id,
            type: "billing",
            title: "Rent Invoice Pending",
            desc: `Invoice for ${b.month} is pending payment.`,
            date: "Awaiting Payment",
            icon: "billing",
            timestamp: Date.now() - 86400000,
          });
        }
      });

    // 3. Add tickets as activities
    tickets
      .filter((t) => t.flatNo === tenantFlat)
      .forEach((t) => {
        let desc = `Work order #${t.id} (${t.description.substring(0, 35)}...) is ${t.status}.`;
        tenantActivities.push({
          id: t.id,
          type: "maintenance",
          title: `Maintenance Request ${t.status}`,
          desc: desc,
          date: t.status === "Fixed" ? "Resolved" : "Updated",
          icon: "maintenance",
          timestamp: Date.now() - 86400000 * 3,
        });
      });

    // Sort by timestamp desc
    const sortedActivities = tenantActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Tenant Dashboard</h1>
            <p className="page-subtitle font-semibold text-blue-600">
              RESIDENCE OVERVIEW
            </p>
          </div>
          <div className="page-actions">
            <span
              className="status-badge success"
              style={{
                display: "inline-flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <Sparkles size={14} /> Verified Tenant
            </span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper blue">
                <CreditCard size={20} />
              </div>
              <span
                className={`stat-card-trend ${totalDue > 0 ? "down" : "up"}`}
              >
                {totalDue > 0 ? "Due" : "Clear"}
              </span>
            </div>
            <span className="stat-card-label">Current Balance</span>
            <span className="stat-card-value">
              NPR {totalDue.toLocaleString()}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper green">
                <Building2 size={20} />
              </div>
              <span className="stat-card-trend up">Assigned</span>
            </div>
            <span className="stat-card-label">Flat</span>
            <span className="stat-card-value">
              {tenantFlat ? `Flat ${tenantFlat}` : "Not assigned"}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper orange">
                <Wrench size={20} />
              </div>
            </div>
            <span className="stat-card-label">Maintenance</span>
            <span className="stat-card-value">
              {
                tickets.filter(
                  (t) => t.flatNo === tenantFlat && t.status !== "Fixed",
                ).length
              }{" "}
              Open
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon-wrapper red">
                <FileText size={20} />
              </div>
            </div>
            <span className="stat-card-label">Latest Notices</span>
            <span className="stat-card-value">{notices.length} Notices</span>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div
            className="chart-card"
            style={{
              background: "linear-gradient(135deg, #002060 0%, #1a56db 100%)",
              color: "#ffffff",
            }}
          >
            <div className="chart-header">
              <span className="chart-title" style={{ color: "#ffffff" }}>
                Billing Summary
              </span>
              <span style={{ fontSize: "13px", opacity: 0.85 }}>
                {unpaidBill ? unpaidBill.month : "No dues pending"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{ fontSize: "14px", opacity: 0.82, fontWeight: 500 }}
                >
                  Current Balance
                </span>
                <h2
                  style={{
                    fontSize: "clamp(30px, 5vw, 44px)",
                    fontWeight: 800,
                    margin: "8px 0",
                  }}
                >
                  NPR {totalDue.toLocaleString()}
                </h2>
                <p style={{ fontSize: "13px", opacity: 0.84, margin: 0 }}>
                  {tenantFlat
                    ? `Linked to Flat ${tenantFlat}`
                    : "No residence assigned yet"}
                </p>
              </div>
              {unpaidBill ? (
                <button
                  onClick={() => handlePayClick(unpaidBill)}
                  className="btn-primary"
                  style={{
                    background: "#ffffff",
                    color: "#1a56db",
                    width: "auto",
                    padding: "12px 24px",
                  }}
                >
                  Pay Now
                </button>
              ) : (
                <span
                  className="status-badge success"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    color: "#ffffff",
                  }}
                >
                  Payment Clear
                </span>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Quick Actions</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              <Link
                href="/dashboard/billing"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  minHeight: "92px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <CreditCard
                  size={20}
                  style={{ marginBottom: "6px", color: "#1a56db" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Pay Rent
                </span>
              </Link>
              <Link
                href="/dashboard/maintenance"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  minHeight: "92px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <Wrench
                  size={20}
                  style={{ marginBottom: "6px", color: "#10b981" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Repair
                </span>
              </Link>
              <Link
                href="/dashboard/reports"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  minHeight: "92px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <FileText
                  size={20}
                  style={{ marginBottom: "6px", color: "#f59e0b" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Notices
                </span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="sidebar-nav-item active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderLeft: "none",
                  borderRadius: "12px",
                  minHeight: "92px",
                  color: "#1e293b",
                  background: "#f8fafc",
                }}
              >
                <Users
                  size={20}
                  style={{ marginBottom: "6px", color: "#ef4444" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  Profile
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="table-card">
            <div className="table-header-row">
              <span className="table-title">Recent Activity</span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {sortedActivities.length > 0 ? (
                sortedActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background:
                            act.icon === "payment"
                              ? "#ecfdf5"
                              : act.icon === "maintenance"
                                ? "#eff6ff"
                                : "#fffbeb",
                          color:
                            act.icon === "payment"
                              ? "#10b981"
                              : act.icon === "maintenance"
                                ? "#3b82f6"
                                : "#d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {act.icon === "payment" && <CreditCard size={18} />}
                        {act.icon === "maintenance" && <Wrench size={18} />}
                        {act.icon !== "payment" &&
                          act.icon !== "maintenance" && (
                            <AlertTriangle size={18} />
                          )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                          {act.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            lineHeight: 1.5,
                          }}
                        >
                          {act.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {act.date}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#64748b",
                    padding: "20px 0",
                  }}
                >
                  No recent activities.
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Residence Details</span>
            </div>
            {myUnit ? (
              <div>
                <div
                  className="card-image-wrapper"
                  style={{ borderRadius: "8px", marginBottom: "16px" }}
                >
                  <img
                    src={myUnit.image}
                    className="card-image"
                    alt="building"
                  />
                  <span className="card-badge">Current Residence</span>
                </div>
                <span className="card-title">Flat {myUnit.flatNo}</span>
                <span className="card-meta">{myUnit.floor}</span>
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "14px",
                    marginTop: "14px",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  <span>
                    Flat No: <b style={{ color: "#0f172a" }}>{myUnit.flatNo}</b>
                  </span>
                  <span>
                    Monthly Rent:{" "}
                    <b style={{ color: "#0f172a" }}>
                      NPR {myUnit.rent.toLocaleString()}
                    </b>
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: "#64748b", lineHeight: 1.6 }}>
                <span className="card-title">No residence assigned</span>
                <p style={{ marginTop: "8px" }}>
                  Your owner has not assigned a unit yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Khalti Payment Modal */}
        {payModal && selectedBill && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Khalti Payment Portal</h3>
                <button
                  onClick={() => setPayModal(false)}
                  className="modal-close-btn"
                >
                  ×
                </button>
              </div>
              <div
                className="invoice-preview-card"
                style={{ border: "none", padding: 0 }}
              >
                <div className="invoice-preview-header">
                  <span className="invoice-preview-title">
                    Invoice #{selectedBill.id}
                  </span>
                  <div className="invoice-preview-amount">
                    NPR {selectedBill.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="invoice-preview-details">
                  <div className="inv-detail-row">
                    <span>Rent Due</span>
                    <span className="inv-detail-val">
                      NPR {selectedBill.rentCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="inv-detail-row">
                    <span>Electricity</span>
                    <span className="inv-detail-val">
                      NPR {selectedBill.electricityCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="inv-detail-row">
                    <span>Water & Sewage</span>
                    <span className="inv-detail-val">
                      NPR {selectedBill.waterCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="inv-detail-row">
                    <span>Service Fee</span>
                    <span className="inv-detail-val">
                      NPR {selectedBill.serviceCost.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button onClick={handleConfirmPayment} className="btn-khalti">
                  Pay NPR {selectedBill.totalCost.toLocaleString()} with Khalti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Role Routing logic
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  if (user.role === "Admin") {
    return renderAdminDashboard();
  } else if (user.role === "Owner") {
    return renderOwnerDashboard();
  } else {
    return renderTenantDashboard();
  }
}
