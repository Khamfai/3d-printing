import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { adminOnly } from "../middleware/role.guard";
import { orderService } from "../services/order.service";
import { emailService } from "../services/email.service";
import { validate } from "../middleware/validation";
import { createOrderSchema, updateOrderStatusSchema, paginationSchema } from "../types";
import { success, successPaginated } from "../utils/response";

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .use(authGuard)
  // Customer routes
  .post(
    "/",
    async ({ body, user }) => {
      const data = validate(createOrderSchema, body);
      const order = await orderService.create(user.id, data);
      // Send confirmation email
      emailService
        .sendOrderConfirmation(user.email, {
          orderId: order.id,
          total: order.totalAmount,
          itemCount: order.items.length,
        })
        .catch(console.error);
      return success(order, "Order created");
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            modelId: t.String(),
            materialId: t.String(),
            colorHex: t.Optional(t.String()),
            quality: t.Optional(t.String()),
            infillPercent: t.Optional(t.Number()),
            quantity: t.Optional(t.Number()),
          })
        ),
        shippingAddress: t.Optional(
          t.Object({
            street: t.String(),
            city: t.String(),
            state: t.String(),
            postalCode: t.String(),
            country: t.String(),
          })
        ),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .get("/my-orders", async ({ user, query }) => {
    const pagination = validate(paginationSchema, query);
    const { orders, total } = await orderService.getByUser(user.id, pagination);
    return successPaginated(orders, total, pagination.page, pagination.limit, "Orders retrieved");
  })
  .get(
    "/:id",
    async ({ params, user }) => {
      const order = await orderService.getById(params.id);
      // Customers can only view their own orders
      if (user.role !== "ADMIN" && order.userId !== user.id) {
        return { success: false, message: "Order not found" };
      }
      return success(order, "Order retrieved");
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  // Admin routes
  .use(adminOnly)
  .get(
    "/",
    async ({ query }) => {
      const pagination = validate(paginationSchema, query);
      const filters = {
        status: query.status as string | undefined,
      };
      const { orders, total } = await orderService.getAll(pagination, filters);
      return successPaginated(
        orders,
        total,
        pagination.page,
        pagination.limit,
        "All orders retrieved"
      );
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        order: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    "/:id/status",
    async ({ params, body, user }) => {
      const data = validate(updateOrderStatusSchema, body);
      const order = await orderService.updateStatus(params.id, data, user.role);
      // Send status update email
      const fullOrder = await orderService.getById(params.id);
      emailService
        .sendStatusUpdate(fullOrder.user.email, {
          orderId: order.id,
          status: data.status,
        })
        .catch(console.error);
      return success(order, "Order status updated");
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ status: t.String() }),
    }
  );
