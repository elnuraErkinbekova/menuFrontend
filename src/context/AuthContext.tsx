// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type User = {
  username: string;
  email: string;
};

type DiscountRecord = {
  amount: number; // percent, 0..100
  expiresAt: string | null; // ISO string or null
};

type AuthState = {
  user: User | null;
  token: string | null;
  discount: DiscountRecord;
};

type AuthContextType = {
  auth: AuthState;
  signup: (username: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  requireAuthNavigate: (path: string) => string; // returns redirect url to use
  addDiscountPercent: (percent: number, extendDays?: number) => void;
  addDiscountFromPoints: (points: number, pointsPerPercent?: number, extendDays?: number) => number;
  resetDiscount: () => void;
};

const LOCAL_KEY = "menu_frontend_auth_v1";
const USERS_KEY = "menu_frontend_users_v1"; // simple mock DB

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      return {
        user: null,
        token: null,
        discount: { amount: 0, expiresAt: null },
      };
    }
    return JSON.parse(raw) as AuthState;
  } catch {
    return {
      user: null,
      token: null,
      discount: { amount: 0, expiresAt: null },
    };
  }
}

function saveState(state: AuthState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>(loadState);

  useEffect(() => {
    saveState(auth);
  }, [auth]);

  // simple mock users storage
  const loadUsers = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) as Array<{ username: string; email: string; password: string }> : [];
    } catch {
      return [];
    }
  };
  const saveUsers = (users: Array<{ username: string; email: string; password: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  // Signup: saves to mock DB and auto-login
  const signup = async (username: string, email: string, password: string) => {
    const users = loadUsers();
    const emailTaken = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    const usernameTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (emailTaken) {
      return { ok: false, message: "Email already in use" };
    }
    if (usernameTaken) {
      return { ok: false, message: "Username already taken" };
    }
    users.push({ username, email, password });
    saveUsers(users);

    // Auto-login
    const token = "mock-token-" + Math.random().toString(36).slice(2);
    const newState: AuthState = {
      user: { username, email },
      token,
      discount: { amount: 0, expiresAt: null },
    };
    setAuth(newState);
    return { ok: true };
  };

  // Login by username or email
  const login = async (usernameOrEmail: string, password: string) => {
    const users = loadUsers();
    const user = users.find(u => (u.email.toLowerCase() === usernameOrEmail.toLowerCase() || u.username.toLowerCase() === usernameOrEmail.toLowerCase()) && u.password === password);
    if (!user) {
      return { ok: false, message: "Invalid credentials" };
    }
    const token = "mock-token-" + Math.random().toString(36).slice(2);
    const newState: AuthState = {
      user: { username: user.username, email: user.email },
      token,
      discount: auth.discount, // preserve discount if any
    };
    setAuth(newState);
    return { ok: true };
  };

  const logout = () => {
    setAuth({
      user: null,
      token: null,
      discount: { amount: 0, expiresAt: null },
    });
    navigate("/");
  };

  // helper: returns iso string for now + days
  const addDaysISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() < Date.now();
  };

  // add percent and extend expiration (default 7 days)
  const addDiscountPercent = (percent: number, extendDays = 7) => {
    setAuth(prev => {
      if (!prev.user) return prev;
      let current = prev.discount.amount ?? 0;
      if (current >= 100) {
        // locked at 100% — do not extend per your rule
        return prev;
      }
      let newAmount = Math.min(100, Math.round((current + percent) * 100) / 100);
      // if newAmount is 100% then expiration becomes now+extendDays but further wins won't extend
      const newExpires = addDaysISO(extendDays);
      // If previous expired, set fresh expiration; else extend from now (you wanted reset to 7 days from last win)
      return {
        ...prev,
        discount: {
          amount: newAmount,
          expiresAt: newAmount >= 100 ? addDaysISO(extendDays) : newExpires,
        },
      };
    });
  };

  // convert points into percent using pointsPerPercent (default 1000 points = 1%)
  // returns percent added
  const addDiscountFromPoints = (points: number, pointsPerPercent = 1000, extendDays = 7) => {
    const percent = Math.floor(points / pointsPerPercent);
    if (percent <= 0) return 0;
    addDiscountPercent(percent, extendDays);
    return percent;
  };

  const resetDiscount = () => {
    setAuth(prev => ({ ...prev, discount: { amount: 0, expiresAt: null } }));
  };

  // On mount, if discount expired, clear it
  useEffect(() => {
    if (auth.discount && auth.discount.expiresAt && isExpired(auth.discount.expiresAt)) {
      setAuth(prev => ({ ...prev, discount: { amount: 0, expiresAt: null } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper for redirect url (used by UI)
  const requireAuthNavigate = (path: string) => {
    // return the redirect url for login page
    return `/login?redirect=${encodeURIComponent(path)}`;
  };

  return (
    <AuthContext.Provider value={{
      auth,
      signup,
      login,
      logout,
      requireAuthNavigate,
      addDiscountPercent,
      addDiscountFromPoints,
      resetDiscount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
