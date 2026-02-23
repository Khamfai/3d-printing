import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import type { Model3D } from "@/types";

interface ModelCardProps {
  model: Model3D;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Link href={`/gallery/${model.slug}`}>
      <Card hover className="h-full group">
        <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-50 rounded-t-xl flex items-center justify-center overflow-hidden relative">
          <svg
            className="w-20 h-20 text-gray-300 group-hover:text-brand-300 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="0.75"
          >
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="absolute top-2 right-2 bg-white/90 text-xs font-mono px-2 py-0.5 rounded text-gray-500">
            {model.format}
          </span>
        </div>
        <CardContent>
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
            {model.name}
          </h3>
          {model.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{model.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {model.category || "General"}
            </span>
            {model.dimensionX && (
              <span className="text-xs text-gray-400 font-mono">
                {model.dimensionX}x{model.dimensionY}x{model.dimensionZ}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
