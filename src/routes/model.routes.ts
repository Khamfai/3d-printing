import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { adminOnly } from "../middleware/role.guard";
import { modelService } from "../services/model.service";
import { storageService } from "../services/storage.service";
import { validate } from "../middleware/validation";
import { createModelSchema, paginationSchema } from "../types";
import { success, successPaginated } from "../utils/response";

export const modelRoutes = new Elysia({ prefix: "/models" })
  // Public routes
  .get(
    "/",
    async ({ query }) => {
      const pagination = validate(paginationSchema, query);
      const filters = {
        category: query.category as string | undefined,
        isSample: query.isSample === "true" ? true : undefined,
      };
      const { models, total } = await modelService.getAll(pagination, filters);
      return successPaginated(models, total, pagination.page, pagination.limit, "Models retrieved");
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        order: t.Optional(t.String()),
        category: t.Optional(t.String()),
        isSample: t.Optional(t.String()),
      }),
    }
  )
  .get("/featured", async () => {
    const models = await modelService.getFeatured();
    return success(models, "Featured models retrieved");
  })
  .get(
    "/:slug",
    async ({ params }) => {
      const model = await modelService.getBySlug(params.slug);
      // Generate download URL for the model file
      const fileUrl = await storageService.getDownloadUrl(model.fileKey);
      const thumbnailUrl = model.thumbnailKey
        ? await storageService.getDownloadUrl(model.thumbnailKey)
        : null;
      return success({ ...model, fileUrl, thumbnailUrl }, "Model retrieved");
    },
    {
      params: t.Object({ slug: t.String() }),
    }
  )
  // Authenticated routes
  .use(authGuard)
  .get("/user/my-models", async ({ user, query }) => {
    const pagination = validate(paginationSchema, query);
    const { models, total } = await modelService.getByUser(user.id, pagination);
    return successPaginated(
      models,
      total,
      pagination.page,
      pagination.limit,
      "User models retrieved"
    );
  })
  .post(
    "/",
    async ({ body, user }) => {
      const data = validate(createModelSchema, body);
      const model = await modelService.create(data, user.id);
      return success(model, "Model created");
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        format: t.String(),
        fileKey: t.String(),
        thumbnailKey: t.Optional(t.String()),
        dimensionX: t.Optional(t.Number()),
        dimensionY: t.Optional(t.Number()),
        dimensionZ: t.Optional(t.Number()),
        volumeCm3: t.Optional(t.Number()),
        category: t.Optional(t.String()),
        isSample: t.Optional(t.Boolean()),
        isFeatured: t.Optional(t.Boolean()),
        fileSizeBytes: t.Optional(t.Number()),
      }),
    }
  )
  // Admin routes
  .use(adminOnly)
  .put(
    "/:id",
    async ({ params, body }) => {
      const model = await modelService.update(params.id, body as Record<string, unknown>);
      return success(model, "Model updated");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await modelService.delete(params.id);
      return success(null, "Model deleted");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
