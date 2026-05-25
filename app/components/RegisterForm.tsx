"use client";

import {
  User,
  Mail,
  Lock,
  Building,
  Link as LinkIcon,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";

import Link from "next/link";

export default function RegisterPage() {
  const [userType, setUserType] = useState("Owner");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="brand-container">
          <Building className="brand-icon" />

          <h1 className="brand-name">Apartment Sewa</h1>
        </div>

        <h2 className="register-title">Create Admin Account</h2>

        <p className="register-subtitle">
          Set up your property management profile.
        </p>

        <label className="user-type-label">Select User Type</label>

        <div className="user-type-toggle">
          <button
            type="button"
            onClick={() => setUserType("Owner")}
            className={`user-type-btn ${userType === "Owner" ? "active" : ""}`}
          >
            Owner
          </button>

          <button
            type="button"
            onClick={() => setUserType("Tenant")}
            className={`user-type-btn ${userType === "Tenant" ? "active" : ""}`}
          >
            Tenant
          </button>
        </div>

        <form>
          <div className="form-group">
            <label className="form-label">Full Name</label>

            <div className="form-input-wrapper">
              <User className="form-input-icon" />

              <input
                type="text"
                placeholder="Rajnish Kumar Saphi"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>

            <div className="form-input-wrapper">
              <Mail className="form-input-icon" />

              <input
                type="email"
                placeholder="rajnish@example.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="form-input"
              />

              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>

            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                className="form-input"
              />

              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* <div className="form-group">

            <label className="form-label">
              House Link Code
            </label>

            <div className="form-input-wrapper">

              <LinkIcon className="form-input-icon" />

              <input
                type="text"
                placeholder="HSE-XXXX-XXXX"
                className="form-input"
              />

            </div>

            <p className="form-helper-text">
              Contact your property owner for your unique link code.
            </p>

          </div> */}

          <button type="submit" className="btn-primary">
            Create Account
            <ArrowRight className="btn-arrow" />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>

      <div className="register-right">
        <img src="/assets/images/login-bg.png" alt="Apartment" />
      </div>
    </div>
  );
}
