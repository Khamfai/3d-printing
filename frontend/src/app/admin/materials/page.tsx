"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { materialsAPI } from "@/services/materials.service";
import type { Material } from "@/types";

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", density: "", costPerGram: "" });
  const [isSaving, setIsSaving] = useState(false);

  const loadMaterials = () => {
    setIsLoading(true);
    materialsAPI.getAll().then((res) => {
      setMaterials(res.data || []);
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => { loadMaterials(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", density: "", costPerGram: "" });
    setShowModal(true);
  };

  const openEdit = (mat: Material) => {
    setEditingId(mat.id);
    setForm({
      name: mat.name,
      description: mat.description || "",
      density: String(mat.density),
      costPerGram: String(mat.costPerGram),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        density: Number(form.density),
        costPerGram: Number(form.costPerGram),
      };
      if (editingId) {
        await materialsAPI.update(editingId, data);
      } else {
        await materialsAPI.create(data);
      }
      setShowModal(false);
      loadMaterials();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await materialsAPI.delete(id);
    loadMaterials();
  };

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Manage printing materials and their properties"
        action={<Button onClick={openCreate}>Add Material</Button>}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {materials.map((mat) => (
            <Card key={mat.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{mat.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${mat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {mat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Density: {mat.density} g/cm&sup3; &middot; Cost: ${mat.costPerGram}/g
                  </p>
                  {mat.description && (
                    <p className="text-xs text-gray-400 mt-1">{mat.description}</p>
                  )}
                  {mat.colors.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {mat.colors.map((c) => (
                        <div
                          key={c.hex}
                          className="w-5 h-5 rounded-full border border-gray-200"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(mat)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(mat.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Material" : "Add Material"}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Density (g/cm3)" type="number" step="0.01" value={form.density} onChange={(e) => setForm({ ...form, density: e.target.value })} required />
            <Input label="Cost per gram ($)" type="number" step="0.001" value={form.costPerGram} onChange={(e) => setForm({ ...form, costPerGram: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isSaving}>{editingId ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
