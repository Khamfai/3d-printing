import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Model3D } from "@/types";

interface FeaturedModelsProps {
  models: Model3D[];
}

export function FeaturedModels({ models }: FeaturedModelsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Models</h2>
          <p className="mt-2 text-gray-500">Explore our curated collection of 3D printable models</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {models.slice(0, 8).map((model) => (
            <Link key={model.id} href={`/gallery/${model.slug}`}>
              <Card hover className="h-full">
                <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-50 rounded-t-xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 truncate">{model.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{model.category || "General"}</p>
                  {model.dimensionX && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {model.dimensionX} x {model.dimensionY} x {model.dimensionZ} mm
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/gallery">
            <Button variant="outline" size="lg">View All Models</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
