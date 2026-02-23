// ── Model Types ──
export type ModelFormat = "STL" | "OBJ" | "GLTF" | "GLB" | "THREE_MF";

export interface ModelDimensions {
  x: number;
  y: number;
  z: number;
}

export interface Model3D {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  format: ModelFormat;
  fileKey: string;
  thumbnailKey: string | null;
  dimensionX: number | null;
  dimensionY: number | null;
  dimensionZ: number | null;
  volumeCm3: number | null;
  category: string | null;
  isSample: boolean;
  isFeatured: boolean;
  fileSizeBytes: number | null;
  userId: string | null;
  fileUrl?: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Material Types ──
export interface MaterialColor {
  name: string;
  hex: string;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  density: number;
  costPerGram: number;
  colors: MaterialColor[];
  properties: Record<string, string> | null;
  isActive: boolean;
}

// ── Order Types ──
export type OrderStatus = "PENDING" | "PAID" | "PRINTING" | "FINISHED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type PrintQuality = "DRAFT" | "STANDARD" | "HIGH";

export interface OrderItem {
  id: string;
  modelId: string;
  materialId: string;
  colorHex: string;
  quality: PrintQuality;
  infillPercent: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  model: Pick<Model3D, "id" | "name" | "slug" | "thumbnailKey">;
  material: Pick<Material, "id" | "name">;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress | null;
  notes: string | null;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ── Pricing Types ──
export interface PriceEstimate {
  materialCost: number;
  timeCost: number;
  subtotal: number;
  total: number;
  estimatedHours: number;
  pricePerUnit: number;
}

export interface PricingRule {
  id: string;
  name: string;
  machineCostPerHour: number;
  markupPercent: number;
  minimumPrice: number;
  isActive: boolean;
}

// ── Auth Types ──
export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  avatar: string | null;
}

// ── Cart Types ──
export interface CartItem {
  id: string;
  modelId: string;
  modelName: string;
  modelSlug: string;
  materialId: string;
  materialName: string;
  colorHex: string;
  quality: PrintQuality;
  infillPercent: number;
  quantity: number;
  unitPrice: number;
}

// ── API Types ──
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

// ── Admin Types ──
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: Array<Order & { _count: { items: number } }>;
}

// ── Print Config ──
export interface PrintConfig {
  modelId: string;
  materialId: string;
  colorHex: string;
  quality: PrintQuality;
  infillPercent: number;
  quantity: number;
}
