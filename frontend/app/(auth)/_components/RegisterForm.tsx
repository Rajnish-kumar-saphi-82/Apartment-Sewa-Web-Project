// "use client";

// import {
//   User,
//   Mail,
//   Lock,
//   Building,
//   Link as LinkIcon,
//   Eye,
//   EyeOff,
//   ArrowRight,
// } from "lucide-react";

// import { useState } from "react";

// import Link from "next/link";

// export default function RegisterPage() {
//   const [userType, setUserType] = useState("Owner");

//   const [showPassword, setShowPassword] = useState(false);

//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   return (
//     <div className="register-container">
//       <div className="register-left">
//         <div className="brand-container">
//           <Building className="brand-icon" />

//           <h1 className="brand-name">Apartment Sewa</h1>
//         </div>

//         <h2 className="register-title">Create Admin Account</h2>

//         <p className="register-subtitle">
//           Set up your property management profile.
//         </p>

//         <label className="user-type-label">Select User Type</label>

//         <div className="user-type-toggle">
//           <button
//             type="button"
//             onClick={() => setUserType("Owner")}
//             className={`user-type-btn ${userType === "Owner" ? "active" : ""}`}
//           >
//             Owner
//           </button>

//           <button
//             type="button"
//             onClick={() => setUserType("Tenant")}
//             className={`user-type-btn ${userType === "Tenant" ? "active" : ""}`}
//           >
//             Tenant
//           </button>
//         </div>

//         <form>
//           <div className="form-group">
//             <label className="form-label">Full Name</label>

//             <div className="form-input-wrapper">
//               <User className="form-input-icon" />

//               <input
//                 type="text"
//                 placeholder="Rajnish Kumar Saphi"
//                 className="form-input"
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label className="form-label">Email Address</label>

//             <div className="form-input-wrapper">
//               <Mail className="form-input-icon" />

//               <input
//                 type="email"
//                 placeholder="rajnish@example.com"
//                 className="form-input"
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label className="form-label">Password</label>

//             <div className="form-input-wrapper">
//               <Lock className="form-input-icon" />

//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="********"
//                 className="form-input"
//               />

//               <button
//                 type="button"
//                 className="form-input-action"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <div className="form-group">
//             <label className="form-label">Confirm Password</label>

//             <div className="form-input-wrapper">
//               <Lock className="form-input-icon" />

//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="********"
//                 className="form-input"
//               />

//               <button
//                 type="button"
//                 className="form-input-action"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           {/* <div className="form-group">

//             <label className="form-label">
//               House Link Code
//             </label>

//             <div className="form-input-wrapper">

//               <LinkIcon className="form-input-icon" />

//               <input
//                 type="text"
//                 placeholder="HSE-XXXX-XXXX"
//                 className="form-input"
//               />

//             </div>

//             <p className="form-helper-text">
//               Contact your property owner for your unique link code.
//             </p>

//           </div> */}

//           <button type="submit" className="btn-primary">
//             Create Account
//             <ArrowRight className="btn-arrow" />
//           </button>
//         </form>

//         <div className="auth-footer">
//           Already have an account? <Link href="/login">Log in</Link>
//         </div>
//       </div>

//       <div className="register-right">
//         <img src="/assets/images/login-bg.png" alt="Apartment" />
//       </div>
//     </div>
//   );
// }
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


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
// import useRegisterForm from "@/app/hooks/useRegisterForm";
import { COUNTRY_CODES } from "@/app/schemas/register.schema";
import useRegisterForm from "@/app/hooks/useRegisterForm";
/**
 * RegisterForm — renders the UI. All logic lives in useRegisterForm.
 *
 * Fields: User Type · Full Name · Email · Phone (with Country Code)
 *         · Password · Confirm Password
 */
export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    userType,
    setUserType,
    countryCode,
    phone,
  } = useRegisterForm();
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
        {/* User-type toggle (controlled by setUserType because it's buttons, not a native input) */}
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
          <p className="form-error" style={{ marginTop: "-20px", marginBottom: "16px" }}>
            {errors.userType.message}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
          {/* Email */}
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
          {/* 🆕 Phone Number + Country Code */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="phone-row">
              {/* Country code dropdown */}
              <div className="phone-country">
                <div className="form-select-wrapper">
                  <select
                    className="form-select"
                    {...register("countryCode")}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.short} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="form-select-arrow" />
                </div>
              </div>
              {/* Phone input */}
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
            {/* {(phone || countryCode) && !errors.phone && (
              <p className="form-helper-text">
                Selected: <strong>{countryCode}</strong>
                {phone && ` ${phone}`}
              </p>
            )} */}
            {errors.countryCode && (
              <p className="form-error">{errors.countryCode.message}</p>
            )}
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>
          {/* Password */}
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
          {/* Confirm Password */}
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
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
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