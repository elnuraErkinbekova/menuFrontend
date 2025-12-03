import React, { useEffect, useState, type JSX } from "react";
import Navbar from "../components/navbar.tsx";
import type { Banner, Category } from "../types.ts";
import "../App.css";

const API_URL = "http://localhost:3000"; // replace with real backend later

const mockBanners: Banner[] = [
  { id: 1, img: "src/assets/banner1.jpg", title: "Special Offer" },
  { id: 2, img: "src/assets/banner2.jpg", title: "New Drinks" },
  { id: 3, img: "src/assets/banner3.jpg", title: "Happy Hours" },
];

const mockCategories: Category[] = [
  { id: 1, name_en: "Breakfast", img: "src/assets/cat1.jpg" },
  { id: 2, name_en: "Soups", img: "src/assets/cat2.jpg" },
  { id: 3, name_en: "Hot Meals", img: "src/assets/cat3.jpg" },
  { id: 4, name_en: "Pasta & Risotto", img: "src/assets/cat4.jpg" },
  { id: 5, name_en: "Breakfast", img: "src/assets/cat1.jpg" },
  { id: 6, name_en: "Soups", img: "src/assets/cat2.jpg" },
];

export default function HomePage(): JSX.Element {
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // If you have a real endpoint: fetch banners here and setBanners(...)
    // fetch(`${API_URL}/banners`).then(r => r.json()).then(setBanners)
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (banners.length ? (s + 1) % banners.length : 0));
    }, 3500);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <div className="menu-page">
      <Navbar showLogo={true} showSignIn={true} />

      <div className="carousel-wrapper">
        <div
          className="carousel-slider"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {banners.map((b) => (
            <div className="carousel-slide" key={b.id}>
              <img src={b.img} alt={b.title} />
              <div className="carousel-title">{b.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bonus-wrapper">
        <button
          className="bonus-btn"
          onClick={() => {
            // future: open bonus modal or navigate to /bonuses
            alert("Get Bonuses — integrate game later");
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
