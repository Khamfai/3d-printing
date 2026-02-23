import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { adminOnly } from "../middleware/role.guard";
import { materialService } from "../services/material.service";
import { validate } from "../middleware/validation";
import { createMaterialSchema, updateMaterialSchema, paginationSchema } from "../types";
import { success, successPaginated } from "../utils/response";

export const materialRoutes = new Elysia({ prefix: "/materials" })
  // Public: get active materials
  .get("/", async () => {
    const materials = await materialService.getActive();
    return success(materials, "Materials retrieved");
  })
  // Admin routes
  .use(authGuard)
  .use(adminOnly)
  .get("/all", async ({ query }) => {
    const pagination = validate(paginationSchema, query);
    const { materials, total } = await materialService.getAll(pagination);
    return successPaginated(
      materials,
      total,
      pagination.page,
      pagination.limit,
      "All materials retrieved"
    );
  })
  .get(
    "/:id",
    async ({ params }) => {
      const material = await materialService.getById(params.id);
      return success(material, "Material retrieved");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    "/",
    async ({ body }) => {
      const data = validate(createMaterialSchema, body);
      const material = await materialService.create(data);
      return success(material, "Material created");
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        density: t.Number(),
        costPerGram: t.Number(),
        colors: t.Optional(t.Array(t.Object({ name: t.String(), hex: t.String() }))),
        properties: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const data = validate(updateMaterialSchema, body);
      const material = await materialService.update(params.id, data);
      return success(material, "Material updated");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await materialService.delete(params.id);
      return success(null, "Material deleted");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
