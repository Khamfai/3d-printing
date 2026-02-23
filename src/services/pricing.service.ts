import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/error-handler";
import { calculatePrice } from "../utils/pricing";
import type { PriceEstimateDTO, CreatePricingRuleDTO } from "../types";

export class PricingService {
  async estimate(data: PriceEstimateDTO) {
    // Get material
    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
    });
    if (!material) throw new NotFoundError("Material");

    // Get volume from model or use provided
    let volumeCm3 = data.volumeCm3;
    if (!volumeCm3 && data.modelId) {
      const model = await prisma.model3D.findUnique({
        where: { id: data.modelId },
      });
      if (!model) throw new NotFoundError("Model");
      volumeCm3 = model.volumeCm3 || 1;
    }
    if (!volumeCm3) volumeCm3 = 1;

    // Get active pricing rule
    const rule = await prisma.pricingRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const machineCostPerHour = rule?.machineCostPerHour ?? 5.0;
    const markupPercent = rule?.markupPercent ?? 30;
    const minimumPrice = rule?.minimumPrice ?? 5.0;

    return calculatePrice({
      volumeCm3,
      materialDensity: material.density,
      materialCostPerGram: material.costPerGram,
      infillPercent: data.infillPercent,
      quality: data.quality,
      machineCostPerHour,
      markupPercent,
      minimumPrice,
      quantity: data.quantity,
    });
  }

  async getRules() {
    return prisma.pricingRule.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async createRule(data: CreatePricingRuleDTO) {
    return prisma.pricingRule.create({ data });
  }

  async updateRule(id: string, data: Partial<CreatePricingRuleDTO>) {
    return prisma.pricingRule.update({ where: { id }, data });
  }

  async deleteRule(id: string) {
    await prisma.pricingRule.delete({ where: { id } });
  }
}

export const pricingService = new PricingService();
