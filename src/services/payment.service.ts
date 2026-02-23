import Stripe from "stripe";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { NotFoundError, ValidationError } from "../utils/error-handler";

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as Stripe.LatestApiVersion })
  : null;

export class PaymentService {
  async createPaymentIntent(orderId: string, userId: string) {
    if (!stripe) {
      throw new ValidationError("Payment service not configured");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) throw new NotFoundError("Order");
    if (order.userId !== userId) throw new ValidationError("Order does not belong to user");
    if (order.status !== "PENDING") {
      throw new ValidationError("Order is not in pending status");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // cents
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
    });

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(payload: string, signature: string) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new ValidationError("Stripe webhook not configured");
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(paymentIntent.id);
        break;
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCEEDED", paidAt: new Date() },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        }),
      ]);
    }
  }

  private async handlePaymentFailed(paymentIntentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }
  }
}

export const paymentService = new PaymentService();
