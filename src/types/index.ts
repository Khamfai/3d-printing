import { z } from "zod";

// ── Auth DTOs ──
export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;

// ── Model DTOs ──
export const createModelSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  format: z.enum(["STL", "OBJ", "GLTF", "GLB", "THREE_MF"]),
  fileKey: z.string(),
  thumbnailKey: z.string().optional(),
  dimensionX: z.number().optional(),
  dimensionY: z.number().optional(),
  dimensionZ: z.number().optional(),
  volumeCm3: z.number().optional(),
  category: z.string().optional(),
  isSample: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  fileSizeBytes: z.number().optional(),
});

export type CreateModelDTO = z.infer<typeof createModelSchema>;

// ── Material DTOs ──
export const createMaterialSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  density: z.number().positive(),
  costPerGram: z.number().positive(),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
    )
    .optional(),
  properties: z.record(z.unknown()).optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export type CreateMaterialDTO = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialDTO = z.infer<typeof updateMaterialSchema>;

// ── Order DTOs ──
export const createOrderItemSchema = z.object({
  modelId: z.string(),
  materialId: z.string(),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#CCCCCC"),
  quality: z.enum(["DRAFT", "STANDARD", "HIGH"]).default("STANDARD"),
  infillPercent: z.number().min(5).max(100).default(20),
  quantity: z.number().int().min(1).default(1),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1),
  shippingAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PRINTING", "FINISHED", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;

// ── Pricing DTOs ──
export const priceEstimateSchema = z.object({
  modelId: z.string().optional(),
  volumeCm3: z.number().positive().optional(),
  materialId: z.string(),
  quality: z.enum(["DRAFT", "STANDARD", "HIGH"]).default("STANDARD"),
  infillPercent: z.number().min(5).max(100).default(20),
  quantity: z.number().int().min(1).default(1),
});

export type PriceEstimateDTO = z.infer<typeof priceEstimateSchema>;

export const createPricingRuleSchema = z.object({
  name: z.string().min(1),
  machineCostPerHour: z.number().positive(),
  markupPercent: z.number().min(0),
  minimumPrice: z.number().min(0).default(5.0),
  isActive: z.boolean().default(true),
});

export type CreatePricingRuleDTO = z.infer<typeof createPricingRuleSchema>;

// ── Upload DTOs ──
export const presignedUrlSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().max(100 * 1024 * 1024), // 100MB max
});

export type PresignedUrlDTO = z.infer<typeof presignedUrlSchema>;

export const confirmUploadSchema = z.object({
  modelId: z.string(),
  dimensionX: z.number().optional(),
  dimensionY: z.number().optional(),
  dimensionZ: z.number().optional(),
  volumeCm3: z.number().optional(),
});

export type ConfirmUploadDTO = z.infer<typeof confirmUploadSchema>;

// ── Pagination ──
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;

// ── JWT Payload ──
export interface JWTPayload {
  sub: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

// ── API Response ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
