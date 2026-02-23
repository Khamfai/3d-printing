"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialSelector } from "@/components/pricing/MaterialSelector";
import { ColorPicker } from "@/components/pricing/ColorPicker";
import { PriceEstimator } from "@/components/pricing/PriceEstimator";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useConfigStore } from "@/store/config-store";
import { useCartStore } from "@/store/cart-store";
import { usePricing } from "@/hooks/usePricing";
import { materialsAPI } from "@/services/materials.service";
import { QUALITY_OPTIONS } from "@/lib/utils";
import type { Material, MaterialColor } from "@/types";

export default function ConfigurePage() {
  const router = useRouter();
  const config = useConfigStore();
  const addItem = useCartStore((s) => s.addItem);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { estimate, isLoading: pricingLoading, error: pricingError } = usePricing({
    modelId: config.modelId || undefined,
    materialId: config.materialId,
    quality: config.quality,
    infillPercent: config.infillPercent,
    quantity: config.quantity,
  });

  useEffect(() => {
    materialsAPI.getActive().then((res) => {
      if (res.data) {
        setMaterials(res.data);
        if (res.data.length > 0 && !config.materialId) {
          const first = res.data[0];
          config.setMaterial(first.id, first.name);
          setSelectedMaterial(first);
          if (first.colors.length > 0) {
            config.setColor(first.colors[0].hex);
          }
        }
      }
    }).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMaterialSelect = (material: Material) => {
    config.setMaterial(material.id, material.name);
    setSelectedMaterial(material);
    if (material.colors.length > 0) {
      config.setColor(material.colors[0].hex);
    }
  };

  const handleAddToCart = () => {
    if (!estimate) return;
    addItem({
      modelId: config.modelId,
      modelName: config.modelName || "Custom Model",
      modelSlug: "",
      materialId: config.materialId,
      materialName: config.materialName,
      colorHex: config.colorHex,
      quality: config.quality,
      infillPercent: config.infillPercent,
      quantity: config.quantity,
      unitPrice: estimate.pricePerUnit,
    });
    router.push("/cart");
  };

  const colors: MaterialColor[] = selectedMaterial?.colors || [];

  return (
    <div className="container-page">
      <PageHeader
        title="Configure Print Settings"
        description={config.modelName ? `Configuring: ${config.modelName}` : "Select materials and settings for your print"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-8">
          <MaterialSelector
            materials={materials}
            selectedId={config.materialId}
            onSelect={handleMaterialSelect}
          />

          {colors.length > 0 && (
            <ColorPicker
              colors={colors}
              selectedHex={config.colorHex}
              onSelect={config.setColor}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Select
              label="Quality"
              options={QUALITY_OPTIONS.map((q) => ({ value: q.value, label: `${q.label} - ${q.description}` }))}
              value={config.quality}
              onChange={(e) => config.setQuality(e.target.value as "DRAFT" | "STANDARD" | "HIGH")}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Infill: {config.infillPercent}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={config.infillPercent}
                onChange={(e) => config.setInfill(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5%</span><span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => config.setQuantity(config.quantity - 1)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >-</button>
                <span className="flex-1 text-center font-medium">{config.quantity}</span>
                <button
                  onClick={() => config.setQuantity(config.quantity + 1)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Price sidebar */}
        <div className="space-y-4">
          <PriceEstimator
            estimate={estimate}
            isLoading={pricingLoading}
            error={pricingError}
          />

          <Button
            onClick={handleAddToCart}
            disabled={!estimate}
            className="w-full"
            size="lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
