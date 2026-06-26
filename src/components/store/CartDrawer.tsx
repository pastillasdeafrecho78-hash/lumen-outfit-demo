"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/store/catalog";
import { useStore } from "@/lib/store/useStore";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function CartDrawer() {
  const cart = useStore((s) => s.cart);
  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!cartOpen) return null;

  return (
    <>
      <button
        type="button"
        className="cart-drawer-backdrop"
        aria-label="Cerrar carrito"
        onClick={() => setCartOpen(false)}
      />
      <aside className="cart-drawer" aria-label="Resumen del carrito">
        <div className="cart-drawer__header">
          <h2 className="text-lg font-bold text-white">Tu pedido</h2>
          <button type="button" className="floating-agent__close" onClick={() => setCartOpen(false)} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className="cart-drawer__body">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay productos. Pide al asistente que agregue algo o explora el catálogo.
            </p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-3 border-b border-white/8 pb-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#16181e]">
                    <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      Talla {item.size} · ×{item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#79d8c4]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-drawer__footer">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-slate-400">Total</span>
            <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            className="button button-primary w-full"
            disabled={cart.length === 0}
            onClick={() => {
              alert("Demo: aquí iría el checkout / pago.");
            }}
          >
            Ir a pagar
          </button>
          <button type="button" className="button button-secondary mt-2 w-full" onClick={() => setCartOpen(false)}>
            Seguir comprando
          </button>
        </div>
      </aside>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M6 6 5 3H2" />
    </svg>
  );
}

export function CartIconButton() {
  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const count = cart.reduce((n, i) => n + i.quantity, 0);

  return (
    <button
      type="button"
      className="cart-icon-btn"
      onClick={() => setCartOpen(true)}
      aria-label={`Ver carrito${count ? `, ${count} artículos` : ""}`}
    >
      <CartIcon />
      {count > 0 && <span className="cart-icon-btn__count">{count}</span>}
    </button>
  );
}
