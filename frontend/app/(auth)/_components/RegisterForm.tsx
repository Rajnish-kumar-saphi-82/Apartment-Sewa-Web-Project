"use client";
import {
  User,
  Mail,
  Phone,
  Lock,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { register as registerUser } from "@/lib/api/auth";
import { COUNTRY_CODES, RegisterFormData, registerSchema } from "./schema";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "Tenant",
      countryCode: "+977",
    },
  });

  const userType = watch("userType");
  const countryCode = watch("countryCode");
  const phone = watch("phone");

  const setUserType = (type: "Owner" | "Tenant") => {
    setValue("userType", type, { shouldValidate: true });
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      router.push("/login");
    } catch (error: any) {
      setError("root", {
        message: error.message || "Registration failed. Please try again.",
      });
    }
  };

  const title =
    userType === "Owner" ? "Create Owner Account" : "Create Tenant Account";
  const subtitle =
    userType === "Owner"
      ? "Set up your property management profile."
      : "Set up your tenant profile.";

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="brand-container">
          <Building className="brand-icon" />
          <h1 className="brand-name">Apartment Sewa</h1>
        </div>
        <h2 className="register-title">{title}</h2>
        <p className="register-subtitle">{subtitle}</p>

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
        {errors.userType && (
          <p
            className="form-error"
            style={{ marginTop: "-20px", marginBottom: "16px" }}
          >
            {errors.userType.message}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {errors.root && <p className="form-error">{errors.root.message}</p>}

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrapper">
              <User className="form-input-icon" />
              <input
                type="text"
                placeholder="Enter your Name"
                className="form-input"
                autoComplete="name"
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="form-error">{errors.fullName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Phone Number</label>
            <div className="phone-row">
              {/* Country code dropdown */}
              <div className="phone-country">
                <div className="form-select-wrapper">
                  <select className="form-select" {...register("countryCode")}>
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.short} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="form-select-arrow" />
                </div>
              </div>

              <div className="phone-input">
                <div className="form-input-wrapper">
                  <Phone className="form-input-icon" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98XXXXXXXX"
                    className="form-input"
                    autoComplete="tel-national"
                    {...register("phone")}
                  />
                </div>
              </div>
            </div>

            {errors.countryCode && (
              <p className="form-error">{errors.countryCode.message}</p>
            )}
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="form-input"
                autoComplete="new-password"
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                className="form-input"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="form-input-action"
                onClick={toggleShowConfirmPassword}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Account"}
            {!isSubmitting && <ArrowRight className="btn-arrow" />}
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
