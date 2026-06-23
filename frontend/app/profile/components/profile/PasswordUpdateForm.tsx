"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { changePassword } from "@/lib/api/user";

type Status = "idle" | "loading" | "success" | "error";

export default function PasswordUpdateForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus("error");
      setStatusMessage("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setStatus("error");
      setStatusMessage("New password must be at least 6 characters.");
      return;
    }

    setStatus("loading");

try {
  console.log("PASSWORD DATA:", {
    currentPassword: formData.currentPassword,
    newPassword: formData.newPassword,
    confirmNewPassword: formData.confirmPassword,
  });

  await changePassword({
    currentPassword: formData.currentPassword,
    newPassword: formData.newPassword,
    confirmNewPassword: formData.confirmPassword,
  });


      setStatus("success");
      setStatusMessage("Password changed successfully!");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
  //   } catch (error: any) {
  //     setStatus("error");
  //     setStatusMessage(error?.message || "Password change failed. Please try again.");
  //   }
  // };

  } catch (error: any) {
  console.log("ERROR =", error);
  console.log("RESPONSE =", error?.response?.data);

  setStatus("error");
  setStatusMessage(
    error?.response?.data?.message ||
    error?.message ||
    "Password change failed"
  );
}
  };

  return (
    <div className="profile-background">
      <div className="profile-card">
        <h2 className="profile-title">Change Password</h2>

        {/* Status message */}
        {status === "success" && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <CheckCircle size={18} />
            {statusMessage}
          </div>
        )}
        {status === "error" && (
          <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <AlertCircle size={18} />
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter new password (min 6 chars)"
                required
              />
              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="spin" />
                Changing…
              </>
            ) : (
              <>
                Change Password
                <ArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}