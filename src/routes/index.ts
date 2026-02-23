import { Elysia } from "elysia";
import { authRoutes } from "./auth.routes";
import { modelRoutes } from "./model.routes";
import { materialRoutes } from "./material.routes";
import { orderRoutes } from "./order.routes";
import { paymentRoutes } from "./payment.routes";
import { pricingRoutes } from "./pricing.routes";
import { uploadRoutes } from "./upload.routes";
import { adminRoutes } from "./admin.routes";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(authRoutes)
  .use(modelRoutes)
  .use(materialRoutes)
  .use(orderRoutes)
  .use(paymentRoutes)
  .use(pricingRoutes)
  .use(uploadRoutes)
  .use(adminRoutes);
