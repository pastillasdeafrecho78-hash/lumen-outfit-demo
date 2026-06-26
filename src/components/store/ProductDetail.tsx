"use client";

import Image from "next/image";
import { getProductById, formatPrice } from "@/lib/store/catalog";
import { useStore } from "@/lib/store/useStore";

export function ProductDetail() {
  const productId = useStore((s) => s.selectedProductId);
  const setView = useStore((s) => s.setView);
  const highlighted = useStore((s) => s.highlightedIds);

  const product = productId ? getProductById(productId) : null;
  if (!product) {
    return <p className="text-slate-500">Producto no encontrado.</p>;
  }

  const isHighlighted = highlighted.includes(product.id);

  return (
    <div className={`premium-card ${isHighlighted ? "ring-2 ring-[#79d8c4]" : ""}`}>
      {isHighlighted && (
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#79d8c4]">
          El agente te está mostrando este producto
        </p>
      )}
      <button
        type="button"
        onClick={() => setView("catalog")}
        className="mb-4 text-sm text-slate-400 hover:text-white"
      >
        ← Volver al catálogo
      </button>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#16181e]">
          <Image
            src={product.image}
            alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <p className="eyebrow">{product.category}</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{product.name}</h2>
          <p className="mt-3 text-2xl font-bold text-[#79d8c4]">{formatPrice(product.price)}</p>
          <p className="mt-4 text-slate-300 leading-relaxed">{product.description}</p>
          <div className="mt-6">
            <p className="text-sm text-slate-500">Colores</p>
            <p className="text-white">{product.colors.join(", ")}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Tallas disponibles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-md border border-white/15 px-3 py-1 text-sm text-white"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Pide al asistente: &quot;agrégala en talla M&quot; o usa el micrófono.
          </p>
        </div>
      </div>
    </div>
  );
}
