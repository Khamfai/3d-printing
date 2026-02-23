"use client";

import { type SelectHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ className, label, error, options, id, ref, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-white",
          "focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          error ? "border-red-300" : "border-gray-300",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
