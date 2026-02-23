import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/error-handler";
import type { CreateModelDTO, PaginationDTO } from "../types";

export class ModelService {
  async getAll(pagination: PaginationDTO, filters?: { category?: string; isSample?: boolean; isFeatured?: boolean }) {
    const { page, limit, search, order } = pagination;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (filters?.category) where.category = filters.category;
    if (filters?.isSample !== undefined) where.isSample = filters.isSample;
    if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    const [models, total] = await Promise.all([
      prisma.model3D.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.model3D.count({ where }),
    ]);

    return { models, total };
  }

  async getBySlug(slug: string) {
    const model = await prisma.model3D.findUnique({
      where: { slug },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!model) throw new NotFoundError("Model");
    return model;
  }

  async getById(id: string) {
    const model = await prisma.model3D.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!model) throw new NotFoundError("Model");
    return model;
  }

  async create(data: CreateModelDTO, userId?: string) {
    const slug = this.generateSlug(data.name);
    const model = await prisma.model3D.create({
      data: {
        ...data,
        slug,
        userId,
      },
    });
    return model;
  }

  async update(id: string, data: Partial<CreateModelDTO>) {
    const model = await prisma.model3D.update({
      where: { id },
      data,
    });
    return model;
  }

  async delete(id: string) {
    await prisma.model3D.delete({ where: { id } });
  }

  async getFeatured() {
    return prisma.model3D.findMany({
      where: { isFeatured: true, isSample: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  }

  async getByUser(userId: string, pagination: PaginationDTO) {
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;

    const [models, total] = await Promise.all([
      prisma.model3D.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: order },
      }),
      prisma.model3D.count({ where: { userId } }),
    ]);

    return { models, total };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
}

export const modelService = new ModelService();
