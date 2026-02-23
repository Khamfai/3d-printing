"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface GalleryFiltersProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export function GalleryFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  categories,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search models"
        />
      </div>
      <Select
        options={[
          { value: "", label: "All Categories" },
          ...categories.map((c) => ({ value: c, label: c })),
        ]}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
        className="w-full sm:w-48"
      />
    </div>
  );
}
