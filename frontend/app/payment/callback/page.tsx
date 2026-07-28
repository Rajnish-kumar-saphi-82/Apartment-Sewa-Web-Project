"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyKhaltiPayment } from "@/lib/api/dashboard";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying payment with Khalti...");
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const khaltiStatus = searchParams.get("status");

    if (!pidx) {
      setStatus("error");
      setMessage("Invalid payment session. Missing payment identifier (pidx).");
      return;
    }

    if (khaltiStatus && khaltiStatus !== "Completed") {
      setStatus("error");
      setMessage(`Payment failed or cancelled. Status: ${khaltiStatus}`);
      return;
    }

    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verify = async () => {
      try {
        await verifyKhaltiPayment(pidx);
        setStatus("success");
        setMessage("Payment processed and verified successfully!");
        setTimeout(() => {
          router.push("/dashboard/billing");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || err.message || "Payment verification failed.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        padding: "40px",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%"
      }}>
        {status === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <Loader2 className="animate-spin" size={60} color="#5c2d91" />
            <h2 style={{ color: "#334155", margin: 0 }}>Verifying...</h2>
            <p style={{ color: "#64748b", margin: 0 }}>{message}</p>
          </div>
        )}

        {status === "success" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <CheckCircle size={60} color="#10b981" />
            <h2 style={{ color: "#10b981", margin: 0 }}>Payment Verified!</h2>
            <p style={{ color: "#64748b", margin: 0 }}>{message}</p>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <XCircle size={60} color="#ef4444" />
            <h2 style={{ color: "#ef4444", margin: 0 }}>Verification Failed</h2>
            <p style={{ color: "#64748b", margin: 0 }}>{message}</p>
            <button
              onClick={() => router.push("/dashboard/billing")}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#5c2d91",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Back to Billing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
