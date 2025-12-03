import React, { type JSX } from "react";
import type { Item } from "../types.ts";

type Props = {
  item: Item;
  onClick: () => void;
};

export default function ItemCard({ item, onClick }: Props): JSX.Element {
  const imgUrl = item.img ?? "/placeholder.jpg";
  return (
    <div className="item-card" onClick={onClick} role="button">
      <img src={imgUrl} alt={item.title} className="item-img" />
      <div className="item-info">
        <h3>{item.title}</h3>
        <div className="price-pill">{item.price ? `${item.price} сом` : "—"}</div>
      </div>
    </div>
  );
}
