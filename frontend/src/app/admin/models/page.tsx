"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { modelsAPI } from "@/services/models.service";
import { formatDate } from "@/lib/utils";
import type { Model3D } from "@/types";

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadModels = () => {
    setIsLoading(true);
    modelsAPI.getAll({ page: String(page), limit: "20" }).then((res) => {
      setModels(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => { loadModels(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this model?")) return;
    await modelsAPI.delete(id);
    loadModels();
  };

  return (
    <div>
      <PageHeader title="3D Models" description="Manage sample and user-uploaded models" />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Format</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{model.name}</td>
                    <td className="py-3 font-mono text-xs">{model.format}</td>
                    <td className="py-3">{model.category || "-"}</td>
                    <td className="py-3">
                      {model.isSample ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Sample</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Upload</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(model.createdAt)}</td>
                    <td className="py-3 text-right">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(model.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
