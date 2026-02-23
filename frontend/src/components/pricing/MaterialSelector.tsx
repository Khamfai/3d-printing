"use client";

import { cn } from "@/lib/utils";
import type { Material } from "@/types";

interface MaterialSelectorProps {
  materials: Material[];
  selectedId: string;
  onSelect: (material: Material) => void;
}

export function MaterialSelector({ materials, selectedId, onSelect }: MaterialSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Material</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {materials.map((material) => (
          <button
            key={material.id}
            onClick={() => onSelect(material)}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selectedId === material.id
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <p className="font-medium text-gray-900">{material.name}</p>
            <p className="text-xs text-gray-500 mt-1">{material.description}</p>
            <p className="text-xs text-brand-600 mt-2 font-medium">
              ${material.costPerGram.toFixed(3)}/g
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
