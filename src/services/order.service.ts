import { prisma } from "../db/prisma";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error-handler";
import type { CreateOrderDTO, UpdateOrderStatusDTO, PaginationDTO } from "../types";
import { pricingService } from "./pricing.service";
import type { OrderStatus } from "../generated/prisma/enums";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PRINTING", "CANCELLED"],
  PRINTING: ["FINISHED", "CANCELLED"],
  FINISHED: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class OrderService {
  async create(userId: string, data: CreateOrderDTO) {
    // Calculate prices for each item
    const itemsWithPrices = await Promise.all(
      data.items.map(async (item) => {
        const estimate = await pricingService.estimate({
          modelId: item.modelId,
          materialId: item.materialId,
          quality: item.quality,
          infillPercent: item.infillPercent,
          quantity: item.quantity,
        });

        return {
          modelId: item.modelId,
          materialId: item.materialId,
          colorHex: item.colorHex,
          quality: item.quality,
          infillPercent: item.infillPercent,
          quantity: item.quantity,
          unitPrice: estimate.pricePerUnit,
          totalPrice: estimate.total,
        };
      })
    );

    const totalAmount = itemsWithPrices.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: data.shippingAddress
          ? JSON.parse(JSON.stringify(data.shippingAddress))
          : undefined,
        notes: data.notes,
        items: {
          create: itemsWithPrices,
        },
      },
      include: {
        items: {
          include: {
            model: { select: { id: true, name: true, slug: true, thumbnailKey: true } },
            material: { select: { id: true, name: true } },
          },
        },
      },
    });

    return order;
  }

  async getAll(pagination: PaginationDTO, filters?: { status?: string; userId?: string }) {
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              model: { select: { id: true, name: true, thumbnailKey: true } },
              material: { select: { id: true, name: true } },
            },
          },
          _count: { select: { payments: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            model: true,
            material: true,
          },
        },
        payments: true,
      },
    });
    if (!order) throw new NotFoundError("Order");
    return order;
  }

  async getByUser(userId: string, pagination: PaginationDTO) {
    return this.getAll(pagination, { userId });
  }

  async updateStatus(id: string, data: UpdateOrderStatusDTO, userRole: string) {
    const order = await this.getById(id);

    // Only admins can update status
    if (userRole !== "ADMIN") {
      throw new ForbiddenError("Only admins can update order status");
    }

    const validNext = VALID_TRANSITIONS[order.status] || [];
    if (!validNext.includes(data.status)) {
      throw new ValidationError(
        `Cannot transition from ${order.status} to ${data.status}. Valid transitions: ${validNext.join(", ") || "none"}`
      );
    }

    return prisma.order.update({
      where: { id },
      data: { status: data.status as OrderStatus },
      include: {
        items: {
          include: {
            model: { select: { id: true, name: true } },
            material: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getStats() {
    const [totalOrders, pendingOrders, revenue, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["PAID", "PRINTING", "FINISHED", "SHIPPED", "COMPLETED"] } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: revenue._sum.totalAmount || 0,
      recentOrders,
    };
  }
}

export const orderService = new OrderService();
