import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(username, email, password);
    navigate(redirect);
  };

  return (
    <div className="auth-page">
      <Navbar showLogo={false} showSignIn={false} hideHamburger={true} />

      <div className="auth-content">
        <form className="auth-form" onSubmit={handleSignup}>
          <h2>Sign Up</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Sign Up
          </button>

          <p className="auth-link">
            Already have an account?{" "}
            <Link to={`/login?redirect=${redirect}`}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
