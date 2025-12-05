// src/components/ProtectedRoute.tsx
import React, { type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.user || !auth.token) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
