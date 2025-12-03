import React, { useEffect, useState, type JSX } from "react";
import Navbar from "../components/navbar.tsx";
import HorizontalCategoryNav from "../components/HorizontalCategoryNav.tsx";
import ItemCard from "../components/ItemCard.tsx";
import ItemModal from "../components/ItemModal.tsx";
import type { Category, Item } from "../types.ts";
import "../App.css";

const API_URL = "http://localhost:3000";

export default function CategoryPage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);

  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("category") ?? undefined;
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    // load categories (replace with fetch)
    fetch(`${API_URL}/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {
        // fallback sample categories if backend not available:
        setCategories([
          { id: 1, name_en: "Breakfast", img: "/cat1.jpg" },
          { id: 2, name_en: "Soups", img: "/cat2.jpg" },
          { id: 2, name_en: "Hot Meals", img: "/cat3.jpg" },
          { id: 2, name_en: "Pasta & Risotto", img: "/cat4.jpg" },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    // load items by category (replace with fetch)
    fetch(`${API_URL}/items/${categoryId}?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => {
        // fallback mock items if backend down
        setItems([
          {
            id: 1,
            title: "Джо комбо",
            description: "Tasty combo with drink and fries",
            ingredients: "Meat, potatoes, sauce",
            price: "490",
            img: "/item1.jpg",
          },
          {
            id: 2,
            title: "Фаст Комбо",
            description: "Fast and delicious",
            ingredients: "Pizza, drink",
            price: "780",
            img: "/item2.jpg",
          },
        ]);
      });
  }, [categoryId, lang]);

  return (
    <div className="page-container">
      <Navbar showLogo={false} showSignIn={false} />
      <HorizontalCategoryNav categories={categories} lang={lang} />

      <h1 className="category-title-large">
        {categories.find((c) => String(c.id) === String(categoryId))?.[
          `name_${lang}` as keyof Category
        ] ?? "Категория"}
      </h1>

      <div className="items-grid">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} onClick={() => setSelected(it)} />
        ))}
      </div>

      {selected && <ItemModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
