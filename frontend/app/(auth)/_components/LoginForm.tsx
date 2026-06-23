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
      const { token, user } = response.data;

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
            <div className="auth-footer">
              Don&apos;t have an account? <Link href="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
