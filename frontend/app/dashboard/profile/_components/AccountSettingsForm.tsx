"use client";

import { useEffect, useState, useRef } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, Check, ShieldAlert, Loader2, LogOut, AlertTriangle } from "lucide-react";
// import { useAuth } from "@/lib/contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "@/lib/api/user";
import { getEmergencyContacts } from "@/lib/api/kyc-emergency";
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
  
  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  
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
      
      try {
        const emRes = await getEmergencyContacts();
        setEmergencyContacts(getApiData(emRes) || []);
      } catch (err) {
        console.error("Failed to load emergency contacts", err);
      }
    } catch (err: any) {
      console.error("Failed to load profile details:", err);
      // If the user was deleted from the DB or token expired, log them out
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        logout();
      }
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
      
      {/* Emergency Contacts Section */}
      <div className="chart-card" style={{ marginTop: "24px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Phone size={18} color="#16a34a" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Emergency Contacts (WhatsApp)</h3>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-secondary, #64748b)" }}>Quick message important numbers in Nepal</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
          {emergencyContacts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "#f8fafc", borderRadius: "12px", color: "#64748b", fontSize: "14px" }}>
              No emergency contacts configured yet.
            </div>
          ) : (
            emergencyContacts.map(c => {
              const hasNumber = !!c.number;
              // Ensure country code for WhatsApp if it's a Nepal number without it (optional improvement)
              let formattedNumber = hasNumber ? c.number.replace(/\s/g, "") : "";
              if (formattedNumber && !formattedNumber.startsWith('+') && formattedNumber.length === 10) {
                 formattedNumber = "+977" + formattedNumber;
              }
              
              return (
                <a
                  key={c._id || c.id}
                  href={hasNumber ? `https://wa.me/${formattedNumber.replace('+', '')}` : undefined}
                  target={hasNumber ? "_blank" : undefined}
                  rel={hasNumber ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px", padding: "16px",
                    background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px",
                    textDecoration: "none", color: "inherit", transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    cursor: hasNumber ? "pointer" : "default",
                    opacity: hasNumber ? 1 : 0.7
                  }}
                  onMouseEnter={e => {
                    if (!hasNumber) return;
                    e.currentTarget.style.borderColor = "#22c55e";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.1)";
                  }}
                  onMouseLeave={e => {
                    if (!hasNumber) return;
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                  }}
                >
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(34, 197, 94, 0.3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.category}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>
                    {c.number || "Click to add number"}
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
