import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/error-handler";
import type { CreateMaterialDTO, UpdateMaterialDTO, PaginationDTO } from "../types";

export class MaterialService {
  async getAll(pagination: PaginationDTO) {
    const { page, limit, search, order } = pagination;
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: order },
      }),
      prisma.material.count({ where }),
    ]);

    return { materials, total };
  }

  async getActive() {
    return prisma.material.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundError("Material");
    return material;
  }

  async create(data: CreateMaterialDTO) {
    return prisma.material.create({
      data: {
        name: data.name,
        description: data.description,
        density: data.density,
        costPerGram: data.costPerGram,
        colors: data.colors ? JSON.parse(JSON.stringify(data.colors)) : [],
        properties: data.properties ? JSON.parse(JSON.stringify(data.properties)) : undefined,
      },
    });
  }

  async update(id: string, data: UpdateMaterialDTO) {
    await this.getById(id); // throws if not found
    return prisma.material.update({
      where: { id },
      data: {
        ...data,
        colors: data.colors ? JSON.parse(JSON.stringify(data.colors)) : undefined,
        properties: data.properties ? JSON.parse(JSON.stringify(data.properties)) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.material.delete({ where: { id } });
  }
}

export const materialService = new MaterialService();
