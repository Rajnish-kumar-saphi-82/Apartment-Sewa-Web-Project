"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

function GoogleAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: contextLogin } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const role = searchParams.get("role");

    if (token && userId && email && role) {
      const user = {
        id: userId,
        full_name: name || email,
        email: email,
        role: role,
        country_code: "+977",
        phone: "",
      };
      
      // Delay slightly to prevent rapid re-renders if contextLogin causes a state update that forces a re-render of this tree
      setTimeout(() => {
        if (isMounted) {
          contextLogin(token, user);
          router.replace("/dashboard");
        }
      }, 0);
    } else {
      router.replace("/login?error=google_failed");
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return null;
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    }>
      <GoogleAuthContent />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
        flexDirection: "column",
        gap: "20px"
      }}>
        {/* Spinner */}
        <div style={{
          width: "56px",
          height: "56px",
          border: "4px solid #e2e8f0",
        borderTop: "4px solid #1a56db",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ color: "#1e293b", fontSize: "18px", fontWeight: 600 }}>
        Signing you in with Google…
      </p>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        You will be redirected to your dashboard shortly.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Suspense>
  );
}
