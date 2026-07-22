"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

interface RequireKycProps {
  children: React.ReactNode;
  fallback?: "hide" | "alert" | "redirect";
}


export default function RequireKyc({ children, fallback = "alert" }: RequireKycProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  // Admins bypass KYC for most things, but typically this is for Tenant/Owner
  if (user?.role === "Admin") return <>{children}</>;

  const isApproved = user?.kyc_status === "approved";

  if (isApproved) {
    return <>{children}</>;
  }

  if (fallback === "hide") {
    return null;
  }

  if (fallback === "redirect") {
    // Only redirect if we are in the browser
    if (typeof window !== "undefined") {
      router.push("/dashboard/kyc");
    }
    return null;
  }

  // "alert" fallback (Default for wrapping buttons/sections)
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "12px",
      textAlign: "center", gap: "12px"
    }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ShieldAlert size={24} color="#ef4444" />
      </div>
      <div>
        <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px" }}>Action Locked</h4>
        <p style={{ margin: 0, color: "#64748b", fontSize: "13px", maxWidth: "250px" }}>
          You must have an approved KYC to perform this action.
        </p>
      </div>
      <button 
        onClick={() => router.push("/dashboard/kyc")}
        style={{ padding: "8px 16px", background: "#1a56db", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
      >
        Go to KYC Verification
      </button>
    </div>
  );
}
