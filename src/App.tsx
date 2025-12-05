// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import DoodleJumpReact from "./pages/DoodleJumpReact";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import CabinetPage from "./pages/Cabinet";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/doodle-jump" element={
          <ProtectedRoute>
            <DoodleJumpReact />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cabinet" element={
          <ProtectedRoute>
            <CabinetPage />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
