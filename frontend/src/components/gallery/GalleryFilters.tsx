"use client";

import { Search } from "lucide-react";
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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search models..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search models"
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
      <div className="flex-1">
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
    </div>
  );
}
