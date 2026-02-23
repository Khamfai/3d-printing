import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { adminOnly } from "../middleware/role.guard";
import { orderService } from "../services/order.service";
import { userService } from "../services/user.service";
import { validate } from "../middleware/validation";
import { paginationSchema } from "../types";
import { success, successPaginated } from "../utils/response";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authGuard)
  .use(adminOnly)
  .get("/dashboard", async () => {
    const stats = await orderService.getStats();
    return success(stats, "Dashboard stats retrieved");
  })
  .get("/users", async ({ query }) => {
    const pagination = validate(paginationSchema, query);
    const { users, total } = await userService.getAll(pagination);
    return successPaginated(users, total, pagination.page, pagination.limit, "Users retrieved");
  })
  .get("/users/:id", async ({ params }) => {
    const user = await userService.getById(params.id);
    return success(user, "User retrieved");
  }, {
    params: t.Object({ id: t.String() }),
  })
  .patch("/users/:id/role", async ({ params, body }) => {
    const user = await userService.updateRole(params.id, body.role as "CUSTOMER" | "ADMIN");
    return success(user, "User role updated");
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ role: t.String() }),
  });
