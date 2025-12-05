import React from "react";
import Navbar from "../components/navbar";
import { useAuth } from "../context/AuthContext";

export default function CabinetPage() {
  const { user, discount, expiresAt } = useAuth();

  const daysLeft = expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const discountExpired = !expiresAt || daysLeft <= 0;

  return (
    <div className="auth-page">
      <Navbar showLogo={false} showSignIn={false} hideHamburger={true} />

      <div className="auth-content">
        <div className="cabinet-card">
          <h2>Personal Cabinet</h2>

          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <div className="cabinet-discount">
            {discountExpired ? (
              <p className="no-discount">No discount available</p>
            ) : (
              <>
                <p>
                  <strong>Discount:</strong> {discount}%
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(expiresAt!).toLocaleDateString()}
                </p>
                <p>
                  <strong>Days left:</strong> {daysLeft}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
