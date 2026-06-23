"use client";

import { useEffect, useState, useRef } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, Check, ShieldAlert, Loader2, LogOut } from "lucide-react";
// import { useAuth } from "@/lib/contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "@/lib/api/user";
import { useAuth } from "@/lib/context/AuthContext";

type Status = "idle" | "loading" | "success" | "error";

const getApiData = (response: any) => response?.data?.data ?? response?.data ?? response;

const getProfileImageSrc = (profileImage?: string | null) => {
  if (!profileImage) return "";
  if (
    profileImage.startsWith("/") ||
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://") ||
    profileImage.startsWith("blob:")
  ) {
    return profileImage;
  }

  const normalizedPath = profileImage.replaceAll("\\", "/");
  const uploadsIndex = normalizedPath.indexOf("uploads/");

  if (uploadsIndex >= 0) {
    return `/${normalizedPath.slice(uploadsIndex)}`;
  }

  return normalizedPath;
};

export default function AccountSettingsForm() {
  const { user, setUser, logout } = useAuth();
  
  // Page load state
  const [pageLoading, setPageLoading] = useState(true);

  // Profile update state
  const [profileStatus, setProfileStatus] = useState<Status>("idle");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  
  // Image Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Password update state
  const [pwdStatus, setPwdStatus] = useState<Status>("idle");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await getProfile();
      // Handle MongoDB snake_case fields returned by backend
      const data = getApiData(response);
      setProfileData({
        fullName: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
      if (data.profile_image) {
        setImagePreview(getProfileImageSrc(data.profile_image));
      }
    } catch (err) {
      console.error("Failed to load profile details:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile Form
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus("loading");
    setProfileMessage("");

    try {
      const fd = new FormData();
      if (profileData.fullName) fd.append("fullName", profileData.fullName);
      if (profileData.email) fd.append("email", profileData.email);
      if (profileData.phone) fd.append("phone", profileData.phone);
      if (imageFile) fd.append("profileImage", imageFile);

      const response = await updateProfile(fd);
      const updatedUser = getApiData(response);

      // Sync Context and LocalStorage
      setUser(updatedUser);
      setImagePreview(getProfileImageSrc(updatedUser.profile_image));
      setProfileStatus("success");
      setProfileMessage("Profile details updated successfully!");
    } catch (err: any) {
      setProfileStatus("error");
      setProfileMessage(err?.message || "Profile update failed. Please verify fields and try again.");
    }
  };

  // Submit Password Form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus("idle");
    setPwdMessage("");

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdStatus("error");
      setPwdMessage("Passwords do not match.");
      return;
    }

    if (pwdData.newPassword.length < 6) {
      setPwdStatus("error");
      setPwdMessage("Password must be at least 6 characters.");
      return;
    }

    setPwdStatus("loading");

    try {
      await changePassword({
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
        confirmNewPassword: pwdData.confirmPassword,
      });

      setPwdStatus("success");
      setPwdMessage("Password updated successfully!");
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPwdStatus("error");
      setPwdMessage(err?.message || "Password modification failed. Double check your current password.");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const initials = (profileData.fullName || user?.full_name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (pageLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={36} className="spin" style={{ color: "#1a56db" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Update profile information and manage account security credentials</p>
        </div>
        <button onClick={logout} className="settings-logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="dashboard-grid-2">
        {/* Profile Card */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">User Profile Details</span>
          </div>

          {profileStatus === "success" && (
            <div className="alert alert-success" style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <Check size={16} /> {profileMessage}
            </div>
          )}
          {profileStatus === "error" && (
            <div className="alert alert-error" style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <ShieldAlert size={16} /> {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Image Preview & Upload Button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div
                onClick={handleImageSelectClick}
                style={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "3px solid #1a56db"
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="profile-avatar-empty">{initials}</div>
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                >
                  <Camera size={20} style={{ color: "#ffffff" }} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleImageSelectClick}
                className="card-btn secondary"
                style={{ width: "auto", padding: "6px 16px", fontSize: "12px" }}
              >
                Upload New Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" size={18} />
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <div className="form-input-wrapper">
                <Phone className="form-input-icon" size={18} />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={profileStatus === "loading"}>
              {profileStatus === "loading" ? (
                <>
                  <Loader2 size={18} className="spin" /> Updating...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Change Account Password</span>
          </div>

          {pwdStatus === "success" && (
            <div className="alert alert-success" style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <Check size={16} /> {pwdMessage}
            </div>
          )}
          {pwdStatus === "error" && (
            <div className="alert alert-error" style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <ShieldAlert size={16} /> {pwdMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={18} />
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  className="form-input"
                  placeholder="Enter current password"
                  value={pwdData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={18} />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={pwdData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={18} />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={pwdData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={pwdStatus === "loading"}>
              {pwdStatus === "loading" ? (
                <>
                  <Loader2 size={18} className="spin" /> Modifying...
                </>
              ) : (
                "Update Account Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
