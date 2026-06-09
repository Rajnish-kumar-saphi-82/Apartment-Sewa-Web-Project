// "use client";

// import {
//   Building,
//   ChevronDown,
//   Mail,
//   Lock,
//   ArrowRight,
//   Eye,
//   EyeOff,
// } from "lucide-react";

// import Link from "next/link";
// import { useState } from "react";

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <div className="login-background">
//       <div className="login-wrapper">
//         <div className="login-brand">
//           <Building className="login-brand-icon" />

//           <h1 className="login-brand-name">Apartment Sewa</h1>
//         </div>

//         <div className="login-card">
//           <h2 className="login-title">Login Page</h2>

//           <p className="login-subtitle">
//             Access the property management portal
//           </p>

//           <form>
//             <div className="form-group">
//               <label className="form-label">Access Role</label>

//               <div className="form-select-wrapper">
//                 <select className="form-select">
//                   <option>Tenant</option>
                  

//                   <option>Owner</option>

//                   <option>Admin</option>
//                 </select>

//                 <ChevronDown className="form-select-arrow" />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Email</label>

//               <div className="form-input-wrapper">
//                 <Mail className="form-input-icon" />

//                 <input
//                   type="email"
//                   placeholder="Enter your Email"
//                   className="form-input"
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Password</label>

//               <div className="form-input-wrapper">
//                 <Lock className="form-input-icon" />

//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   className="form-input"
//                 />

//                 <button
//                   type="button"
//                   className="form-input-action"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn-primary">
//               Login
//               <ArrowRight className="btn-arrow" />
//             </button>

//             <div className="auth-footer">
//               Don’t have an account? <Link href="/register">Register</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


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
import useLoginForm from "@/app/hooks/useLoginForm";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showPassword,
    toggleShowPassword,
  } = useLoginForm();
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

            {/* Email */}
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
            {/* Password */}
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
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in…" : "Login"}
              {!isSubmitting && <ArrowRight className="btn-arrow" />}
            </button>
            <div className="auth-footer">
              Don&apos;t have an account?{" "}
              <Link href="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}