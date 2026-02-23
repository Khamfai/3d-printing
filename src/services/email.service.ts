import { Resend } from "resend";
import { env } from "../config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class EmailService {
  async sendOrderConfirmation(
    to: string,
    data: { orderId: string; total: number; itemCount: number }
  ) {
    if (!resend) {
      console.log(`[Email Mock] Order confirmation to ${to}:`, data);
      return;
    }

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `Order Confirmation #${data.orderId.slice(0, 8)}`,
      html: `
        <h1>Order Confirmed!</h1>
        <p>Your order <strong>#${data.orderId.slice(0, 8)}</strong> has been received.</p>
        <p><strong>Items:</strong> ${data.itemCount}</p>
        <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
        <p>We'll notify you when your print starts.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">3D Printing Service</p>
      `,
    });
  }

  async sendStatusUpdate(to: string, data: { orderId: string; status: string }) {
    if (!resend) {
      console.log(`[Email Mock] Status update to ${to}:`, data);
      return;
    }

    const statusMessages: Record<string, string> = {
      PAID: "Payment received! Your order is queued for printing.",
      PRINTING: "Your order is now being printed!",
      FINISHED: "Your print is finished and ready for shipping!",
      SHIPPED: "Your order has been shipped!",
      COMPLETED: "Your order has been completed. Thank you!",
    };

    const message = statusMessages[data.status] || `Order status updated to: ${data.status}`;

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `Order #${data.orderId.slice(0, 8)} - ${data.status}`,
      html: `
        <h1>Order Update</h1>
        <p>Order <strong>#${data.orderId.slice(0, 8)}</strong></p>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">3D Printing Service</p>
      `,
    });
  }
}

export const emailService = new EmailService();
