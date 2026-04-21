"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, email: string, roles: string[]) => void;
  logout: () => void;
  isStudent: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwt(token: string): { sub: string; email: string; roles: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("lms_token");
    if (stored && !isTokenExpired(stored)) {
      const payload = parseJwt(stored);
      if (payload) {
        Promise.resolve().then(() => {
          setState({
            user: {
              id: payload.sub,
              email: payload.email,
              roles: payload.roles.split(","),
            },
            token: stored,
            isLoading: false,
          });
        });
        return;
      }
    }
    localStorage.removeItem("lms_token");
    Promise.resolve().then(() => {
      setState({ user: null, token: null, isLoading: false });
    });
  }, []);

  const loginFn = useCallback((token: string, email: string, roles: string[]) => {
    localStorage.setItem("lms_token", token);
    const payload = parseJwt(token);
    setState({
      user: {
        id: payload?.sub || "",
        email,
        roles,
      },
      token,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lms_token");
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const roles = state.user?.roles || [];

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: loginFn,
        logout,
        isStudent: roles.includes("STUDENT"),
        isInstructor: roles.includes("INSTRUCTOR"),
        isAdmin: roles.includes("ADMIN"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
