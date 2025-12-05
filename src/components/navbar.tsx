// src/components/navbar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  showLogo?: boolean;
  showSignIn?: boolean;
  hideHamburger?: boolean;
};


export default function Navbar({ showLogo = true, showSignIn = true, hideHamburger = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, requireAuthNavigate, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);


  const onCabinetClick = () => {
    setMenuOpen(false);
    if (!auth.user) {
      navigate(requireAuthNavigate("/cabinet"));
    } else {
      navigate("/cabinet");
    }
  };

  const onSignInClick = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {!showLogo ? (
          <button className="back-btn" onClick={() => navigate('/')}>
            ←
          </button>
        ) : (
          <img src="src/assets/giraffeLogo.png" className="logo" alt="Giraffe Logo" />
        )}
      </div>

      <div className="navbar-right">
        {/* Sign-in button shows only if requested AND not logged in */}
        {showSignIn && !auth.user && (
          <button className="signin-btn" onClick={onSignInClick}>
            Sign In
          </button>
        )}

        {auth.user && (
          <button className="logout-btn" onClick={() => logout()}>
            Logout
          </button>
        )}

        {/* small user greeting when logged in (optional) */}
        {auth.user && (
          <div style={{ fontWeight: 600, color: "#6b3b11" }}>
            {auth.user.username}
          </div>
        )}

        {!hideHamburger && (
          <div className="burger" role="button" aria-label="menu" onClick={() => setMenuOpen(open => !open)}>
            <div />
            <div />
            <div />
          </div>
        )}

        {/* simple dropdown */}
        {menuOpen && (
          <div style={{
            position: "absolute",
            right: 12,
            top: "3.75rem",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.04)",
            overflow: "hidden",
            zIndex: 2000,
            width: 180,
          }}>
            <button onClick={onCabinetClick} style={{ display: "block", width: "100%", padding: "12px 16px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}>
              Cabinet
            </button>
            <button onClick={() => { setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "12px 16px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", color: "#999" }}>
              Language
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
