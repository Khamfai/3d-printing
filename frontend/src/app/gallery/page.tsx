"use client";

import { useState, useEffect, useMemo } from "react";
import { ModelCard } from "@/components/gallery/ModelCard";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { modelsAPI } from "@/services/models.service";
import type { Model3D } from "@/types";

export default function GalleryPage() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = { isSample: "true", limit: "50" };
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await modelsAPI.getAll(params);
        setModels(res.data || []);
      } catch {
        setModels([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [debouncedSearch]);

  const categories = useMemo(
    () => [...new Set(models.map((m) => m.category).filter(Boolean) as string[])],
    [models]
  );

  const filtered = useMemo(
    () => (category ? models.filter((m) => m.category === category) : models),
    [models, category]
  );

  return (
    <div className="container-page">
      <PageHeader
        title="3D Model Gallery"
        description="Browse our collection of sample 3D models ready for printing"
      />

      <GalleryFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        categories={categories}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No models found"
          description={search ? "Try a different search term" : "No sample models available yet"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
