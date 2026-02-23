"use client";

import { cn } from "@/lib/utils";
import type { MaterialColor } from "@/types";

interface ColorPickerProps {
  colors: MaterialColor[];
  selectedHex: string;
  onSelect: (hex: string) => void;
}

export function ColorPicker({ colors, selectedHex, onSelect }: ColorPickerProps) {
  if (!colors.length) return null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Color</label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => onSelect(color.hex)}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-all relative",
              selectedHex === color.hex
                ? "border-brand-500 ring-2 ring-brand-200 scale-110"
                : "border-gray-300 hover:scale-105"
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          >
            {selectedHex === color.hex && (
              <svg className="w-5 h-5 absolute inset-0 m-auto text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Selected: {colors.find((c) => c.hex === selectedHex)?.name || selectedHex}
      </p>
    </div>
  );
}
