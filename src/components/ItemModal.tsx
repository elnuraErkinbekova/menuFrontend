import React, { type JSX } from "react";
import type { Item } from "../types.ts";

type Props = {
  item: Item;
  onClose: () => void;
};

export default function ItemModal({ item, onClose }: Props): JSX.Element {
  const imgUrl = item.img ?? "/placeholder.jpg";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <img src={imgUrl} className="modal-img" alt={item.title} />
        <h2>{item.title}</h2>
        {item.description && <p className="modal-desc">{item.description}</p>}
        {item.ingredients && <p className="modal-ing">Состав: {item.ingredients}</p>}
        <div className="modal-price">{item.price ? `${item.price} сом` : "-"}</div>
        <button className="modal-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
