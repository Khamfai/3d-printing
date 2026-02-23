import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  PAID: { label: "Paid", color: "text-blue-700", bgColor: "bg-blue-100" },
  PRINTING: { label: "Printing", color: "text-purple-700", bgColor: "bg-purple-100" },
  FINISHED: { label: "Finished", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  SHIPPED: { label: "Shipped", color: "text-cyan-700", bgColor: "bg-cyan-100" },
  COMPLETED: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100" },
};

export const QUALITY_OPTIONS = [
  { value: "DRAFT" as const, label: "Draft", description: "0.3mm layers - Fast, less detail", layerHeight: 0.3 },
  { value: "STANDARD" as const, label: "Standard", description: "0.2mm layers - Balanced", layerHeight: 0.2 },
  { value: "HIGH" as const, label: "High Quality", description: "0.1mm layers - Slow, fine detail", layerHeight: 0.1 },
];

export const ALLOWED_MODEL_FORMATS = [".stl", ".obj", ".gltf", ".glb", ".3mf"];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
