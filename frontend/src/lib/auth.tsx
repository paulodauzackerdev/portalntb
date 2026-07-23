"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "./api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = api.getAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await api.get<{
        id: string;
        email: string;
        name: string;
        avatar?: string | null;
        role: { id: string; name: string };
        portal: { id: string; name: string };
      }>("/auth/me");

      if (response.success) {
        setUser({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          avatar: response.data.avatar,
          role: response.data.role,
          active: true,
          created_at: "",
        });
      } else {
        setUser(null);
        api.setAccessToken(null);
      }
    } catch {
      setUser(null);
      api.setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chamar refreshUser uma vez na montagem
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      access_token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        role_id: string;
      };
    }>("/auth/login", { email, password });

    if (!response.success) {
      throw new Error(response.error?.message || "Erro ao fazer login");
    }

    api.setAccessToken(response.data.access_token);
    const userData = response.data.user;
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: {
        id: userData.role_id,
        name: userData.role,
      },
      active: true,
      created_at: "",
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignorar erro no logout
    }
    api.setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
