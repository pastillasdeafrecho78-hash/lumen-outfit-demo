"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/store/catalog";
import { useStore } from "@/lib/store/useStore";

export function CartView() {
  const cart = useStore((s) => s.cart);
  const setView = useStore((s) => s.setView);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="premium-card">
      <button
        type="button"
        onClick={() => setView("catalog")}
        className="mb-4 text-sm text-slate-400 hover:text-white"
      >
        ← Seguir comprando
      </button>
      <h2 className="text-2xl font-bold text-white">Tu carrito</h2>
      {cart.length === 0 ? (
        <p className="mt-6 text-slate-500">El carrito está vacío. Pide al asistente que agregue algo.</p>
      ) : (
        <>
          <ul className="mt-6 space-y-4">
            {cart.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 border-b border-white/8 pb-4"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#16181e]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">
                    Talla {item.size} · Cantidad {item.quantity}
                  </p>
                  <p className="mt-1 font-bold text-[#79d8c4]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-lg text-slate-300">Total</span>
            <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
