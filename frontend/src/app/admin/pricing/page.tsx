"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { pricingAPI } from "@/services/pricing.service";
import type { PricingRule } from "@/types";

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", machineCostPerHour: "", markupPercent: "", minimumPrice: "" });
  const [isSaving, setIsSaving] = useState(false);

  const loadRules = () => {
    setIsLoading(true);
    pricingAPI.getRules().then((res) => {
      setRules(res.data || []);
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => { loadRules(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", machineCostPerHour: "5", markupPercent: "30", minimumPrice: "5" });
    setShowModal(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      machineCostPerHour: String(rule.machineCostPerHour),
      markupPercent: String(rule.markupPercent),
      minimumPrice: String(rule.minimumPrice),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        name: form.name,
        machineCostPerHour: Number(form.machineCostPerHour),
        markupPercent: Number(form.markupPercent),
        minimumPrice: Number(form.minimumPrice),
      };
      if (editingId) {
        await pricingAPI.updateRule(editingId, data);
      } else {
        await pricingAPI.createRule(data);
      }
      setShowModal(false);
      loadRules();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing rule?")) return;
    await pricingAPI.deleteRule(id);
    loadRules();
  };

  return (
    <div>
      <PageHeader
        title="Pricing Rules"
        description="Configure pricing formulas for print estimation"
        action={<Button onClick={openCreate}>Add Rule</Button>}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rule.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Machine: ${rule.machineCostPerHour}/hr &middot;
                    Markup: {rule.markupPercent}% &middot;
                    Min: ${rule.minimumPrice}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(rule)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(rule.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Pricing Rule" : "Add Pricing Rule"}>
        <div className="space-y-4">
          <Input label="Rule Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Machine Cost ($/hour)" type="number" step="0.5" value={form.machineCostPerHour} onChange={(e) => setForm({ ...form, machineCostPerHour: e.target.value })} required />
          <Input label="Markup (%)" type="number" step="1" value={form.markupPercent} onChange={(e) => setForm({ ...form, markupPercent: e.target.value })} required />
          <Input label="Minimum Price ($)" type="number" step="0.5" value={form.minimumPrice} onChange={(e) => setForm({ ...form, minimumPrice: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isSaving}>{editingId ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
