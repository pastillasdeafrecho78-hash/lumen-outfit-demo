"use client";

import { ProductCard } from "./ProductCard";
import { useStore } from "@/lib/store/useStore";

export function ProductGrid() {
  const products = useStore((s) => s.filteredProducts);
  const filterQuery = useStore((s) => s.filterQuery);

  return (
    <div>
      {filterQuery && (
        <p className="mb-4 text-sm text-slate-400">
          Resultados para: <span className="text-white">{filterQuery}</span>
        </p>
      )}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="py-12 text-center text-slate-500">No hay productos que coincidan.</p>
      )}
    </div>
  );
}
