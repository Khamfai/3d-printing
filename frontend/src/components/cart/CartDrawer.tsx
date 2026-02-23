"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore, selectCartTotal, selectCartItemCount } from "@/store/cart-store";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, setDrawerOpen } = useCartStore();
  const total = useCartStore(selectCartTotal);
  const count = useCartStore(selectCartItemCount);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setDrawerOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Cart ({count})</h2>
          <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close cart">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-gray-500">Your cart is empty</p>
              <Link href="/gallery" onClick={() => setDrawerOpen(false)}>
                <Button variant="outline" size="sm" className="mt-4">Browse Gallery</Button>
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(total)}</span>
            </div>
            <Link href="/cart" onClick={() => setDrawerOpen(false)} className="block">
              <Button className="w-full" size="lg">View Cart & Checkout</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
