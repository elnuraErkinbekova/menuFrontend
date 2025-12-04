import React, { useState, type JSX } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/navbar.tsx";
import AnimatedBanner from "../components/AnimatedBanner.tsx";
import type { Category } from "../types.ts";
import "../App.css";

const mockCategories: Category[] = [
  { id: 1, name_en: "Breakfast", img: "src/assets/cat1.jpg" },
  { id: 2, name_en: "Soups", img: "src/assets/cat2.jpg" },
  { id: 3, name_en: "Hot Meals", img: "src/assets/cat3.jpg" },
  { id: 4, name_en: "Pasta & Risotto", img: "src/assets/cat4.jpg" },
  { id: 5, name_en: "Breakfast", img: "src/assets/cat1.jpg" },
  { id: 6, name_en: "Soups", img: "src/assets/cat2.jpg" },
];

// Define your 3 unique animated banners
const animatedBanners = [
  { 
    id: 1, 
    type: 'bonus-wheel' as const,
    bonusText: "get up to",
    bonusPercentage: "100%"
  },
  { 
    id: 2, 
    type: 'product-showcase' as const,
    text: "50%              off",
    subtitle: "Fruit Cakes",
    productImage: "src/assets/featured-drink.png",
    floatingItems: [
      "src/assets/apple-slice-1.png",
      "src/assets/apple-slice-2.png",
      "src/assets/apple-slice-3.png"
    ]
  },
  { 
    id: 3, 
    type: 'text-reveal' as const,
    text: "Order Now & Enjoy" 
  }
];

export default function HomePage(): JSX.Element {
  const [categories] = useState<Category[]>(mockCategories);
  const navigate = useNavigate();

  return (
    <div className="menu-page">
      <Navbar showLogo={true} showSignIn={true} />
      
      <AnimatedBanner 
        banners={animatedBanners} 
        autoPlayInterval={8000} 
      />

      <div className="bonus-wrapper">
        <button
          className="bonus-btn"
          onClick={() => {
            navigate('/doodle-jump');
          }}
        >
          Get Bonuses
        </button>
      </div>

      <h2 className="categories-title">Menu Categories</h2>
      <div className="categories-grid">
        {categories.map((c) => (
          <a
            key={c.id}
            className="category-card"
            href={`/category?category=${c.id}`}
            aria-label={c.name_en}
          >
            <div className="category-img-wrap">
              <img src={c.img} alt={c.name_en} />
            </div>
            <div className="category-name">{c.name_en}</div>
          </a>
        ))}
      </div>
    </div>
  );
}