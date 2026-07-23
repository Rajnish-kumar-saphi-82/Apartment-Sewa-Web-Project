"use client";
import {
  Building,
  ChevronDown,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api/auth";

import { LoginFormData, loginSchema } from "./schema";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const loginWithGoogle = (role: "Tenant" | "Owner") => {
    window.location.href = `http://localhost:8090/api/v1/auth/google?role=${role}`;
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const { login: contextLogin } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);

      const token = response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;

      if (!token) {
        throw new Error("Login failed: No token received from server.");
      }

      contextLogin(token, user);

      router.push("/dashboard");
    } catch (error: any) {
      setError("root", {
        message:
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again.",
      });
    }
  };
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="form-input"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {errors.root && <p className="form-error">{errors.root.message}</p>}

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in…" : "Login"}
              {!isSubmitting && <ArrowRight className="btn-arrow" />}
            </button>

            {/* Google Sign-in — single button with role popup */}
            <div style={{ position: "relative", margin: "20px 0 4px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </div>

            {/* Role picker modal */}
            {showRolePicker && (
              <div
                style={{
                  position: "fixed", inset: 0, zIndex: 1000,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => setShowRolePicker(false)}
              >
                <div
                  style={{
                    background: "#fff", borderRadius: "16px",
                    padding: "32px 28px", width: "320px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    textAlign: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Google logo */}
                  <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "12px" }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                    Continue with Google
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px" }}>
                    How are you joining? Choose your role.
                  </p>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {/* Tenant */}
                    <button
                      type="button"
                      onClick={() => loginWithGoogle("Tenant")}
                      style={{
                        flex: 1, padding: "14px 10px", borderRadius: "10px",
                        border: "2px solid #e2e8f0", background: "#f0fdf4",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.background = "#dcfce7"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f0fdf4"; }}
                    >
                      <div style={{ fontSize: "26px", marginBottom: "6px" }}>🏠</div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#16a34a" }}>Tenant</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>I rent a unit</div>
                    </button>
                    {/* Owner */}
                    <button
                      type="button"
                      onClick={() => loginWithGoogle("Owner")}
                      style={{
                        flex: 1, padding: "14px 10px", borderRadius: "10px",
                        border: "2px solid #e2e8f0", background: "#eff6ff",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#dbeafe"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#eff6ff"; }}
                    >
                      <div style={{ fontSize: "26px", marginBottom: "6px" }}>🏢</div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#1d4ed8" }}>Owner</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>I own property</div>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRolePicker(false)}
                    style={{ marginTop: "18px", fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Single Google Button */}
            <button
              type="button"
              onClick={() => setShowRolePicker(true)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px", padding: "11px 16px",
                border: "1.5px solid #e2e8f0", borderRadius: "8px",
                background: "#ffffff", color: "#1e293b", fontWeight: 600,
                fontSize: "14px", cursor: "pointer", transition: "all 0.2s", marginTop: "4px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>

            {/* Register link - moved to very bottom */}
            <div className="auth-footer" style={{ marginTop: "20px" }}>
              Don&apos;t have an account? <Link href="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
