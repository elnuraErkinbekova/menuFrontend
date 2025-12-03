import React, { type JSX } from "react";
import type { Category } from "../types.ts";

type Props = {
  categories: Category[];
  lang?: string;
};

export default function HorizontalCategoryNav({ categories, lang = "en" }: Props): JSX.Element {
  return (
    <div className="horizontal-nav-wrapper">
      <div className="horizontal-nav">
        {categories.map((cat) => (
          <a key={cat.id} href={`/category?category=${cat.id}`} className="nav-pill">
            {cat[`name_${lang}` as keyof Category] ?? cat.name_en}
          </a>
        ))}
      </div>
    </div>
  );
}
