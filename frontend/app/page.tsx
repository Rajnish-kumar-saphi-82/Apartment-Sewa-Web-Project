"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ArrowRight, Wrench, ShieldCheck, Home } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"owners" | "tenants">("owners");

  const ownerSteps = [
    {
      num: 1,
      title: "Create units",
      desc: "Add flats, rent amounts, occupancy status, and tenant assignments.",
    },
    {
      num: 2,
      title: "Manage tenants",
      desc: "Register tenants, generate house codes, and keep resident records in one place.",
    },
    {
      num: 3,
      title: "Generate bills",
      desc: "Create monthly bills using rent, electricity, water, and service charges.",
    },
    {
      num: 4,
      title: "Handle repairs",
      desc: "Review maintenance requests and update repair status for tenants.",
    },
  ];

  const tenantSteps = [
    {
      num: 1,
      title: "See balance",
      desc: "Open your dashboard and view current dues, notices, and recent activity.",
    },
    {
      num: 2,
      title: "Pay bills",
      desc: "Review rent and utility breakdowns before completing payment.",
    },
    {
      num: 3,
      title: "Request repair",
      desc: "Upload issue photos and send maintenance requests to the owner.",
    },
    {
      num: 4,
      title: "Update profile",
      desc: "Keep your contact details and password up to date from the same account page.",
    },
  ];

  const activeSteps = activeTab === "owners" ? ownerSteps : tenantSteps;

  return (
    <div className="landing-container">
      <header className="landing-navbar">
        <Link href="/" className="landing-logo">
          <Building2 className="landing-logo-icon" size={28} />
          <span className="landing-logo-title">Apartment Sewa</span>
        </Link>

        <nav className="landing-nav-links">
          <Link href="/" className="landing-nav-link">
            Home
          </Link>
          <Link href="#features" className="landing-nav-link">
            Features
          </Link>
          <Link href="/login" className="landing-login-btn">
            Login
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-left">
          <span className="landing-hero-tag">Apartment Sewa Web Portal</span>
          <h1 className="landing-hero-title">
            One shared system for <span>owners and tenants</span>
          </h1>
          <p className="landing-hero-desc">
            Login and register lead into the same clean dashboard experience for
            billing, units, tenants, notices, maintenance, and account settings.
          </p>
          <div className="landing-hero-ctas">
            <Link href="/register" className="hero-btn-primary">
              Create Account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="hero-btn-secondary">
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="landing-hero-right">
          <img
            src="/assets/images/login-bg.png"
            className="landing-hero-img"
            alt="Apartment Building"
          />
        </div>
      </section>

      <section id="features" className="landing-features-sec">
        <span className="section-tag">Same backend, same workflow</span>
        <h2 className="section-title">
          A web dashboard that matches the mobile app features
        </h2>
        <p className="section-desc">
          The web pages use the same account, billing, tenant, notice, and
          maintenance flows as the mobile design.
        </p>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper blue">
              <Home size={24} />
            </div>
            <span className="feature-title">Owner Dashboard</span>
            <p className="feature-desc">
              Manage units, tenants, monthly bills, notices, and maintenance
              updates from the protected web dashboard.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper purple">
              <Wrench size={24} />
            </div>
            <span className="feature-title">Tenant Tools</span>
            <p className="feature-desc">
              Tenants can view bills, pay dues, request maintenance, read
              notices, and update account details.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper green">
              <ShieldCheck size={24} />
            </div>
            <span className="feature-title">Protected Access</span>
            <p className="feature-desc">
              Public login/register pages stay separate from protected dashboard
              pages through frontend proxy authentication.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-flow-sec">
        <span className="section-tag">Role-based experience</span>
        <h2 className="section-title">
          Owners and tenants see the right tools after login
        </h2>

        <div className="flow-tabs-header">
          <button
            onClick={() => setActiveTab("owners")}
            className={`flow-tab-btn ${activeTab === "owners" ? "active" : ""}`}
          >
            For Owners
          </button>
          <button
            onClick={() => setActiveTab("tenants")}
            className={`flow-tab-btn ${activeTab === "tenants" ? "active" : ""}`}
          >
            For Tenants
          </button>
        </div>

        <div className="flow-steps-grid">
          {activeSteps.map((step) => (
            <div key={step.num} className="flow-step-card">
              <div className="flow-step-num">{step.num}</div>
              <span className="flow-step-title">{step.title}</span>
              <p className="flow-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-banner">
        <h2 className="cta-title">Continue into Apartment Sewa</h2>
        <p className="cta-desc">
          Register a new account or login to continue with the same visual
          system used across the dashboard.
        </p>
        <div className="cta-buttons">
          <Link href="/register" className="cta-btn-white">
            Register
          </Link>
          <Link href="/login" className="cta-btn-outline">
            Login
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link href="/" className="landing-logo">
              <Building2 className="landing-logo-icon" size={24} />
              <span className="landing-logo-title" style={{ fontSize: "18px" }}>
                Apartment Sewa
              </span>
            </Link>
            <p className="footer-brand-desc">
              A clean shared web dashboard for Apartment Sewa owners and
              tenants.
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-title">Product</span>
            <Link href="/dashboard" className="footer-link">
              Dashboard
            </Link>
            <Link href="/dashboard/billing" className="footer-link">
              Billing
            </Link>
            <Link href="/dashboard/maintenance" className="footer-link">
              Maintenance
            </Link>
            <Link href="/dashboard/reports" className="footer-link">
              Notices
            </Link>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-title">Resources</span>
            <Link href="/login" className="footer-link">
              Login
            </Link>
            <Link href="/register" className="footer-link">
              Register
            </Link>
            <Link href="/dashboard/profile" className="footer-link">
              Profile
            </Link>
            <Link href="/dashboard/settings" className="footer-link">
              Settings
            </Link>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-title">Company</span>
            <Link href="/" className="footer-link">
              About Us
            </Link>
            <Link href="/" className="footer-link">
              Contact
            </Link>
            <Link href="/" className="footer-link">
              Careers
            </Link>
            <Link href="/" className="footer-link">
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © 2026 Apartment Sewa. All rights reserved. Built for Nepal.
          </p>
          <div className="footer-bottom-links">
            <Link href="/" className="footer-bottom-link">
              Terms of Service
            </Link>
            <Link href="/" className="footer-bottom-link">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
