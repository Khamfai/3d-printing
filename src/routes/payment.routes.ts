import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { paymentService } from "../services/payment.service";
import { success } from "../utils/response";

export const paymentRoutes = new Elysia({ prefix: "/payments" })
  // Stripe webhook (no auth - verified by Stripe signature)
  .post("/webhook", async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";
    const result = await paymentService.handleWebhook(body, signature);
    return success(result, "Webhook processed");
  })
  // Authenticated routes
  .use(authGuard)
  .post("/create-intent", async ({ body, user }) => {
    const result = await paymentService.createPaymentIntent(body.orderId, user.id);
    return success(result, "Payment intent created");
  }, {
    body: t.Object({ orderId: t.String() }),
  });
