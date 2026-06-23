"use client";

import { useRef } from "react";

interface ProfileImageUploadProps {
  preview: string;
  onFileSelect: (file: File) => void;
}

export default function ProfileImageUpload({
  preview,
  onFileSelect,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  };

  return (
    <div className="profile-image-section">
      <div
        className="profile-image-wrapper"
        onClick={() => inputRef.current?.click()}
        style={{ cursor: "pointer" }}
      >
        {preview ? (
          <img src={preview} className="profile-image" alt="Profile picture" />
        ) : (
          <div className="profile-image profile-avatar-empty">U</div>
        )}
        <div className="profile-image-overlay">
          <span>Change Photo</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="profile-image-input"
      />
    </div>
  );
}
