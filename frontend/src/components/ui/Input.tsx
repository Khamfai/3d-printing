"use client";

import { type InputHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ref, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm transition-colors",
          "focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          "placeholder:text-gray-400",
          error ? "border-red-300 focus:ring-red-500" : "border-gray-300",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
