"use client";

import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PriceEstimate } from "@/types";

interface PriceEstimatorProps {
  estimate: PriceEstimate | null;
  isLoading: boolean;
  error?: string | null;
}

export function PriceEstimator({ estimate, isLoading, error }: PriceEstimatorProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Estimate</h3>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-full mt-4" />
        </div>
      ) : estimate ? (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Material cost</span>
            <span className="text-gray-900">{formatCurrency(estimate.materialCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Print time cost</span>
            <span className="text-gray-900">{formatCurrency(estimate.timeCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Est. print time</span>
            <span className="text-gray-900">{estimate.estimatedHours}h</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price per unit</span>
            <span className="text-gray-900 font-medium">{formatCurrency(estimate.pricePerUnit)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span className="text-gray-900">Total</span>
            <span className="text-brand-600">{formatCurrency(estimate.total)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Select a material to see pricing
        </p>
      )}
    </div>
  );
}
