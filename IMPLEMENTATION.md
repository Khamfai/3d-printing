# 3D Printing Service — Technical Implementation Documentation

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [API Reference](#3-api-reference)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [File Upload Flow](#6-file-upload-flow)
7. [Pricing Algorithm](#7-pricing-algorithm)
8. [Response Format](#8-response-format)
9. [Error Handling](#9-error-handling)
10. [Frontend Architecture](#10-frontend-architecture)
11. [3D Viewer](#11-3d-viewer)

---

## 1. Architecture Overview

The project follows a decoupled client-server architecture with a Bun/Elysia REST API backend and a Next.js 14 frontend. Communication between the two layers is exclusively over HTTP/JSON, with JWT-based authentication.

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Next.js 14 (App Router)                     │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │   Pages /    │  │   Zustand    │  │   React Query       │  │  │
│  │  │   Layouts    │  │   Store      │  │   (Server State)    │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘  │  │
│  │         │                 │                      │             │  │
│  │  ┌──────┴─────────────────┴──────────────────────┴──────────┐  │  │
│  │  │               Shared Components                          │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │  │  │
│  │  │  │  3D Viewer │  │  Forms /   │  │  Dashboard /       │  │  │  │
│  │  │  │  (Three.js)│  │  Auth UI   │  │  Admin Panels      │  │  │  │
│  │  │  └────────────┘  └────────────┘  └────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP / JSON + JWT
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            SERVER                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Bun + Elysia Framework                      │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌───────────────────────────────────────────┐  │  │
│  │  │  Routes   │  │            Middleware                     │  │  │
│  │  │          │  │  ┌────────────┐ ┌──────────┐ ┌─────────┐ │  │  │
│  │  │  /auth   │──│  │ auth.guard │ │role.guard│ │validate │ │  │  │
│  │  │  /models │  │  └────────────┘ └──────────┘ └─────────┘ │  │  │
│  │  │  /mats   │  └───────────────────────────────────────────┘  │  │
│  │  │  /orders │                                                 │  │
│  │  │  /pay    │  ┌───────────────────────────────────────────┐  │  │
│  │  │  /price  │  │            Services                       │  │  │
│  │  │  /upload │  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────────┐ │  │  │
│  │  │  /admin  │  │  │ auth │ │ user │ │ model │ │material│ │  │  │
│  │  └──────────┘  │  ├──────┤ ├──────┤ ├───────┤ ├────────┤ │  │  │
│  │                │  │order │ │pay   │ │storage│ │pricing │ │  │  │
│  │                │  ├──────┤ ├──────┤ ├───────┤ ├────────┤ │  │  │
│  │                │  │email │ │      │ │       │ │        │ │  │  │
│  │                │  └──────┘ └──────┘ └───────┘ └────────┘ │  │  │
│  │                └───────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────────┐│  │
│  │  │  Utils: response formatter, error handler, price calc     ││  │
│  │  └───────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│  ┌────────────────────┐  ┌──────────────────┐                       │
│  │  PostgreSQL         │  │  Cloudflare R2   │                       │
│  │  (via Prisma ORM)   │  │  (File Storage)  │                       │
│  └────────────────────┘  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Backend Directory Structure

```
/src
├── config/              # Environment variables, app configuration
├── db/                  # Prisma client instance, seed scripts
├── middleware/
│   ├── auth.guard.ts    # JWT verification, user context injection
│   ├── role.guard.ts    # Role-based access control (CUSTOMER / ADMIN)
│   └── validation.ts    # Request body / params validation schemas
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── model.service.ts
│   ├── material.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   ├── storage.service.ts
│   ├── pricing.service.ts
│   └── email.service.ts
├── routes/              # Elysia route groups (one file per domain)
├── types/               # TypeScript interfaces, Zod schemas, enums
├── utils/
│   ├── response.ts      # Standardized JSON response builder
│   ├── error-handler.ts # Global error handler & custom error classes
│   └── pricing-calculator.ts
└── index.ts             # Application entry point
```

### Frontend Directory Structure

```
/frontend
├── src/
│   └── app/                  # Next.js App Router
│       ├── layout.tsx        # Root layout (providers, global styles)
│       ├── page.tsx          # Landing / home page
│       ├── gallery/          # Public model gallery
│       ├── models/
│       │   └── [slug]/       # Individual model detail + 3D viewer
│       ├── auth/
│       │   ├── login/
│       │   └── register/
│       ├── dashboard/        # Customer dashboard (orders, account)
│       ├── admin/            # Admin panel (orders, users, materials, pricing)
│       ├── cart/             # Shopping cart
│       └── checkout/         # Order placement & payment
├── components/
│   ├── ui/                   # Reusable design-system primitives
│   ├── three/                # 3D viewer components (Canvas, loaders)
│   ├── forms/                # Auth forms, model upload forms
│   └── layout/               # Header, Footer, Sidebar, Navigation
├── lib/
│   ├── api.ts                # Axios / fetch wrapper with interceptors
│   ├── auth.ts               # Token helpers (get, set, refresh)
│   └── utils.ts              # Formatting, validation helpers
├── stores/                   # Zustand stores
│   ├── auth.store.ts
│   ├── cart.store.ts
│   └── ui.store.ts
├── hooks/                    # Custom React hooks (useAuth, useCart, etc.)
├── types/                    # Shared TypeScript types
├── styles/                   # Global CSS, Tailwind config
├── public/                   # Static assets
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## 2. Tech Stack

### Backend

| Technology | Version | Purpose | Reasoning |
|---|---|---|---|
| **Bun** | 1.x | JavaScript runtime & package manager | Significantly faster startup, install, and execution than Node.js. Native TypeScript support without transpilation. Built-in test runner. |
| **Elysia** | latest | HTTP framework | Built for Bun, type-safe by design, end-to-end type inference, plugin-based middleware model, exceptional performance benchmarks. |
| **Prisma** | 5.x | ORM & migrations | Declarative schema, auto-generated type-safe client, powerful migration system, excellent PostgreSQL support. |
| **PostgreSQL** | 15+ | Relational database | ACID compliance, JSONB support for flexible metadata, robust indexing, mature ecosystem. |
| **JWT (jsonwebtoken)** | — | Authentication tokens | Stateless auth, dual-token strategy (short-lived access + long-lived refresh) for security and UX balance. |
| **bcrypt** | — | Password hashing | Industry-standard adaptive hashing, configurable salt rounds, timing-attack resistant. |
| **Cloudflare R2** | — | Object storage (3D files) | S3-compatible API, no egress fees, global edge caching, presigned URL support. |
| **Zod** | 3.x | Runtime validation | Composable schemas, TypeScript-first, excellent error messages, integrates with Elysia's validation. |

### Frontend

| Technology | Version | Purpose | Reasoning |
|---|---|---|---|
| **Next.js** | 14 | React framework | App Router with nested layouts, server components, streaming, built-in optimizations (images, fonts, scripts). |
| **React** | 18 | UI library | Component model, concurrent features, Suspense for data fetching. |
| **Tailwind CSS** | 3.x | Utility-first CSS | Rapid prototyping, consistent design tokens, small production bundle via purging, excellent responsive utilities. |
| **Three.js** | latest | 3D rendering | Industry-standard WebGL abstraction, extensive loader ecosystem (STL, OBJ, GLTF), active community. |
| **@react-three/fiber** | — | React renderer for Three.js | Declarative Three.js, React lifecycle integration, hooks-based API. |
| **@react-three/drei** | — | Three.js helpers | Pre-built controls (OrbitControls), loaders, staging utilities. |
| **Zustand** | 4.x | Client state management | Minimal boilerplate, no providers needed, supports middleware (persist, devtools), excellent TypeScript support. |
| **TanStack React Query** | 5.x | Server state management | Automatic caching, background refetching, pagination, optimistic updates, devtools. |
| **Axios** | — | HTTP client | Interceptors for token injection/refresh, request/response transforms, cancellation. |

---

## 3. API Reference

All endpoints are prefixed with `/api`. Responses follow the standardized format described in [Section 8](#8-response-format).

### 3.1 Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new customer account. Accepts `name`, `email`, `password`. Returns user object and token pair. |
| `POST` | `/api/auth/login` | Public | Authenticate with `email` and `password`. Returns user object, access token, and refresh token. |
| `POST` | `/api/auth/refresh` | Public (requires valid refresh token) | Exchange a valid refresh token for a new access/refresh token pair. The old refresh token is invalidated. |
| `GET` | `/api/auth/me` | Bearer | Return the currently authenticated user's profile (id, name, email, role, createdAt). |

**Register Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "CUSTOMER" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  },
  "message": "Login successful"
}
```

### 3.2 3D Models — `/api/models`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/models` | Public | List published models with pagination, search, and category filtering. Returns paginated result with meta. |
| `GET` | `/api/models/featured` | Public | Retrieve featured/highlighted models for the homepage gallery. |
| `GET` | `/api/models/:slug` | Public | Get a single model by its URL-friendly slug. Includes materials, pricing, and file URLs. |
| `POST` | `/api/models` | Admin | Create a new 3D model entry. Accepts name, description, slug, category, file references, thumbnail, and material IDs. |
| `PUT` | `/api/models/:id` | Admin | Update an existing model's metadata, files, or material associations. |
| `DELETE` | `/api/models/:id` | Admin | Soft-delete or permanently remove a model and its associated storage objects. |

**Query Parameters for `GET /api/models`:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 12 | Items per page |
| `search` | string | — | Full-text search on name and description |
| `category` | string | — | Filter by category slug |
| `sort` | string | `createdAt` | Sort field (`createdAt`, `name`, `price`) |
| `order` | string | `desc` | Sort direction (`asc`, `desc`) |

### 3.3 Materials — `/api/materials`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/materials` | Public | List active/available materials for customer-facing UI. |
| `GET` | `/api/materials/all` | Admin | List all materials including inactive/archived ones. |
| `GET` | `/api/materials/:id` | Public | Get a single material with its properties and pricing rules. |
| `POST` | `/api/materials` | Admin | Create a new material. Accepts name, description, properties (density, color options), base price per gram, and status. |
| `PUT` | `/api/materials/:id` | Admin | Update a material's details or pricing. |
| `DELETE` | `/api/materials/:id` | Admin | Deactivate or remove a material. |

**Material Object:**
```json
{
  "id": "uuid",
  "name": "PLA",
  "description": "Polylactic Acid — biodegradable, easy to print",
  "density": 1.24,
  "colors": ["White", "Black", "Red", "Blue", "Green"],
  "basePricePerGram": 0.05,
  "isActive": true,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### 3.4 Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Bearer | Place a new order. Accepts an array of order items (modelId, materialId, quantity, color, scale). Calculates total via the pricing engine. |
| `GET` | `/api/orders/my-orders` | Bearer | List the authenticated customer's orders with pagination. |
| `GET` | `/api/orders/:id` | Bearer | Get full details of a specific order. Customers can only view their own; admins can view any. |
| `GET` | `/api/orders` | Admin | List all orders with filtering (status, date range, customer) and pagination. |
| `PATCH` | `/api/orders/:id/status` | Admin | Update an order's status. Valid transitions: `PENDING` -> `CONFIRMED` -> `PRINTING` -> `SHIPPED` -> `DELIVERED`. Also supports `CANCELLED`. |

**Order Statuses:**
```
PENDING  ->  CONFIRMED  ->  PRINTING  ->  SHIPPED  ->  DELIVERED
   |
   └─────────────────> CANCELLED
```

**Create Order Request Body:**
```json
{
  "items": [
    {
      "modelId": "uuid",
      "materialId": "uuid",
      "quantity": 2,
      "color": "Red",
      "scale": 1.0,
      "notes": "Please ensure smooth finish"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "US"
  }
}
```

### 3.5 Payments — `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | Bearer | Create a payment intent for a given order. Returns a client secret for frontend payment processing. |
| `POST` | `/api/payments/webhook` | Public (signature-verified) | Receive payment provider webhook events (payment succeeded, failed, refunded). Verified via webhook signature. |

**Create Intent Request:**
```json
{
  "orderId": "uuid"
}
```

**Create Intent Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentId": "uuid",
    "amount": 4599,
    "currency": "usd"
  }
}
```

### 3.6 Pricing — `/api/pricing`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/pricing/estimate` | Public | Calculate a price estimate given model dimensions/volume, material, quantity, and scale. Does not create an order. |
| `GET` | `/api/pricing/rules` | Admin | List all pricing rules (base rates, multipliers, discounts). |
| `POST` | `/api/pricing/rules` | Admin | Create a new pricing rule. |
| `PUT` | `/api/pricing/rules/:id` | Admin | Update an existing pricing rule. |
| `DELETE` | `/api/pricing/rules/:id` | Admin | Remove a pricing rule. |

**Estimate Request:**
```json
{
  "modelId": "uuid",
  "materialId": "uuid",
  "quantity": 1,
  "scale": 1.5
}
```

**Estimate Response:**
```json
{
  "success": true,
  "data": {
    "unitPrice": 22.99,
    "totalPrice": 22.99,
    "breakdown": {
      "materialCost": 15.50,
      "printTimeCost": 4.00,
      "complexitySurcharge": 1.49,
      "setupFee": 2.00,
      "discount": 0.00
    },
    "estimatedPrintTime": "4h 30m",
    "estimatedWeight": "45g"
  }
}
```

### 3.7 Upload — `/api/upload`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload/presigned-url` | Bearer | Generate a presigned URL for direct-to-R2 file upload. Accepts filename, content type, and file size. Returns the presigned PUT URL and the final object key. |
| `POST` | `/api/upload/confirm` | Bearer | Confirm that a file has been successfully uploaded. Validates the object exists in R2, records metadata (size, type, hash), and returns the public/signed read URL. |

### 3.8 Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Aggregated dashboard statistics: total orders, revenue, active users, popular models, recent activity. |
| `GET` | `/api/admin/users` | Admin | List all users with pagination, search, and role filtering. |
| `GET` | `/api/admin/users/:id` | Admin | Get detailed user profile including order history and account status. |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Change a user's role between `CUSTOMER` and `ADMIN`. |

---

## 4. Database Schema

The database is managed by Prisma with PostgreSQL as the provider. Below is the complete schema with field details and relationships.

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Model3D    │       │   Material   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │◄──┐   │ name         │
│ email (UQ)   │       │ slug (UQ)    │   │   │ description  │
│ password     │       │ description  │   │   │ density      │
│ role         │       │ category     │   │   │ colors       │
│ refreshToken │       │ fileUrl      │   │   │ basePriceGram│
│ createdAt    │       │ thumbnailUrl │   │   │ isActive     │
│ updatedAt    │       │ volume       │   │   │ createdAt    │
└──────┬───────┘       │ dimensions   │   │   │ updatedAt    │
       │               │ isFeatured   │   │   └──────┬───────┘
       │               │ isPublished  │   │          │
       │               │ materials[]  │   │          │
       │               │ createdAt    │   │          │
       │               │ updatedAt    │   │          │
       │               └──────────────┘   │          │
       │                                  │          │
       │  1:N                             │          │
       ▼                                  │          │
┌──────────────┐       ┌──────────────┐   │          │
│    Order     │       │  OrderItem   │   │          │
├──────────────┤       ├──────────────┤   │          │
│ id (PK)      │  1:N  │ id (PK)      │   │          │
│ userId (FK)  │──────►│ orderId (FK) │   │          │
│ status       │       │ modelId (FK) │───┘          │
│ totalAmount  │       │ materialId(FK│──────────────┘
│ shippingAddr │       │ quantity     │
│ notes        │       │ color        │
│ createdAt    │       │ scale        │
│ updatedAt    │       │ unitPrice    │
└──────┬───────┘       │ subtotal     │
       │               │ notes        │
       │               └──────────────┘
       │  1:1
       ▼
┌──────────────┐       ┌──────────────┐
│   Payment    │       │ PricingRule  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ orderId (FK) │       │ name         │
│ amount       │       │ type         │
│ currency     │       │ value        │
│ status       │       │ condition    │
│ provider     │       │ priority     │
│ providerRef  │       │ isActive     │
│ createdAt    │       │ createdAt    │
│ updatedAt    │       │ updatedAt    │
└──────────────┘       └──────────────┘
```

### Model Definitions

#### User

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK, auto-generated | Unique identifier |
| `name` | String | Not null | Display name |
| `email` | String | Not null, Unique | Login email, case-insensitive |
| `password` | String | Not null | bcrypt-hashed password |
| `role` | Enum (Role) | Default: `CUSTOMER` | `CUSTOMER` or `ADMIN` |
| `refreshToken` | String? | Nullable | Hashed refresh token for rotation |
| `createdAt` | DateTime | Auto | Account creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relations:** `User` 1:N `Order`

#### Model3D

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `name` | String | Not null | Display name |
| `slug` | String | Unique | URL-friendly identifier |
| `description` | String? | Nullable | Rich-text description |
| `category` | String? | Nullable | Category grouping |
| `fileUrl` | String | Not null | R2 URL to the 3D file (STL/OBJ/GLTF) |
| `thumbnailUrl` | String? | Nullable | Rendered thumbnail image URL |
| `volume` | Float? | Nullable | Calculated volume in cm^3 |
| `dimensions` | Json? | Nullable | `{ x, y, z }` bounding box in mm |
| `isFeatured` | Boolean | Default: `false` | Show on homepage featured section |
| `isPublished` | Boolean | Default: `false` | Visible to customers |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relations:** M:N `Material` (implicit join table), 1:N `OrderItem`

#### Material

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `name` | String | Not null | Material name (PLA, ABS, PETG, Resin, Nylon) |
| `description` | String? | Nullable | Material properties and characteristics |
| `density` | Float | Not null | g/cm^3, used for weight calculation |
| `colors` | Json | Not null | Array of available color strings |
| `basePricePerGram` | Float | Not null | Base cost per gram of material |
| `isActive` | Boolean | Default: `true` | Available for ordering |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relations:** M:N `Model3D`, 1:N `OrderItem`

#### Order

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `userId` | String (UUID) | FK -> User | Ordering customer |
| `status` | Enum (OrderStatus) | Default: `PENDING` | Current order state |
| `totalAmount` | Float | Not null | Total order price in base currency |
| `shippingAddress` | Json | Not null | Structured address object |
| `notes` | String? | Nullable | Customer notes |
| `createdAt` | DateTime | Auto | Order placement timestamp |
| `updatedAt` | DateTime | Auto | Last status change timestamp |

**Relations:** N:1 `User`, 1:N `OrderItem`, 1:1 `Payment`

**OrderStatus Enum:** `PENDING`, `CONFIRMED`, `PRINTING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

#### OrderItem

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `orderId` | String (UUID) | FK -> Order | Parent order |
| `modelId` | String (UUID) | FK -> Model3D | Ordered model |
| `materialId` | String (UUID) | FK -> Material | Selected material |
| `quantity` | Int | Not null, Min: 1 | Number of prints |
| `color` | String | Not null | Selected color from material's palette |
| `scale` | Float | Default: `1.0` | Scale multiplier applied to the model |
| `unitPrice` | Float | Not null | Price per single item at time of order |
| `subtotal` | Float | Not null | `unitPrice * quantity` |
| `notes` | String? | Nullable | Per-item notes |

**Relations:** N:1 `Order`, N:1 `Model3D`, N:1 `Material`

#### Payment

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `orderId` | String (UUID) | FK -> Order, Unique | Associated order (1:1) |
| `amount` | Int | Not null | Amount in smallest currency unit (cents) |
| `currency` | String | Default: `usd` | ISO 4217 currency code |
| `status` | Enum (PaymentStatus) | Default: `PENDING` | Payment state |
| `provider` | String | Not null | Payment provider identifier (e.g., `stripe`) |
| `providerRef` | String? | Nullable | External payment intent/transaction ID |
| `createdAt` | DateTime | Auto | Payment creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relations:** 1:1 `Order`

**PaymentStatus Enum:** `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `REFUNDED`

#### PricingRule

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (UUID) | PK | Unique identifier |
| `name` | String | Not null | Human-readable rule name |
| `type` | Enum (RuleType) | Not null | `MULTIPLIER`, `FLAT_FEE`, `DISCOUNT_PERCENT`, `DISCOUNT_FLAT` |
| `value` | Float | Not null | Numeric value of the rule |
| `condition` | Json? | Nullable | Conditional application logic (e.g., `{ "minQuantity": 10 }`) |
| `priority` | Int | Default: `0` | Execution order (lower = first) |
| `isActive` | Boolean | Default: `true` | Whether the rule is currently applied |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

---

## 5. Authentication Flow

### 5.1 Registration

```
Client                        Server                         Database
  │                             │                               │
  │  POST /api/auth/register    │                               │
  │  { name, email, password }  │                               │
  │ ───────────────────────────►│                               │
  │                             │  Check email uniqueness        │
  │                             │ ─────────────────────────────►│
  │                             │◄─────────────────────────────│
  │                             │                               │
  │                             │  Hash password (bcrypt, 12    │
  │                             │  salt rounds)                 │
  │                             │                               │
  │                             │  Create User record           │
  │                             │ ─────────────────────────────►│
  │                             │◄─────────────────────────────│
  │                             │                               │
  │                             │  Generate JWT access token    │
  │                             │  (15 min expiry)              │
  │                             │                               │
  │                             │  Generate JWT refresh token   │
  │                             │  (7 day expiry)               │
  │                             │                               │
  │                             │  Hash & store refresh token   │
  │                             │ ─────────────────────────────►│
  │                             │                               │
  │  { user, accessToken,       │                               │
  │    refreshToken }           │                               │
  │◄───────────────────────────│                               │
```

### 5.2 Login

```
Client                        Server                         Database
  │                             │                               │
  │  POST /api/auth/login       │                               │
  │  { email, password }        │                               │
  │ ───────────────────────────►│                               │
  │                             │  Find user by email           │
  │                             │ ─────────────────────────────►│
  │                             │◄─────────────────────────────│
  │                             │                               │
  │                             │  bcrypt.compare(password,     │
  │                             │    user.password)             │
  │                             │                               │
  │                             │  If match: generate tokens    │
  │                             │  If no match: 401 error       │
  │                             │                               │
  │  { user, accessToken,       │                               │
  │    refreshToken }           │                               │
  │◄───────────────────────────│                               │
```

### 5.3 JWT Refresh (Token Rotation)

```
Client                        Server                         Database
  │                             │                               │
  │  POST /api/auth/refresh     │                               │
  │  { refreshToken }           │                               │
  │ ───────────────────────────►│                               │
  │                             │  Verify JWT signature &       │
  │                             │  expiry of refresh token      │
  │                             │                               │
  │                             │  Extract userId from token    │
  │                             │  Find user in DB              │
  │                             │ ─────────────────────────────►│
  │                             │◄─────────────────────────────│
  │                             │                               │
  │                             │  Compare hashed token with    │
  │                             │  stored hash (prevents reuse) │
  │                             │                               │
  │                             │  Generate NEW token pair      │
  │                             │  Invalidate old refresh token │
  │                             │  Store new refresh token hash │
  │                             │ ─────────────────────────────►│
  │                             │                               │
  │  { accessToken,             │                               │
  │    refreshToken }           │                               │
  │◄───────────────────────────│                               │
```

### 5.4 Middleware Guards

**auth.guard.ts** — Extracts and verifies the JWT from the `Authorization: Bearer <token>` header. On success, it injects the decoded user payload (`{ userId, role }`) into the Elysia request context, making it available to downstream handlers. On failure, it returns a `401 Unauthorized` response.

**role.guard.ts** — A higher-order middleware factory that accepts one or more allowed roles. It reads the user context set by `auth.guard` and checks if `user.role` is in the allowed set. Returns `403 Forbidden` if the role does not match.

```typescript
// Usage in route definition
app.group("/api/admin", (app) =>
  app
    .use(authGuard)           // Must be authenticated
    .use(roleGuard("ADMIN"))  // Must have ADMIN role
    .get("/dashboard", dashboardHandler)
);
```

### 5.5 Token Configuration

| Token | Payload | Expiry | Storage (Client) |
|---|---|---|---|
| Access Token | `{ userId, role, iat, exp }` | 15 minutes | Memory (Zustand store) |
| Refresh Token | `{ userId, tokenVersion, iat, exp }` | 7 days | httpOnly cookie or secure localStorage |

---

## 6. File Upload Flow

The upload system uses **presigned URLs** to allow clients to upload 3D model files directly to Cloudflare R2, bypassing the application server for the actual file transfer. This reduces server load and leverages R2's global edge network for faster uploads.

### Flow Diagram

```
Client                     API Server                  Cloudflare R2
  │                           │                            │
  │  1. POST /upload/         │                            │
  │     presigned-url         │                            │
  │  { filename, contentType, │                            │
  │    fileSize }             │                            │
  │ ─────────────────────────►│                            │
  │                           │                            │
  │                           │  Validate file type        │
  │                           │  (STL, OBJ, GLTF, GLB)    │
  │                           │  Validate file size        │
  │                           │  (<100MB)                  │
  │                           │                            │
  │                           │  Generate unique object    │
  │                           │  key: uploads/{userId}/    │
  │                           │  {uuid}/{filename}         │
  │                           │                            │
  │                           │  2. Generate presigned     │
  │                           │     PUT URL (5 min expiry) │
  │                           │ ──────────────────────────►│
  │                           │◄──────────────────────────│
  │                           │                            │
  │  { presignedUrl,          │                            │
  │    objectKey,             │                            │
  │    expiresAt }            │                            │
  │◄─────────────────────────│                            │
  │                           │                            │
  │  3. PUT file directly     │                            │
  │     to presigned URL      │                            │
  │ ──────────────────────────────────────────────────────►│
  │                           │                            │
  │  200 OK                   │                            │
  │◄──────────────────────────────────────────────────────│
  │                           │                            │
  │  4. POST /upload/confirm  │                            │
  │  { objectKey }            │                            │
  │ ─────────────────────────►│                            │
  │                           │  5. HEAD object to verify  │
  │                           │     existence & size       │
  │                           │ ──────────────────────────►│
  │                           │◄──────────────────────────│
  │                           │                            │
  │                           │  Record file metadata      │
  │                           │  Generate read URL         │
  │                           │                            │
  │  { fileUrl,               │                            │
  │    fileSize,              │                            │
  │    contentType }          │                            │
  │◄─────────────────────────│                            │
```

### Allowed File Types

| Extension | MIME Type | Description |
|---|---|---|
| `.stl` | `model/stl`, `application/sla` | Stereolithography — most common 3D printing format |
| `.obj` | `model/obj`, `text/plain` | Wavefront OBJ — widely supported polygon mesh |
| `.gltf` | `model/gltf+json` | GL Transmission Format — JSON-based, supports materials/textures |
| `.glb` | `model/gltf-binary` | Binary GLTF — single-file compressed variant |

### Constraints

- Maximum file size: **100 MB**
- Presigned URL expiry: **5 minutes**
- Object key format: `uploads/{userId}/{uuid}/{sanitized-filename}`
- After upload, the server verifies the object via a HEAD request before confirming

---

## 7. Pricing Algorithm

The pricing engine calculates the cost of printing a 3D model based on material usage, print complexity, and configurable business rules.

### Core Formula

```
totalPrice = (materialCost + printTimeCost + complexitySurcharge + setupFee) * ruleMultipliers - discounts
```

### Variable Breakdown

| Variable | Formula | Description |
|---|---|---|
| **Scaled Volume** | `modelVolume * (scale ^ 3)` | The volume of the model after applying the scale factor. Volume scales cubically. |
| **Estimated Weight** | `scaledVolume * material.density` | Weight in grams, used for material cost calculation. |
| **Material Cost** | `estimatedWeight * material.basePricePerGram` | Raw material cost based on weight. |
| **Print Time Cost** | `estimatedPrintTime * printTimeRate` | Cost of machine time. Print time is estimated from volume and layer complexity. |
| **Complexity Surcharge** | `baseCost * complexityFactor` | Additional cost for models with high polygon counts, overhangs, or support structures. |
| **Setup Fee** | Flat fee per job | Covers bed preparation, calibration, and post-processing. |
| **Rule Multipliers** | Product of all active `MULTIPLIER` rules | Applied from pricing rules (e.g., rush order 1.5x, premium finish 1.2x). |
| **Discounts** | Sum of applicable discounts | Percentage or flat discounts from pricing rules (e.g., bulk quantity, loyalty). |

### Pricing Rule Application Order

Rules are sorted by `priority` (ascending) and applied in sequence:

1. **FLAT_FEE** rules are added to the base cost
2. **MULTIPLIER** rules are applied multiplicatively to the running total
3. **DISCOUNT_PERCENT** rules reduce the total by a percentage
4. **DISCOUNT_FLAT** rules subtract a fixed amount from the total

### Example Calculation

```
Input:
  Model volume:       50 cm^3
  Scale:              1.2x
  Material:           PLA (density: 1.24 g/cm^3, base price: $0.05/g)
  Print time rate:    $1.00/hour
  Estimated time:     3.5 hours
  Complexity factor:  0.05 (5%)
  Setup fee:          $2.00
  Active rules:       Rush order (MULTIPLIER: 1.5), Bulk 5+ (DISCOUNT_PERCENT: 10%)
  Quantity:           5

Step 1 — Scaled Volume:
  50 * (1.2 ^ 3) = 50 * 1.728 = 86.4 cm^3

Step 2 — Weight:
  86.4 * 1.24 = 107.14g

Step 3 — Material Cost:
  107.14 * $0.05 = $5.36

Step 4 — Print Time Cost:
  3.5 * $1.00 = $3.50

Step 5 — Complexity Surcharge:
  ($5.36 + $3.50) * 0.05 = $0.44

Step 6 — Subtotal (before rules):
  $5.36 + $3.50 + $0.44 + $2.00 = $11.30

Step 7 — Apply Rush Multiplier:
  $11.30 * 1.5 = $16.95

Step 8 — Apply Bulk Discount (10%):
  $16.95 * 0.90 = $15.26

Step 9 — Unit Price: $15.26
Step 10 — Total (5 units): $15.26 * 5 = $76.30
```

---

## 8. Response Format

All API responses follow a consistent JSON envelope structure to simplify client-side handling.

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Success Response with Pagination Meta

```json
{
  "success": true,
  "data": [ ... ],
  "message": "Models retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 47,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

### Response Builder Utility

```typescript
// utils/response.ts

export const successResponse = <T>(data: T, message: string, meta?: PaginationMeta) => ({
  success: true as const,
  data,
  message,
  ...(meta && { meta }),
});

export const errorResponse = (message: string, error: ErrorDetail) => ({
  success: false as const,
  data: null,
  message,
  error,
});
```

### Response Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | Always | `true` for 2xx responses, `false` for 4xx/5xx |
| `data` | `T \| null` | Always | Response payload; `null` on errors |
| `message` | `string` | Always | Human-readable summary |
| `error` | `object \| undefined` | On failure | Structured error details |
| `error.code` | `string` | On failure | Machine-readable error code |
| `error.details` | `array \| undefined` | On validation errors | Per-field validation errors |
| `meta` | `object \| undefined` | On paginated responses | Pagination metadata |

---

## 9. Error Handling

### Error Types and Status Codes

| Error Code | HTTP Status | Description | Example |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or query params failed validation | Missing required field, invalid email |
| `BAD_REQUEST` | 400 | General malformed request | Invalid JSON, unsupported file type |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication | No token, expired access token |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions | Customer accessing admin routes |
| `NOT_FOUND` | 404 | Resource does not exist | Model ID not in database |
| `CONFLICT` | 409 | Resource state conflict | Email already registered, duplicate slug |
| `UNPROCESSABLE_ENTITY` | 422 | Semantically invalid request | Order with 0 items, invalid status transition |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Exceeded API rate limit |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Database connection failure, unhandled exception |
| `PAYMENT_ERROR` | 402 | Payment processing failed | Card declined, insufficient funds |
| `UPLOAD_ERROR` | 400 | File upload failed | File too large, invalid type, R2 unreachable |

### Custom Error Classes

```typescript
// utils/error-handler.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(details: { field: string; message: string }[]) {
    super(400, "VALIDATION_ERROR", "Validation failed", details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(403, "FORBIDDEN", message);
  }
}
```

### Global Error Handler

The global error handler is registered as Elysia middleware and catches all unhandled exceptions:

```typescript
app.onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return errorResponse(error.message, {
      code: error.code,
      details: error.details,
    });
  }

  // Prisma-specific errors
  if (error.code === "P2002") {
    set.status = 409;
    return errorResponse("Resource already exists", { code: "CONFLICT" });
  }

  // Fallback for unexpected errors
  console.error("Unhandled error:", error);
  set.status = 500;
  return errorResponse("Internal server error", { code: "INTERNAL_ERROR" });
});
```

---

## 10. Frontend Architecture

### 10.1 Routing (App Router)

Next.js 14 App Router provides file-system-based routing with nested layouts:

```
src/app/
├── layout.tsx                # Root layout: HTML shell, providers, global nav
├── page.tsx                  # Home: hero section, featured models, CTA
├── gallery/
│   ├── page.tsx              # Model gallery with grid, filters, search
│   └── loading.tsx           # Gallery skeleton loader
├── models/
│   └── [slug]/
│       ├── page.tsx          # Model detail: 3D viewer, material picker, pricing
│       └── loading.tsx       # Detail page skeleton
├── auth/
│   ├── login/page.tsx        # Login form
│   └── register/page.tsx     # Registration form
├── dashboard/
│   ├── layout.tsx            # Dashboard sidebar layout
│   ├── page.tsx              # Order overview
│   ├── orders/
│   │   └── [id]/page.tsx     # Individual order detail
│   └── settings/page.tsx     # Account settings
├── admin/
│   ├── layout.tsx            # Admin layout with sidebar nav
│   ├── page.tsx              # Dashboard with analytics
│   ├── orders/page.tsx       # Order management table
│   ├── models/page.tsx       # Model CRUD management
│   ├── materials/page.tsx    # Material management
│   ├── users/page.tsx        # User management
│   └── pricing/page.tsx      # Pricing rule management
├── cart/page.tsx              # Shopping cart review
└── checkout/page.tsx          # Checkout with payment
```

### 10.2 State Management

The application uses a dual-layer state management strategy:

**Zustand (Client State)** — Manages UI state that does not originate from the server:

```typescript
// stores/auth.store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);

// stores/cart.store.ts
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
```

**React Query (Server State)** — Manages all data fetched from the API:

```typescript
// hooks/useModels.ts
export const useModels = (params: ModelQueryParams) =>
  useQuery({
    queryKey: ["models", params],
    queryFn: () => api.get("/models", { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useModelBySlug = (slug: string) =>
  useQuery({
    queryKey: ["model", slug],
    queryFn: () => api.get(`/models/${slug}`),
    enabled: !!slug,
  });

// hooks/useOrders.ts
export const useCreateOrder = () =>
  useMutation({
    mutationFn: (data: CreateOrderInput) => api.post("/orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
```

### 10.3 Component Organization

```
components/
├── ui/                        # Design system primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   └── Pagination.tsx
├── three/                     # 3D rendering components
│   ├── ModelViewer.tsx        # Main viewer wrapper
│   ├── ModelCanvas.tsx        # Three.js canvas with controls
│   ├── ModelLoader.tsx        # Format-specific file loaders
│   └── ViewerControls.tsx     # UI overlay (zoom, reset, fullscreen)
├── forms/                     # Form components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ModelUploadForm.tsx
│   └── MaterialForm.tsx
├── layout/                    # Structural components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   └── Breadcrumbs.tsx
├── models/                    # Model-specific components
│   ├── ModelCard.tsx
│   ├── ModelGrid.tsx
│   ├── MaterialPicker.tsx
│   └── PriceEstimator.tsx
├── orders/                    # Order-specific components
│   ├── OrderTable.tsx
│   ├── OrderStatusBadge.tsx
│   └── OrderTimeline.tsx
└── admin/                     # Admin-specific components
    ├── DashboardStats.tsx
    ├── RevenueChart.tsx
    └── UserTable.tsx
```

### 10.4 API Client with Token Refresh

```typescript
// lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken: getStoredRefreshToken() }
        );

        useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
        storeRefreshToken(data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 11. 3D Viewer

### 11.1 Implementation Overview

The 3D viewer renders STL, OBJ, and GLTF/GLB model files in the browser using Three.js with the React Three Fiber declarative wrapper. It provides interactive orbit controls, automatic model centering and scaling, material preview, and responsive canvas sizing.

### 11.2 Architecture

```
ModelViewer (wrapper)
├── Suspense boundary with loading fallback
├── Canvas (R3F)
│   ├── Lighting
│   │   ├── AmbientLight (soft fill, intensity 0.4)
│   │   ├── DirectionalLight (key light, intensity 0.8)
│   │   └── DirectionalLight (fill light, intensity 0.3)
│   ├── ModelLoader
│   │   ├── STLLoader   → for .stl files
│   │   ├── OBJLoader   → for .obj files
│   │   └── GLTFLoader  → for .gltf / .glb files
│   ├── OrbitControls (rotate, zoom, pan)
│   ├── Grid (optional reference plane)
│   └── Environment (optional HDRI for reflections)
└── ViewerControls (HTML overlay)
    ├── Reset camera button
    ├── Zoom in/out buttons
    ├── Toggle wireframe
    └── Fullscreen toggle
```

### 11.3 Format Loading

Each format requires a specific Three.js loader. The component detects the format from the file extension and instantiates the appropriate loader:

```typescript
// components/three/ModelLoader.tsx
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

type SupportedFormat = "stl" | "obj" | "gltf" | "glb";

function getFileFormat(url: string): SupportedFormat {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "glb") return "glb";
  return ext as SupportedFormat;
}

export function ModelLoader({ url, color }: { url: string; color?: string }) {
  const format = getFileFormat(url);
  const meshRef = useRef<THREE.Group>(null);

  // Load based on format
  const geometry = format === "stl" ? useLoader(STLLoader, url) : null;
  const obj = format === "obj" ? useLoader(OBJLoader, url) : null;
  const gltf = format === "gltf" || format === "glb"
    ? useLoader(GLTFLoader, url)
    : null;

  // Auto-center and auto-scale after loading
  useEffect(() => {
    if (!meshRef.current) return;

    const box = new THREE.Box3().setFromObject(meshRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model at origin
    meshRef.current.position.sub(center);

    // Scale to fit within a normalized bounding sphere
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2; // Fit within a 2-unit bounding box
    if (maxDim > 0) {
      const scaleFactor = targetSize / maxDim;
      meshRef.current.scale.setScalar(scaleFactor);
    }
  }, [geometry, obj, gltf]);

  if (geometry) {
    // STL returns a BufferGeometry
    return (
      <group ref={meshRef}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color={color || "#b0b0b0"}
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
      </group>
    );
  }

  if (obj) {
    return (
      <group ref={meshRef}>
        <primitive object={obj} />
      </group>
    );
  }

  if (gltf) {
    return (
      <group ref={meshRef}>
        <primitive object={gltf.scene} />
      </group>
    );
  }

  return null;
}
```

### 11.4 Auto-Center and Auto-Scale Algorithm

When a model is loaded, its geometry can have arbitrary position, rotation, and scale. The viewer normalizes it in two steps:

1. **Centering:** Compute the axis-aligned bounding box (AABB) of the loaded mesh, find its center point, and translate the model so the center is at the world origin `(0, 0, 0)`.

2. **Scaling:** Measure the maximum dimension (width, height, or depth) of the bounding box and compute a uniform scale factor that fits the model within a target bounding size (default 2 world units). This ensures models of all sizes appear at a consistent visual scale in the viewer.

```
Bounding Box:  min(-50, -10, -30) to max(50, 10, 30)
Center:        (0, 0, 0)        → translate by (0, 0, 0) [already centered]
Max Dimension: 100               → scale factor = 2 / 100 = 0.02
```

### 11.5 Main Viewer Component

```typescript
// components/three/ModelViewer.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { Suspense, useState } from "react";
import { ModelLoader } from "./ModelLoader";
import { ViewerControls } from "./ViewerControls";

interface ModelViewerProps {
  fileUrl: string;
  color?: string;
  className?: string;
}

export function ModelViewer({ fileUrl, color, className }: ModelViewerProps) {
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className={`relative w-full aspect-square ${className}`}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />

        {/* Model */}
        <Suspense fallback={null}>
          <ModelLoader url={fileUrl} color={color} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={20}
          enablePan
          enableZoom
          autoRotate={false}
        />

        {/* Reference grid */}
        <Grid
          infiniteGrid
          fadeDistance={10}
          fadeStrength={2}
          cellSize={0.5}
          sectionSize={2}
        />
      </Canvas>

      {/* HTML overlay controls */}
      <ViewerControls
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe(!wireframe)}
      />
    </div>
  );
}
```

### 11.6 Performance Considerations

| Concern | Mitigation |
|---|---|
| Large file sizes (50MB+) | Stream loading with progress indicator; client-side file size check before upload |
| High polygon counts | Automatic LOD (Level of Detail) for distant views; optional decimation warning in admin |
| Memory leaks | Dispose geometries, materials, and textures on component unmount via R3F lifecycle |
| Mobile performance | Reduced pixel ratio (`dpr={[1, 1.5]}`), simplified lighting on mobile, touch-friendly controls |
| Initial load time | `React.Suspense` with skeleton placeholder, lazy-load the Three.js bundle via `next/dynamic` |

```typescript
// Lazy load the viewer to avoid Three.js in the initial bundle
import dynamic from "next/dynamic";

const ModelViewer = dynamic(
  () => import("@/components/three/ModelViewer").then((m) => m.ModelViewer),
  {
    ssr: false, // Three.js requires browser APIs
    loading: () => <ModelViewerSkeleton />,
  }
);
```

---

## Appendix: Environment Variables

| Variable | Context | Description |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Backend | Secret key for signing refresh tokens |
| `R2_ACCOUNT_ID` | Backend | Cloudflare account identifier |
| `R2_ACCESS_KEY_ID` | Backend | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Backend | R2 API secret key |
| `R2_BUCKET_NAME` | Backend | R2 storage bucket name |
| `R2_PUBLIC_URL` | Backend | Public URL prefix for R2 objects |
| `PAYMENT_SECRET_KEY` | Backend | Payment provider secret key |
| `PAYMENT_WEBHOOK_SECRET` | Backend | Webhook signature verification key |
| `EMAIL_API_KEY` | Backend | Email service provider API key |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | Frontend | Frontend application URL |
