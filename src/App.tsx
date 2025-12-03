import React, { useEffect, useState } from "react";
import "./App.css";

// TEMPORARY MOCK DATA — backend will replace
const mockBanners = [
  { id: 1, img: "src/assets/banner1.jpg", title: "Special Offer" },
  { id: 2, img: "src/assets/banner2.jpg", title: "New Drinks" },
  { id: 3, img: "src/assets/banner3.jpg", title: "Happy Hours" },
];

const mockCategories = [
  {
    id: 1,
    name_en: "Breakfast",
    img: "src/assets/cat1.jpg",
  },
  {
    id: 2,
    name_en: "Soups",
    img: "src/assets/cat2.jpg",
  },
  {
    id: 3,
    name_en: "Hot Meals",
    img: "src/assets/cat3.jpg",
  },
  {
    id: 4,
    name_en: "Pasta & Risotto",
    img: "src/assets/cat4.jpg",
  },
];

function App() {
  const [banners, setBanners] = useState(mockBanners);
  const [categories, setCategories] = useState(mockCategories);

  // AUTO SLIDER
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="menu-page">

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="navbar">
        <div className="logo">Giraffe Café</div>

        <div className="burger">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </nav>

      {/* ---------------- CAROUSEL ---------------- */}
      <div className="carousel-wrapper">
        <div
          className="carousel-slider"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {banners.map((b) => (
            <div className="carousel-slide" key={b.id}>
              <img src={b.img} alt={b.title} />
              <div className="carousel-title">{b.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- GET BONUSES BUTTON ---------------- */}
      <div className="bonus-wrapper">
        <button className="bonus-btn">Get Bonuses</button>
      </div>

      {/* ---------------- CATEGORIES TITLE ---------------- */}
      <h2 className="categories-title">Menu</h2>

      {/* ---------------- CATEGORY GRID ---------------- */}
      <div className="categories-grid">
        {categories.map((cat) => (
          <div className="category-card" key={cat.id}>
            <div className="category-img-wrap">
              <img src={cat.img} alt={cat.name_en} />
            </div>
            <div className="category-name">{cat.name_en}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
