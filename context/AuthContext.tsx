"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Move fetchUser logic inside useEffect
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [baseUrl]); // optional: include baseUrl if it's not guaranteed static

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
