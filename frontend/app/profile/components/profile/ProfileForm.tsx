"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getProfile, updateProfile } from "@/lib/api/user";
import ProfileImageUpload from "./ProfileImageUpload";
import { useAuth } from "@/lib/context/AuthContext";
// import { useAuth } from "@/lib/contexts/AuthContext";

type Status = "idle" | "loading" | "success" | "error";

const BACKEND_URL = "";

export default function ProfileForm() {
  // ✅ All hooks at the top — before any conditional returns
  const { user, setUser } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      console.log("WHOAMI RESPONSE:", response.data);
      // API returns { success, data, message }
      const data = response.data ?? response;

      setFormData({
        fullName: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      // Pre-fill image preview from saved profile image
      if (data.profile_image) {
        setImagePreview(`${BACKEND_URL}${data.profile_image}`);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      // Build FormData so we can send text fields + optional image together
      const fd = new FormData();
      if (formData.fullName) fd.append("fullName", formData.fullName);
      if (formData.email) fd.append("email", formData.email);
      if (formData.phone) fd.append("phone", formData.phone);
      // Backend multer expects field name "profileImage"
      if (imageFile) fd.append("profileImage", imageFile);

      console.log("Sending Data:", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      const response = await updateProfile(fd);

      console.log("Update Response:", response.data);

      const updatedData = response.data?.data ?? response.data ?? response;

      setUser(updatedData);

      setStatus("success");
      setStatusMessage("Profile updated successfully!");
    } catch (error: any) {
      console.log("ERROR =", error);
      console.log("RESPONSE =", error?.response?.data);

      setStatus("error");
      setStatusMessage(
        error?.response?.data?.message || error?.message || "Update failed",
      );
    }
  };

  if (pageLoading) {
    return (
      <div className="profile-background">
        <div
          className="profile-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <Loader2
            size={40}
            className="spin"
            style={{ color: "var(--primary)" }}
          />
          <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-background">
      <div className="profile-card">
        <ProfileImageUpload
          preview={imagePreview}
          onFileSelect={handleImageSelect}
        />

        <h2 className="profile-title">My Profile</h2>

        {/* Status message */}
        {status === "success" && (
          <div
            className="alert alert-success"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <CheckCircle size={18} />
            {statusMessage}
          </div>
        )}
        {status === "error" && (
          <div
            className="alert alert-error"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <AlertCircle size={18} />
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrapper">
              <User className="form-input-icon" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="form-input-wrapper">
              <Phone className="form-input-icon" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Phone number"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="spin" />
                Saving…
              </>
            ) : (
              "Update Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
