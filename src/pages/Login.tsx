import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
    navigate(redirect);
  };

  return (
    <div className="auth-page">
      <Navbar showLogo={false} showSignIn={false} hideHamburger={true} />

      <div className="auth-content">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Log In</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Log In
          </button>

          <p className="auth-link">
            Don’t have an account?{" "}
            <Link to={`/signup?redirect=${redirect}`}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
