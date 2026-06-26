"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/store/catalog";
import type { Product } from "@/lib/store/types";
import { useStore } from "@/lib/store/useStore";

export function ProductCard({ product }: { product: Product }) {
  const highlighted = useStore((s) => s.highlightedIds.includes(product.id));
  const setView = useStore((s) => s.setView);

  return (
    <article
      className={`product-card cursor-pointer ${highlighted ? "product-card--highlighted" : ""}`}
      onClick={() => setView("product", product.id)}
      data-product-id={product.id}
    >
      {highlighted && <span className="agent-badge">El agente está viendo esto</span>}
      {product.badge && !highlighted && (
        <span className="agent-badge" style={{ background: "#8da2ff" }}>
          {product.badge}
        </span>
      )}
      <div className="relative aspect-[4/5] w-full bg-[#16181e]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category}</p>
        <h3 className="mt-1 font-semibold text-white">{product.name}</h3>
        <p className="mt-1 text-sm font-bold text-[#79d8c4]">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
