"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["PENDING", "PAID", "PRINTING", "FINISHED", "SHIPPED", "COMPLETED"];
const STEP_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PRINTING: "Printing",
  FINISHED: "Finished",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
};

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
}

export function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
  const currentIndex = STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2",
                    index <= currentIndex ? "bg-brand-500" : "bg-gray-200"
                  )}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  isCompleted
                    ? "bg-brand-500 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted && index < currentIndex ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-2 text-xs text-center hidden sm:block",
                  isCurrent ? "text-brand-600 font-medium" : "text-gray-500"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
