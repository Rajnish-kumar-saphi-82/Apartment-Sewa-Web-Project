"use client";

import { useEffect, useState } from "react";
import {
  Search,
  CreditCard,
  Plus,
  HelpCircle,
  Shield,
  Check,
  Info,
} from "lucide-react";
import {
  getBills,
  addBill,
  payBill,
  getUnits,
  Bill,
  Unit,
} from "@/lib/mockData";
import { useAuth } from "@/lib/context/AuthContext";

export default function BillingPage() {
  const { user } = useAuth();

  // States
  const [bills, setBills] = useState<Bill[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Generator states
  const [genFlat, setGenFlat] = useState("");
  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const [genMonth, setGenMonth] = useState(currentMonth);
  const [prevReading, setPrevReading] = useState(0);
  const [currReading, setCurrReading] = useState("");
  const [waterCost, setWaterCost] = useState("");
  const [serviceFee, setServiceFee] = useState("");

  // Admin filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  // Payment preview modal
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    setBills(getBills());
    setUnits(getUnits());
  }, []);

  // Handler to generate bill
  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFlat || !currReading || !waterCost || !serviceFee) {
      alert("Please fill in all fields.");
      return;
    }

    const currVal = Number(currReading);
    if (currVal < prevReading) {
      alert("Current reading cannot be lower than previous reading.");
      return;
    }

    // Get flat rent
    const selectedUnit = units.find((u) => u.flatNo === genFlat);
    const rentAmount = selectedUnit ? selectedUnit.rent : 0;

    // Calculate electricity
    const consumption = currVal - prevReading;
    const electricityCost = consumption * 12; // 12 NPR per unit

    // Add to storage
    addBill(
      genFlat,
      genMonth,
      rentAmount,
      electricityCost,
      Number(waterCost),
      Number(serviceFee),
    );

    // Refresh bills
    setBills(getBills());

    // Reset inputs
    setCurrReading("");
    alert(`Invoice created successfully for Flat ${genFlat}!`);
  };

  // Handler to process simulated Khalti pay
  const handleKhaltiPay = () => {
    if (selectedBill) {
      payBill(selectedBill.id);

      // Refresh
      setBills(getBills());
      setShowPayModal(false);
      setSelectedBill(null);
      alert(
        "Thank you! Payment of NPR " +
          selectedBill.totalCost.toLocaleString() +
          " processed successfully via Khalti Wallet!",
      );
    }
  };

  // 1. ADMIN VIEW: PAYMENT MONITORING (Page 5)
  const renderAdminBilling = () => {
    const filteredBills = bills.filter((b) => {
      const matchStatus =
        statusFilter === "all" ? true : b.status === statusFilter;
      const matchMonth =
        monthFilter === "all" ? true : b.month.includes(monthFilter);
      return matchStatus && matchMonth;
    });

    const months = Array.from(new Set(bills.map((b) => b.month)));

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Payment Monitoring</h1>
            <p className="page-subtitle">
              Track rent collection and outstanding utility invoices
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="table-card"
          style={{ marginBottom: "24px", padding: "16px 24px" }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="form-select-wrapper" style={{ width: "160px" }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Invoices</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="form-select-wrapper" style={{ width: "160px" }}>
              <select
                className="form-select"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="all">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Flat</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No payment records yet.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr
                      key={b.id}
                      className={b.status === "Pending" ? "unpaid-row" : ""}
                    >
                      <td>
                        <span style={{ fontWeight: 600 }}>{b.tenantName}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>Flat {b.flatNo}</span>
                      </td>
                      <td>{b.month}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>
                          NPR {b.totalCost.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${b.status === "Paid" ? "success" : "failed"}`}
                        >
                          {b.status === "Paid" ? "Paid" : "Pending"}
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

  // 2. OWNER VIEW: BILLING GENERATOR (Page 10)
  const renderOwnerBilling = () => {
    // Current calculations
    const selectedUnit = units.find((u) => u.flatNo === genFlat);
    const rentVal = selectedUnit ? selectedUnit.rent : 0;
    const currVal = Number(currReading) || prevReading;
    const consumption = currVal - prevReading;
    const electricityCost = consumption * 12;
    const totalVal =
      rentVal +
      electricityCost +
      (Number(waterCost) || 0) +
      (Number(serviceFee) || 0);

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Billing Generator</h1>
            <p className="page-subtitle">
              Calculate and dispatch monthly tenant invoices
            </p>
          </div>
        </div>

        <div className="billing-layout">
          {/* Input Form */}
          <div className="chart-card">
            <form
              onSubmit={handleGenerateBill}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Occupied Flat</label>
                  <div className="form-select-wrapper">
                    <select
                      className="form-select"
                      value={genFlat}
                      onChange={(e) => setGenFlat(e.target.value)}
                      required
                    >
                      <option value="">-- Select flat --</option>
                      {units
                        .filter((u) => u.status === "Occupied")
                        .map((u) => (
                          <option key={u.id} value={u.flatNo}>
                            Flat {u.flatNo} ({u.tenantName})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Billing Month</label>
                  <div className="form-select-wrapper">
                    <select
                      className="form-select"
                      value={genMonth}
                      onChange={(e) => setGenMonth(e.target.value)}
                      required
                    >
                      <option value={currentMonth}>{currentMonth}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Previous Meter Reading (kWh)
                  </label>
                  <div
                    className="form-input-wrapper"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <input
                      type="number"
                      className="form-input"
                      value={prevReading}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Current Meter Reading (kWh)
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 12695"
                      value={currReading}
                      onChange={(e) => setCurrReading(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Water & Sewage flat fee (NPR)
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      value={waterCost}
                      onChange={(e) => setWaterCost(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Common Area Service Fee (NPR)
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      type="number"
                      className="form-input"
                      value={serviceFee}
                      onChange={(e) => setServiceFee(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Generate and Disseminate Invoice
              </button>
            </form>
          </div>

          <div className="invoice-preview-card">
            <div className="invoice-preview-header">
              <span className="invoice-preview-title">
                Invoice Preview (Flat {genFlat || "..."})
              </span>
              <div className="invoice-preview-amount">
                NPR {totalVal.toLocaleString()}
              </div>
            </div>
            <div className="invoice-preview-details">
              <div className="inv-detail-row">
                <span>Base Apartment Rent</span>
                <span className="inv-detail-val">
                  NPR {rentVal.toLocaleString()}
                </span>
              </div>
              <div className="inv-detail-row">
                <span>Electricity ({consumption} kWh @ Rs 12)</span>
                <span className="inv-detail-val">
                  NPR {electricityCost.toLocaleString()}
                </span>
              </div>
              <div className="inv-detail-row">
                <span>Water & Sewage Cost</span>
                <span className="inv-detail-val">
                  NPR {(Number(waterCost) || 0).toLocaleString()}
                </span>
              </div>
              <div className="inv-detail-row">
                <span>Service & Security Fee</span>
                <span className="inv-detail-val">
                  NPR {(Number(serviceFee) || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                background: "rgba(16, 185, 129, 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(16, 185, 129, 0.1)",
                display: "flex",
                gap: "8px",
              }}
            >
              <Info size={18} style={{ color: "#10b981", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#065f46" }}>
                Calculations refresh in real-time as values are inputted.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. TENANT VIEW: BILLING & PAYMENT (Page 13)
  const renderTenantBilling = () => {
    const tenantBills = bills.filter((b) => b.tenantName === user?.full_name);
    const pendingBill = tenantBills.find((b) => b.status === "Pending");

    return (
      <div>
        <div className="page-header">
          <div className="page-title-area">
            <h1 className="page-title">Payment Center</h1>
            <p className="page-subtitle">
              View utility breakdowns and securely clear outstanding dues
            </p>
          </div>
        </div>

        {pendingBill ? (
          <div className="billing-layout" style={{ marginBottom: "32px" }}>
            {/* Bill items */}
            <div>
              <div className="bill-item-row">
                <div className="bill-item-info">
                  <div className="bill-item-icon-wrapper">🏠</div>
                  <div>
                    <span className="bill-item-title">Monthly Flat Rent</span>
                    <p className="bill-item-desc">Base accommodation billing</p>
                  </div>
                </div>
                <span className="bill-item-amount">
                  NPR {pendingBill.rentCost.toLocaleString()}
                </span>
              </div>

              <div className="bill-item-row">
                <div className="bill-item-info">
                  <div className="bill-item-icon-wrapper">⚡</div>
                  <div>
                    <span className="bill-item-title">Electricity Bill</span>
                    <p className="bill-item-desc">Metered energy consumption</p>
                  </div>
                </div>
                <span className="bill-item-amount">
                  NPR {pendingBill.electricityCost.toLocaleString()}
                </span>
              </div>

              <div className="bill-item-row">
                <div className="bill-item-info">
                  <div className="bill-item-icon-wrapper">💧</div>
                  <div>
                    <span className="bill-item-title">Water & Sewage</span>
                    <p className="bill-item-desc">Fixed utility distribution</p>
                  </div>
                </div>
                <span className="bill-item-amount">
                  NPR {pendingBill.waterCost.toLocaleString()}
                </span>
              </div>

              <div className="bill-item-row">
                <div className="bill-item-info">
                  <div className="bill-item-icon-wrapper">🧹</div>
                  <div>
                    <span className="bill-item-title">
                      Common Area Maintenance
                    </span>
                    <p className="bill-item-desc">
                      Security, cleaning, and elevator services
                    </p>
                  </div>
                </div>
                <span className="bill-item-amount">
                  NPR {pendingBill.serviceCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Payment Box */}
            <div className="invoice-preview-card">
              <div className="invoice-preview-header">
                <span className="invoice-preview-title">Total Outstanding</span>
                <div className="invoice-preview-amount">
                  NPR {pendingBill.totalCost.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  margin: "16px 0",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Billing period: <b>{pendingBill.month}</b>
                </span>
                <span style={{ fontSize: "13px", color: "#ef4444" }}>
                  Dues status: <b>UNPAID</b>
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedBill(pendingBill);
                  setShowPayModal(true);
                }}
                className="btn-khalti"
              >
                Pay with Khalti
              </button>
            </div>
          </div>
        ) : (
          <div
            className="chart-card"
            style={{
              textAlign: "center",
              padding: "40px",
              marginBottom: "32px",
            }}
          >
            <span style={{ fontSize: "16px", color: "#64748b" }}>
              Great news! You have no outstanding bills pending payment.
            </span>
          </div>
        )}

        {/* History Table */}
        <div className="table-card">
          <div className="table-header-row">
            <span className="table-title">Payment History Ledger</span>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Receipt Date</th>
                  <th>Method</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantBills.filter((b) => b.status === "Paid").length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No payment history yet.
                    </td>
                  </tr>
                ) : (
                  tenantBills
                    .filter((b) => b.status === "Paid")
                    .map((b) => (
                      <tr key={b.id}>
                        <td>{b.month}</td>
                        <td>{b.paymentDate}</td>
                        <td>{b.paymentMethod}</td>
                        <td>
                          <span style={{ fontWeight: 700 }}>
                            NPR {b.totalCost.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge success">Paid</span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayModal && selectedBill && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Complete Khalti Payment</h3>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="modal-close-btn"
                >
                  ×
                </button>
              </div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "14px", color: "#64748b" }}>
                  Paying Apartment Sewa via Khalti
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#5c2d91",
                    marginTop: "8px",
                  }}
                >
                  NPR {selectedBill.totalCost.toLocaleString()}
                </div>
              </div>
              <button onClick={handleKhaltiPay} className="btn-khalti">
                Simulate Khalti SDK Payment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Routing
  if (!user)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );

  if (user.role === "Admin") {
    return renderAdminBilling();
  } else if (user.role === "Owner") {
    return renderOwnerBilling();
  } else {
    return renderTenantBilling();
  }
}
