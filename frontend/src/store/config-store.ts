"use client";

import { create } from "zustand";
import type { PrintQuality } from "@/types";

interface ConfigState {
  modelId: string;
  modelName: string;
  materialId: string;
  materialName: string;
  colorHex: string;
  quality: PrintQuality;
  infillPercent: number;
  quantity: number;
  setModel: (id: string, name: string) => void;
  setMaterial: (id: string, name: string) => void;
  setColor: (hex: string) => void;
  setQuality: (quality: PrintQuality) => void;
  setInfill: (percent: number) => void;
  setQuantity: (qty: number) => void;
  reset: () => void;
}

const initialState = {
  modelId: "",
  modelName: "",
  materialId: "",
  materialName: "",
  colorHex: "#CCCCCC",
  quality: "STANDARD" as PrintQuality,
  infillPercent: 20,
  quantity: 1,
};

export const useConfigStore = create<ConfigState>()((set) => ({
  ...initialState,
  setModel: (id, name) => set({ modelId: id, modelName: name }),
  setMaterial: (id, name) => set({ materialId: id, materialName: name }),
  setColor: (hex) => set({ colorHex: hex }),
  setQuality: (quality) => set({ quality }),
  setInfill: (percent) => set({ infillPercent: percent }),
  setQuantity: (qty) => set({ quantity: Math.max(1, qty) }),
  reset: () => set(initialState),
}));
