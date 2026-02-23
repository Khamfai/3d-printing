"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { pricingAPI } from "@/services/pricing.service";
import type { PriceEstimate, PrintConfig } from "@/types";

export function usePricing(config: Partial<PrintConfig>) {
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedConfig = useDebounce(config, 300);

  useEffect(() => {
    if (!debouncedConfig.materialId) return;

    const fetchEstimate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await pricingAPI.estimate({
          modelId: debouncedConfig.modelId,
          materialId: debouncedConfig.materialId!,
          quality: debouncedConfig.quality,
          infillPercent: debouncedConfig.infillPercent,
          quantity: debouncedConfig.quantity,
        });
        if (res.data) setEstimate(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to estimate price");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimate();
  }, [debouncedConfig]);

  return { estimate, isLoading, error };
}
