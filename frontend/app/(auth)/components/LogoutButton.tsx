"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function LogoutButton() {
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    router.push("/login");
  };

  return (
    <button className="btn-primary" onClick={handleLogout}>
      Logout
    </button>
  );
}
