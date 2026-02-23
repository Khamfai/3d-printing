"use client";

import { formatCurrency, QUALITY_OPTIONS } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();
  const quality = QUALITY_OPTIONS.find((q) => q.value === item.quality);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Color swatch */}
      <div className="w-16 h-16 rounded-lg border shrink-0 flex items-center justify-center" style={{ backgroundColor: item.colorHex }}>
        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.modelName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.materialName} &middot; {quality?.label || item.quality} &middot; {item.infillPercent}% infill
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="font-medium text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} each</p>
        )}
      </div>
    </div>
  );
}
