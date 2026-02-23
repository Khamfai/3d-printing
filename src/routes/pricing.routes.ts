import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { adminOnly } from "../middleware/role.guard";
import { pricingService } from "../services/pricing.service";
import { validate } from "../middleware/validation";
import { priceEstimateSchema, createPricingRuleSchema } from "../types";
import { success } from "../utils/response";

export const pricingRoutes = new Elysia({ prefix: "/pricing" })
  // Public: get price estimate
  .post("/estimate", async ({ body }) => {
    const data = validate(priceEstimateSchema, body);
    const estimate = await pricingService.estimate(data);
    return success(estimate, "Price estimated");
  }, {
    body: t.Object({
      modelId: t.Optional(t.String()),
      volumeCm3: t.Optional(t.Number()),
      materialId: t.String(),
      quality: t.Optional(t.String()),
      infillPercent: t.Optional(t.Number()),
      quantity: t.Optional(t.Number()),
    }),
  })
  // Admin: manage pricing rules
  .use(authGuard)
  .use(adminOnly)
  .get("/rules", async () => {
    const rules = await pricingService.getRules();
    return success(rules, "Pricing rules retrieved");
  })
  .post("/rules", async ({ body }) => {
    const data = validate(createPricingRuleSchema, body);
    const rule = await pricingService.createRule(data);
    return success(rule, "Pricing rule created");
  }, {
    body: t.Object({
      name: t.String(),
      machineCostPerHour: t.Number(),
      markupPercent: t.Number(),
      minimumPrice: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .put("/rules/:id", async ({ params, body }) => {
    const rule = await pricingService.updateRule(params.id, body as Record<string, unknown>);
    return success(rule, "Pricing rule updated");
  }, {
    params: t.Object({ id: t.String() }),
  })
  .delete("/rules/:id", async ({ params }) => {
    await pricingService.deleteRule(params.id);
    return success(null, "Pricing rule deleted");
  }, {
    params: t.Object({ id: t.String() }),
  });
