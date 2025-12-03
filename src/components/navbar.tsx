import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  showLogo?: boolean;
  showSignIn?: boolean;
};

export default function Navbar({ showLogo = true, showSignIn = true }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCategoryPage = location.pathname === "/category";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* If in category page → show back button */}
        {!showLogo ? (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
        ) : (
          <img src="src/assets/giraffeLogo.png" className="logo" alt="Giraffe Logo" />
        )}
      </div>

      <div className="navbar-right">
        {/* Home page only */}
        {showSignIn && (
          <button className="signin-btn">
            Sign In
          </button>
        )}

        <div className="burger" role="button" aria-label="menu">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </nav>
  );
}
