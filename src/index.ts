import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "./config/env";
import { errorHandler } from "./utils/error-handler";
import { apiRoutes } from "./routes";

const app = new Elysia()
  .use(
    cors({
      origin: [env.FRONTEND_URL, "http://localhost:3001"],
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "3D Printing Service API",
          version: "1.0.0",
          description: "API for 3D printing order management platform",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Models", description: "3D model management" },
          { name: "Materials", description: "Material management" },
          { name: "Orders", description: "Order management" },
          { name: "Payments", description: "Payment processing" },
          { name: "Pricing", description: "Pricing and estimation" },
          { name: "Upload", description: "File upload" },
          { name: "Admin", description: "Admin dashboard" },
        ],
      },
    })
  )
  .use(errorHandler)
  .get("/", () => ({
    name: "3D Printing Service API",
    version: "1.0.0",
    status: "running",
    docs: "/swagger",
  }))
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(apiRoutes)
  .listen(env.PORT);

console.log(`🖨️  3D Printing API running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 Swagger docs at http://${app.server?.hostname}:${app.server?.port}/swagger`);

export type App = typeof app;
