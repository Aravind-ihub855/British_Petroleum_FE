"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId?: string;
  region?: string;
  created_at: string;
}

export const DEFAULT_CREDENTIALS = {
  "store manager": {
    email: "storemanager@gmail.com",
    password: "Storemanager@1234",
    label: "Store Manager",
    badge: "BP Lincoln Park",
  },
  "vendor manager": {
    email: "vendormanager@gmail.com",
    password: "Vendormanager@1234",
    label: "Vendor Manager",
    badge: "North Region",
  },
} as const;

export type AvailableRole = keyof typeof DEFAULT_CREDENTIALS;

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  switchRole: (role: AvailableRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Login helper with credentials
  const loginWithCredentials = async (email: string, pass: string) => {
    try {
      const signinRes = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (signinRes.ok) {
        const signinData = await signinRes.json();
        const newToken = signinData.access_token;
        localStorage.setItem("token", newToken);
        setToken(newToken);

        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
          return true;
        }
      }
    } catch (err) {
      console.error("Auto login error:", err);
    }
    return false;
  };

  // Check authentication on initial load or auto-login with default persona
  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(storedToken);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Auth check error, attempting default auto-login:", err);
      }
    }

    // Auto-login as default Store Manager
    await loginWithCredentials(
      DEFAULT_CREDENTIALS["store manager"].email,
      DEFAULT_CREDENTIALS["store manager"].password
    );
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const switchRole = async (targetRole: AvailableRole) => {
    setLoading(true);
    const creds = DEFAULT_CREDENTIALS[targetRole];
    if (creds) {
      await loginWithCredentials(creds.email, creds.password);
    }
    setLoading(false);
  };

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Login profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Reset to default Store Manager instead of kicking out to signin
    switchRole("store manager");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

