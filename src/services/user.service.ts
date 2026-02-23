import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/error-handler";
import type { PaginationDTO } from "../types";

export class UserService {
  async getAll(pagination: PaginationDTO) {
    const { page, limit, search, order } = pagination;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: order },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, models: true } },
      },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateRole(id: string, role: "CUSTOMER" | "ADMIN") {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  }
}

export const userService = new UserService();
