import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { useAuth } from "../context/AuthContext";

interface DiscountData {
  pointsEarned: number;
  discountPercent: number;
  totalDiscount: number;
  expirationDate: string | Date;
}

export default function CabinetPage() {
  const { user } = useAuth();

  const [discountInfo, setDiscountInfo] = useState<DiscountData | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(true);

  // Load discount from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_discount");
      if (!saved) {
        setDiscountInfo(null);
        setIsExpired(true);
        return;
      }

      const data = JSON.parse(saved);
      const expDate = new Date(data.expirationDate);

      const now = new Date();
      const diff = expDate.getTime() - now.getTime();
      const left = Math.ceil(diff / (1000 * 60 * 60 * 24));

      setDiscountInfo({ ...data, expirationDate: expDate });
      setDaysLeft(left);
      setIsExpired(left <= 0);
    } catch (e) {
      console.error("Failed to parse discount");
      setDiscountInfo(null);
      setIsExpired(true);
    }
  }, []);


  return (
    <div style={{ minHeight: "100vh", background: "#FFF7F0" }}>
      <Navbar showLogo={false} showSignIn={false} hideHamburger={true} />

      <div style={{ padding: "30px", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ color: "#E67A3C", marginBottom: 20 }}>Personal Cabinet</h1>

        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,160,80,0.15)"
        }}>
          <p><b>Username:</b> {user?.username}</p>
          <p><b>Email:</b> {user?.email}</p>

          <hr style={{ margin: "20px 0", opacity: 0.2 }} />

          <h2 style={{ marginBottom: 12, color: "#E67A3C" }}>Your Discount</h2>

          {isExpired || !discountInfo ? (
            <div style={{
              background: "#FFE0E0",
              padding: 15,
              borderRadius: 10,
              border: "1px solid #FF9A9A",
              color: "#B30000",
              fontWeight: 600
            }}>
              No discount available
            </div>
          ) : (
            <div
              style={{
                background: "#E8F5E9",
                padding: 15,
                borderRadius: 10,
                border: "1px solid #4CAF50",
                color: "#2E7D32",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Discount: {discountInfo.totalDiscount}% OFF
              </p>

              <p style={{ margin: "4px 0" }}>
                Expires on:{" "}
                {new Date(discountInfo.expirationDate).toLocaleDateString()}
              </p>

              <p style={{ margin: "4px 0" }}>
                Days left: {daysLeft}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
