"use client";

import { ProductGrid } from "./ProductGrid";
import { ProductDetail } from "./ProductDetail";
import { CartIconButton } from "./CartDrawer";
import { useStore } from "@/lib/store/useStore";

export function StorePanel() {
  const view = useStore((s) => s.view);

  return (
    <section className="store-panel store-panel--full" aria-label="Tienda Lúmen Outfit">
      <div className="store-toolbar">
        <div>
          <p className="eyebrow">Tienda demo</p>
          <h1 className="text-lg font-bold text-white">Lúmen Outfit</h1>
        </div>
        <CartIconButton />
      </div>
      <div className="store-content">
        {view === "catalog" && <ProductGrid />}
        {view === "product" && <ProductDetail />}
      </div>
    </section>
  );
}
