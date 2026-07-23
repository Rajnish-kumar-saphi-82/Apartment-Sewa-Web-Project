"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface User {
  _id?: string;
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  country_code?: string;
  role?: string;
  profile_image?: string | null;
  is_verified?: boolean;
  kyc_status?: "not_submitted" | "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  setUser: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
        
        if (token) {
          try {
            const res = await axios.get("/api/v1/auth/whoami", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const freshUser: User = res.data?.data || res.data?.user || res.data;
            if (freshUser && freshUser.role) {
              localStorage.setItem("user", JSON.stringify(freshUser));
              setUserState(freshUser);
            }
          } catch {
            // Non-fatal: use cached data if server unreachable
          }
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    const minimalUser = { role: userData.role };
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(minimalUser))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setUserState(userData);
  };

  const setUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
    setUserState(userData);
  };

  // Fetches the latest user data from the server and updates localStorage + state
  const refreshUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await axios.get("/api/v1/auth/whoami", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const freshUser: User = res.data?.data || res.data?.user || res.data;
      if (freshUser && freshUser.role) {
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUserState(freshUser);
      }
    } catch {
      // Non-fatal: keep existing user data
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "auth_token=; path=/; max-age=0";
    document.cookie = "user_data=; path=/; max-age=0";
    setUserState(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
