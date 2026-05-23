"use client";

import { Building, ChevronDown, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="login-background">
      <div className="login-wrapper">
        <div className="login-brand">
          <Building className="login-brand-icon" />

          <h1 className="login-brand-name">Apartment Sewa</h1>
        </div>

        <div className="login-card">
          <h2 className="login-title">Login Page</h2>

          <p className="login-subtitle">
            Access the property management portal
          </p>

          <form>
            <div className="form-group">
              <label className="form-label">Access Role</label>

              <div className="form-select-wrapper">
                <select className="form-select">
                  <option>Tenant</option>
                  <option>Owner</option>
                  <option>Admin</option>
                </select>

                <ChevronDown className="form-select-arrow" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>

              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />

                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>

              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>
            </div>

            <button
            type="submit"
            className="btn-primary"
            >
                Login

                <ArrowRight className="btn-arrow" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
