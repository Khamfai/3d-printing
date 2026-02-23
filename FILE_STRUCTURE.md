# 3D Printing Service - Complete File Structure

Full-stack 3D printing order management platform.
Backend: Bun + Elysia + Prisma + PostgreSQL.
Frontend: Next.js 14 + Tailwind CSS + Three.js + Zustand.

```
3d-printing/
|
|-- package.json                        # Backend package manifest. Dependencies: elysia, @elysiajs/cors,
|                                       #   @elysiajs/jwt, @elysiajs/bearer, @elysiajs/swagger,
|                                       #   @elysiajs/static, @prisma/client, @aws-sdk/client-s3,
|                                       #   @aws-sdk/s3-request-presigner, stripe, resend, zod.
|                                       #   Scripts: dev (watch mode), start, db:generate, db:push,
|                                       #   db:migrate, db:seed, db:studio.
|
|-- tsconfig.json                       # Backend TypeScript configuration. Target ES2022, bundler
|                                       #   module resolution, bun-types, path aliases @/* and @prisma/*.
|                                       #   Outputs to dist/, includes src/ and prisma/.
|
|-- .env.example                        # Environment variable template. Contains placeholders for
|                                       #   DATABASE_URL (PostgreSQL), JWT_SECRET, JWT_REFRESH_SECRET,
|                                       #   Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
|                                       #   R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL),
|                                       #   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY,
|                                       #   EMAIL_FROM, PORT, NODE_ENV, FRONTEND_URL, API_URL.
|
|-- .gitignore                          # Git ignore rules. Excludes node_modules, .env files, .next/,
|                                       #   build/dist output, Prisma DB files, IDE configs, debug
|                                       #   artifacts, lock files, and OS metadata.
|
|-- 3_d_printing_service_requirements.md  # Project requirements document defining the scope, features,
|                                       #   and technical specifications for the 3D printing platform.
|
|-- README.md                           # Project README with basic introduction.
|
|-- QUICKSTART.md                       # Quick-start guide for setting up and running the project.
|
|-- bun.lock                            # Bun lockfile pinning exact backend dependency versions.
|
|-- prisma/
|   |-- schema.prisma                   # Prisma schema defining the PostgreSQL data model. Enums:
|   |                                   #   Role (CUSTOMER, ADMIN), OrderStatus (PENDING through
|   |                                   #   CANCELLED), PaymentStatus, ModelFormat (STL, OBJ, GLTF,
|   |                                   #   GLB, THREE_MF), PrintQuality (DRAFT, STANDARD, HIGH).
|   |                                   #   Models: User (auth, profile, relations to models/orders),
|   |                                   #   Model3D (file metadata, dimensions, volume, slug, sample/
|   |                                   #   featured flags), Material (density, cost, JSON colors/
|   |                                   #   properties), PricingRule (machine cost, markup, minimum),
|   |                                   #   Order (status, total, shipping address, items, payments),
|   |                                   #   OrderItem (model, material, color, quality, infill, qty,
|   |                                   #   pricing), Payment (Stripe intent ID, amount, status).
|   |
|   |-- seed.ts                         # Database seed script run with `bun run prisma/seed.ts`.
|                                       #   Creates: admin user (admin@printing3d.com / admin123456),
|                                       #   test customer (customer@example.com / customer123456),
|                                       #   5 materials (PLA, ABS, PETG, TPU, Nylon) with colors and
|                                       #   properties, 8 sample 3D models (Benchy Boat, Gear Set,
|                                       #   Phone Stand, Dragon Figurine, Spiral Vase, Chess Set,
|                                       #   Raspberry Pi Case, Low Poly Fox), and a default pricing
|                                       #   rule ($5/hr machine cost, 30% markup, $5 minimum).
|
|-- src/                                # Backend source code (Bun + Elysia REST API)
|   |
|   |-- index.ts                        # Application entry point. Creates the Elysia server and
|   |                                   #   composes CORS (allowing frontend origin), Swagger docs
|   |                                   #   at /swagger with tagged endpoints, global error handler,
|   |                                   #   root info route, /health endpoint, and all API routes.
|   |                                   #   Listens on configured PORT. Exports App type.
|   |
|   |-- config/
|   |   |-- env.ts                      # Environment validation using Zod. Defines envSchema with
|   |                                   #   required fields (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET)
|   |                                   #   and optional service keys (R2, Stripe, Resend) with defaults.
|   |                                   #   In development, falls back to safe defaults for optional
|   |                                   #   services. Exports validated `env` singleton.
|   |
|   |-- db/
|   |   |-- prisma.ts                   # Prisma client singleton. Stores the client on globalThis to
|   |                                   #   prevent multiple instances during hot reload in development.
|   |                                   #   Enables query/error/warn logging in development mode.
|   |
|   |-- types/
|   |   |-- index.ts                    # Shared Zod validation schemas and TypeScript types for the
|   |                                   #   entire backend. Schemas: registerSchema, loginSchema,
|   |                                   #   createModelSchema, createMaterialSchema, updateMaterialSchema,
|   |                                   #   createOrderItemSchema, createOrderSchema, updateOrderStatusSchema,
|   |                                   #   priceEstimateSchema, createPricingRuleSchema, presignedUrlSchema,
|   |                                   #   confirmUploadSchema, paginationSchema. Interfaces: JWTPayload,
|   |                                   #   ApiResponse<T> (with optional pagination meta).
|   |
|   |-- middleware/
|   |   |-- auth.guard.ts               # JWT authentication middleware. Exports jwtPlugin (7-day access
|   |   |                               #   token), jwtRefreshPlugin (30-day refresh token), authGuard
|   |   |                               #   (requires valid Bearer token, derives user context with id/
|   |   |                               #   email/role), and optionalAuth (sets user to null if no token
|   |   |                               #   instead of throwing).
|   |   |
|   |   |-- role.guard.ts              # Role-based access control middleware. Exports requireRole()
|   |   |                               #   factory that creates Elysia derive plugins checking user
|   |   |                               #   role against allowed roles. Pre-built exports: adminOnly,
|   |   |                               #   customerOnly, anyAuthenticated.
|   |   |
|   |   |-- validation.ts              # Generic Zod validation helper. The validate() function takes
|   |                                   #   a Zod schema and unknown data, returns parsed data on success
|   |                                   #   or throws a ValidationError with formatted field errors.
|   |
|   |-- utils/
|   |   |-- response.ts                # Standardized API response formatters. success() wraps data in
|   |   |                               #   { success: true, data, message }. successPaginated() adds
|   |   |                               #   meta with page/limit/total/totalPages. error() returns
|   |   |                               #   { success: false, message, error }.
|   |   |
|   |   |-- error-handler.ts           # Custom error classes and global Elysia error hook. Classes:
|   |   |                               #   AppError (base, with statusCode), NotFoundError (404),
|   |   |                               #   UnauthorizedError (401), ForbiddenError (403),
|   |   |                               #   ValidationError (422), ConflictError (409). The errorHandler
|   |   |                               #   plugin catches AppError instances and Elysia built-in errors
|   |   |                               #   (VALIDATION, NOT_FOUND, PARSE), formats them consistently,
|   |   |                               #   and hides internal details in production.
|   |   |
|   |   |-- pricing.ts                 # Price calculation formula. Takes volume, material density/cost,
|   |                                   #   infill percentage, print quality, machine cost, markup, and
|   |                                   #   quantity. Computes effective volume (10% shell + infill),
|   |                                   #   material weight and cost, estimated print hours based on
|   |                                   #   layer height (0.3/0.2/0.1mm) and speed (60/45/30mm/s),
|   |                                   #   machine time cost, applies markup percentage, enforces
|   |                                   #   minimum price, and returns a PricingResult breakdown.
|   |
|   |-- services/
|   |   |-- auth.service.ts             # Authentication business logic. register(): checks for existing
|   |   |                               #   email, hashes password with bcrypt (cost 12), creates user
|   |   |                               #   with CUSTOMER role. login(): verifies email/password using
|   |   |                               #   Bun.password.verify. getProfile(): fetches user by ID
|   |   |                               #   excluding password. Exported as singleton.
|   |   |
|   |   |-- user.service.ts            # User management service (admin use). getAll(): paginated user
|   |   |                               #   list with search by name/email, includes order count.
|   |   |                               #   getById(): single user with order and model counts.
|   |   |                               #   updateRole(): changes user role between CUSTOMER and ADMIN.
|   |   |
|   |   |-- model.service.ts           # 3D model CRUD service. getAll(): paginated list with search,
|   |   |                               #   category, sample/featured filters. getBySlug(): lookup by
|   |   |                               #   URL-safe slug. create(): auto-generates slug from name with
|   |   |                               #   random suffix. getFeatured(): returns up to 8 featured sample
|   |   |                               #   models. getByUser(): paginated models owned by a user.
|   |   |                               #   update() and delete() for admin management.
|   |   |
|   |   |-- material.service.ts        # Material CRUD service. getActive(): returns all active materials
|   |   |                               #   sorted by name (public). getAll(): paginated list with search
|   |   |                               #   (admin). create/update/delete with JSON serialization for
|   |   |                               #   colors and properties fields.
|   |   |
|   |   |-- order.service.ts           # Order management service. create(): calculates prices for each
|   |   |                               #   item via pricingService, sums total, creates order with items
|   |   |                               #   in a single Prisma create. getAll/getByUser(): paginated
|   |   |                               #   lists with status filter, includes user/items/materials.
|   |   |                               #   updateStatus(): enforces valid state transitions (e.g.,
|   |   |                               #   PENDING->PAID, PAID->PRINTING, etc.) and admin-only access.
|   |   |                               #   getStats(): aggregates total orders, pending count, total
|   |   |                               #   revenue, and 10 most recent orders for the admin dashboard.
|   |   |
|   |   |-- pricing.service.ts         # Pricing estimation service. estimate(): looks up material and
|   |   |                               #   model volume, fetches the active pricing rule, delegates to
|   |   |                               #   calculatePrice() utility. getRules/createRule/updateRule/
|   |   |                               #   deleteRule: CRUD for pricing rules (admin).
|   |   |
|   |   |-- payment.service.ts         # Stripe payment integration. createPaymentIntent(): validates
|   |   |                               #   order ownership and PENDING status, creates a Stripe
|   |   |                               #   PaymentIntent in cents, saves a Payment record. handleWebhook():
|   |   |                               #   verifies Stripe signature, handles payment_intent.succeeded
|   |   |                               #   (updates payment to SUCCEEDED, order to PAID in a transaction)
|   |   |                               #   and payment_intent.payment_failed (marks payment FAILED).
|   |   |                               #   Gracefully disabled when STRIPE_SECRET_KEY is not configured.
|   |   |
|   |   |-- storage.service.ts         # Cloudflare R2 object storage via AWS S3 SDK. getUploadUrl():
|   |   |                               #   generates a presigned PUT URL (1-hour expiry) for direct
|   |   |                               #   client uploads. getDownloadUrl(): generates a presigned GET
|   |   |                               #   URL. deleteFile(): removes an object. generateKey(): creates
|   |   |                               #   unique storage keys with timestamp and random suffix. Falls
|   |   |                               #   back to mock URLs when R2 credentials are not configured.
|   |   |
|   |   |-- email.service.ts           # Transactional email via Resend. sendOrderConfirmation(): sends
|   |                                   #   HTML email with order ID, item count, and total amount.
|   |                                   #   sendStatusUpdate(): sends status change notification with
|   |                                   #   human-readable messages per status. Falls back to console
|   |                                   #   logging when RESEND_API_KEY is not configured.
|   |
|   |-- routes/
|       |-- index.ts                    # Route composition. Creates an Elysia group under /api prefix
|       |                               #   and registers all route modules: auth, model, material,
|       |                               #   order, payment, pricing, upload, admin.
|       |
|       |-- auth.routes.ts             # Authentication endpoints under /api/auth. POST /register
|       |                               #   (create account, return JWT), POST /login (authenticate,
|       |                               #   return access + refresh tokens), POST /refresh (exchange
|       |                               #   refresh token for new access token), GET /me (authenticated
|       |                               #   user profile).
|       |
|       |-- model.routes.ts            # 3D model endpoints under /api/models. Public: GET / (paginated
|       |                               #   list with search/category/sample filters), GET /featured
|       |                               #   (homepage models), GET /:slug (detail with signed file URLs).
|       |                               #   Authenticated: GET /user/my-models, POST / (create model).
|       |                               #   Admin: PUT /:id, DELETE /:id.
|       |
|       |-- material.routes.ts         # Material endpoints under /api/materials. Public: GET / (active
|       |                               #   materials). Admin: GET /all (paginated), GET /:id, POST /
|       |                               #   (create), PUT /:id (update), DELETE /:id.
|       |
|       |-- order.routes.ts            # Order endpoints under /api/orders. Authenticated: POST /
|       |                               #   (create order, sends confirmation email), GET /my-orders
|       |                               #   (paginated), GET /:id (detail with ownership check). Admin:
|       |                               #   GET / (all orders with status filter), PATCH /:id/status
|       |                               #   (update status, sends notification email).
|       |
|       |-- payment.routes.ts          # Payment endpoints under /api/payments. POST /webhook (Stripe
|       |                               #   webhook handler, no auth required). Authenticated: POST
|       |                               #   /create-intent (create Stripe PaymentIntent for an order).
|       |
|       |-- pricing.routes.ts          # Pricing endpoints under /api/pricing. Public: POST /estimate
|       |                               #   (calculate price for a configuration). Admin: GET /rules,
|       |                               #   POST /rules, PUT /rules/:id, DELETE /rules/:id.
|       |
|       |-- upload.routes.ts           # File upload endpoints under /api/upload. Authenticated: POST
|       |                               #   /presigned-url (validates file extension and size, generates
|       |                               #   S3 presigned URL, creates pending model record), POST
|       |                               #   /confirm (updates model with parsed dimensions/volume after
|       |                               #   client-side 3D analysis).
|       |
|       |-- admin.routes.ts            # Admin endpoints under /api/admin. All require ADMIN role.
|                                       #   GET /dashboard (order stats: total, pending, revenue, recent
|                                       #   orders). GET /users (paginated user list). GET /users/:id
|                                       #   (user detail). PATCH /users/:id/role (change user role).
|
|-- frontend/                           # Next.js 14 frontend application
|   |
|   |-- package.json                    # Frontend package manifest. Dependencies: next 14, react 18,
|   |                                   #   three.js, @react-three/fiber, @react-three/drei, zustand,
|   |                                   #   @tanstack/react-query, @stripe/stripe-js, @stripe/react-stripe-js,
|   |                                   #   react-hook-form, @hookform/resolvers, zod, clsx, tailwind-merge,
|   |                                   #   lucide-react, react-dropzone, next-auth. Dev: typescript,
|   |                                   #   tailwindcss, postcss, autoprefixer, eslint.
|   |                                   #   Scripts: dev (port 3001), build, start, lint.
|   |
|   |-- tsconfig.json                   # Frontend TypeScript configuration. Target ES2017, Next.js
|   |                                   #   plugin, bundler module resolution, strict mode, path alias
|   |                                   #   @/* -> ./src/*. Incremental compilation enabled.
|   |
|   |-- next.config.js                  # Next.js configuration. Allows remote images from *.r2.dev and
|   |                                   #   *.r2.cloudflarestorage.com domains. Exposes NEXT_PUBLIC_API_URL
|   |                                   #   environment variable with localhost:3000 default.
|   |
|   |-- tailwind.config.ts             # Tailwind CSS configuration. Scans src/app and src/components
|   |                                   #   for class usage. Extends theme with: brand color palette
|   |                                   #   (blue shades 50-950), status colors (pending/paid/printing/
|   |                                   #   finished/shipped/completed/cancelled), Inter + JetBrains Mono
|   |                                   #   fonts, custom animations (shimmer, slide-in, fade-in).
|   |
|   |-- postcss.config.js              # PostCSS configuration. Enables tailwindcss and autoprefixer
|   |                                   #   plugins for CSS processing.
|   |
|   |-- .env.example                    # Frontend environment template. Variables: NEXT_PUBLIC_API_URL,
|   |                                   #   NEXT_PUBLIC_STRIPE_PUBLIC_KEY, NEXTAUTH_URL, NEXTAUTH_SECRET.
|   |
|   |-- public/
|   |   |-- images/                     # Static image assets directory (currently empty, placeholder
|   |                                   #   for model thumbnails and site imagery).
|   |
|   |-- src/
|       |
|       |-- app/                        # Next.js App Router pages and layouts
|       |   |
|       |   |-- globals.css             # Global stylesheet. Imports Tailwind base/components/utilities
|       |   |                           #   layers. Sets smooth scrolling, font antialiasing, white
|       |   |                           #   background, brand-colored focus-visible outlines, and a
|       |   |                           #   .container-page utility class (max-w-7xl, responsive padding).
|       |   |
|       |   |-- layout.tsx             # Root layout. Loads Inter font from Google Fonts. Configures
|       |   |                           #   metadata (title template, description, OpenGraph) from site
|       |   |                           #   config. Renders skip-to-content link, Navbar, main content
|       |   |                           #   area, Footer, and CartDrawer, all wrapped in Providers
|       |   |                           #   (React Query).
|       |   |
|       |   |-- page.tsx               # Homepage (server component). Fetches featured models from the
|       |   |                           #   API with 1-hour ISR revalidation. Renders HeroSection,
|       |   |                           #   FeaturedModels grid (if models exist), HowItWorks steps,
|       |   |                           #   and a CTA section.
|       |   |
|       |   |-- (auth)/
|       |   |   |-- login/
|       |   |   |   |-- page.tsx        # Login page. Renders a centered card with "Welcome Back"
|       |   |   |                       #   heading and the LoginForm component. Sets page title
|       |   |   |                       #   metadata to "Sign In".
|       |   |   |
|       |   |   |-- register/
|       |   |       |-- page.tsx        # Registration page. Renders a centered card with "Create
|       |   |                           #   Account" heading and the RegisterForm component. Sets page
|       |   |                           #   title metadata to "Create Account".
|       |   |
|       |   |-- gallery/
|       |   |   |-- page.tsx            # Model gallery page (client component). Fetches sample models
|       |   |   |                       #   with debounced search, category filter. Displays a responsive
|       |   |   |                       #   grid of ModelCard components with loading skeletons and empty
|       |   |   |                       #   state. Dynamically extracts categories from loaded models.
|       |   |   |
|       |   |   |-- [slug]/
|       |   |       |-- page.tsx        # Model detail page (client component). Fetches model by slug,
|       |   |                           #   displays an interactive Three.js 3D viewer (lazy-loaded) in
|       |   |                           #   a 2/3 column, and an info panel with name, description,
|       |   |                           #   format, category, dimensions, and volume. "Print This Model"
|       |   |                           #   button stores the model in config-store and navigates to
|       |   |                           #   /configure. Shows loading skeleton and 404 states.
|       |   |
|       |   |-- upload/
|       |   |   |-- page.tsx            # File upload page (client component). Renders a drag-and-drop
|       |   |                           #   FileUpload zone. On file selection: creates a local blob URL
|       |   |                           #   for 3D preview, requests a presigned upload URL from the API,
|       |   |                           #   uploads the file to R2 with progress tracking, and displays
|       |   |                           #   the Three.js viewer. On viewer load, confirms upload with
|       |   |                           #   parsed dimensions. Shows auth warning for unauthenticated
|       |   |                           #   users. "Continue to Configure" button proceeds to /configure.
|       |   |
|       |   |-- configure/
|       |   |   |-- page.tsx            # Print configuration page (client component). Two-column layout:
|       |   |                           #   left side has MaterialSelector cards, ColorPicker swatches,
|       |   |                           #   quality dropdown, infill slider (5-100%), and quantity stepper.
|       |   |                           #   Right side shows PriceEstimator with real-time pricing via
|       |   |                           #   the usePricing hook (debounced API calls). "Add to Cart"
|       |   |                           #   button pushes the configured item to cart-store and navigates
|       |   |                           #   to /cart. Reads selected model from config-store.
|       |   |
|       |   |-- cart/
|       |   |   |-- page.tsx            # Shopping cart page (client component). Two-column layout: left
|       |   |                           #   shows CartItem components with quantity controls and remove
|       |   |                           #   buttons. Right shows order summary with per-item totals and
|       |   |                           #   grand total. "Proceed to Checkout" link. Displays EmptyState
|       |   |                           #   with gallery link when cart is empty.
|       |   |
|       |   |-- checkout/
|       |   |   |-- page.tsx            # Checkout page (client component). Split layout: left side has
|       |   |   |                       #   a shipping address form (street, city, state, postal code,
|       |   |   |                       #   country) and optional notes. Right side shows order summary
|       |   |   |                       #   with item breakdown and total. Submits order via ordersAPI,
|       |   |   |                       #   clears cart on success, redirects to success page. Redirects
|       |   |   |                       #   unauthenticated users to /login.
|       |   |   |
|       |   |   |-- success/
|       |   |       |-- page.tsx        # Order success page (client component). Shows a green checkmark
|       |   |                           #   confirmation card with order ID (from query params), "View
|       |   |                           #   Order" link to dashboard detail, and "Continue Browsing"
|       |   |                           #   link to gallery.
|       |   |
|       |   |-- dashboard/
|       |   |   |-- page.tsx            # Customer dashboard (client component). Greets user by name.
|       |   |   |                       #   Three action cards linking to upload, gallery, and orders.
|       |   |   |                       #   Lists the 5 most recent orders as OrderCard components with
|       |   |   |                       #   loading skeletons and empty state.
|       |   |   |
|       |   |   |-- orders/
|       |   |       |-- page.tsx        # Customer order list (client component). Paginated list of
|       |   |       |                   #   the user's orders displayed as OrderCard components. Uses
|       |   |       |                   #   Pagination component for navigation. Shows loading skeletons
|       |   |       |                   #   and empty state.
|       |   |       |
|       |   |       |-- [id]/
|       |   |           |-- page.tsx    # Customer order detail (client component). Shows order ID and
|       |   |                           #   date, OrderStatusTracker stepper, item list with color
|       |   |                           #   swatches and print specs (material, quality, infill, qty),
|       |   |                           #   status badge, and total amount. Handles loading and 404.
|       |   |
|       |   |-- admin/
|       |       |-- layout.tsx          # Admin layout. Renders AdminSidebar (fixed left, 256px) beside
|       |       |                       #   a scrollable content area with padding. Applied to all
|       |       |                       #   /admin/* pages.
|       |       |
|       |       |-- page.tsx            # Admin dashboard (client component). Fetches dashboard stats
|       |       |                       #   from /api/admin/dashboard. Displays three StatsCard
|       |       |                       #   components (total orders, pending orders, total revenue)
|       |       |                       #   and a list of recent orders as OrderCard (admin variant
|       |       |                       #   showing customer name/email).
|       |       |
|       |       |-- orders/
|       |       |   |-- page.tsx        # Admin order management (client component). Paginated order
|       |       |   |                   #   list with a status filter dropdown (All/Pending/Paid/
|       |       |   |                   #   Printing/Finished/Shipped/Completed/Cancelled). Orders
|       |       |   |                   #   displayed as OrderCard in admin mode.
|       |       |   |
|       |       |   |-- [id]/
|       |       |       |-- page.tsx    # Admin order detail (client component). Shows order info with
|       |       |                       #   customer details, OrderStatusTracker, a status transition
|       |       |                       #   dropdown with valid next states (enforcing the state machine),
|       |       |                       #   "Update Status" button, item list with specs, and total.
|       |       |
|       |       |-- materials/
|       |       |   |-- page.tsx        # Admin materials management (client component). Lists all
|       |       |                       #   materials as cards showing name, active/inactive badge,
|       |       |                       #   density, cost per gram, description, and color swatches.
|       |       |                       #   "Add Material" button and edit/delete actions. Modal form
|       |       |                       #   for creating and editing materials (name, description,
|       |       |                       #   density, cost per gram).
|       |       |
|       |       |-- models/
|       |       |   |-- page.tsx        # Admin model management (client component). Paginated table
|       |       |                       #   listing all 3D models with columns: name, format, category,
|       |       |                       #   type (Sample/Upload badge), date, and delete action.
|       |       |
|       |       |-- pricing/
|       |           |-- page.tsx        # Admin pricing rules management (client component). Lists
|       |                               #   pricing rules as cards showing name, active/inactive badge,
|       |                               #   machine cost/hr, markup percentage, and minimum price. "Add
|       |                               #   Rule" button and edit/delete actions. Modal form for
|       |                               #   creating and editing rules.
|       |
|       |-- components/
|       |   |
|       |   |-- ui/                     # Reusable UI primitive components
|       |   |   |-- Button.tsx          # Multi-variant button. Props: variant (primary/secondary/
|       |   |   |                       #   outline/ghost/danger), size (sm/md/lg), isLoading (shows
|       |   |   |                       #   spinner). Uses forwardRef, cn() for class merging. Disables
|       |   |   |                       #   when loading. Tailwind focus ring and transition styles.
|       |   |   |
|       |   |   |-- Input.tsx           # Labeled text input with error state. Props: label (auto-
|       |   |   |                       #   generates htmlFor ID), error (shows red message with
|       |   |   |                       #   role="alert"). Uses forwardRef, aria-invalid, aria-describedby
|       |   |   |                       #   for accessibility. Brand-colored focus ring.
|       |   |   |
|       |   |   |-- Card.tsx            # Card container with optional hover shadow. Exports Card
|       |   |   |                       #   (rounded-xl, border, white bg, shadow-sm), CardHeader
|       |   |   |                       #   (bordered bottom padding), and CardContent (padded content
|       |   |   |                       #   area). All accept className overrides via cn().
|       |   |   |
|       |   |   |-- Badge.tsx           # Order status badge. Maps status strings to color-coded pill
|       |   |   |                       #   labels using ORDER_STATUS_CONFIG from utils (yellow for
|       |   |   |                       #   pending, blue for paid, purple for printing, etc.).
|       |   |   |
|       |   |   |-- Skeleton.tsx        # Loading placeholder with pulse animation. Renders a gray
|       |   |   |                       #   rounded div with animate-pulse and aria-hidden="true".
|       |   |   |                       #   Accepts className for sizing.
|       |   |   |
|       |   |   |-- Modal.tsx           # Dialog overlay component. Manages body scroll lock, Escape
|       |   |   |                       #   key handler, and click-outside-to-close. Renders backdrop
|       |   |   |                       #   overlay with centered white panel. Optional title with close
|       |   |   |                       #   button. Uses role="dialog", aria-modal, fade-in animation.
|       |   |   |
|       |   |   |-- Select.tsx          # Labeled dropdown select. Props: label, error, options (array
|       |   |   |                       #   of {value, label}). Uses forwardRef. Auto-generates ID from
|       |   |   |                       #   label. Brand-colored focus ring. Same styling pattern as
|       |   |   |                       #   Input component.
|       |   |   |
|       |   |   |-- Pagination.tsx      # Page navigation control. Shows "Previous"/"Next" buttons with
|       |   |   |                       #   "Page X of Y" text. Disables buttons at boundaries. Hidden
|       |   |   |                       #   when totalPages <= 1. Uses aria-label="Pagination".
|       |   |   |
|       |   |   |-- EmptyState.tsx      # Empty content placeholder. Displays optional icon, title,
|       |   |                           #   description, and action slot (e.g., a button). Centered
|       |   |                           #   with vertical padding.
|       |   |
|       |   |-- layout/                 # Layout structural components
|       |   |   |-- Navbar.tsx          # Site navigation bar (client component). Sticky top, blurred
|       |   |   |                       #   white background. Logo linking to home. Desktop nav links
|       |   |   |                       #   from mainNav config (conditional auth-required items). Cart
|       |   |   |                       #   icon button with item count badge, toggles CartDrawer.
|       |   |   |                       #   Auth section: shows user name + logout when authenticated,
|       |   |   |                       #   Login/Sign Up buttons otherwise. Collapsible mobile menu.
|       |   |   |
|       |   |   |-- Footer.tsx          # Site footer. Four-column grid: brand description, Services
|       |   |   |                       #   links (Gallery, Upload, Materials), Account links (Login,
|       |   |   |                       #   Sign Up, Dashboard), Support placeholders (Contact, FAQ,
|       |   |   |                       #   Shipping). Copyright with dynamic year.
|       |   |   |
|       |   |   |-- AdminSidebar.tsx    # Admin panel sidebar (client component). Fixed-width 256px
|       |   |   |                       #   column with "Admin Panel" heading. Renders adminNav config
|       |   |   |                       #   items as links with SVG icons. Active link highlighted with
|       |   |   |                       #   brand-50 background. Hidden on screens smaller than lg.
|       |   |   |
|       |   |   |-- PageHeader.tsx      # Reusable page heading. Displays h1 title, optional description
|       |   |                           #   subtitle, and optional action slot (e.g., button) aligned
|       |   |                           #   right on larger screens. Adds bottom margin.
|       |   |
|       |   |-- three/
|       |   |   |-- ThreeViewer.tsx     # Interactive 3D model viewer (client component). Initializes a
|       |   |                           #   Three.js scene with perspective camera, OrbitControls (auto-
|       |   |                           #   rotate, damping), ambient + directional lighting, and a grid
|       |   |                           #   helper. Loads STL (STLLoader), OBJ (OBJLoader), and GLTF/GLB
|       |   |                           #   (GLTFLoader) files. Auto-centers and auto-scales models,
|       |   |                           #   positions camera based on bounding box. Reports parsed
|       |   |                           #   dimensions via onLoad callback. Shows loading spinner, error
|       |   |                           #   state, dimension overlay, and controls hint. Responds to
|       |   |                           #   container resize via ResizeObserver. Updates material color
|       |   |                           #   dynamically.
|       |   |
|       |   |-- upload/
|       |   |   |-- FileUpload.tsx      # Drag-and-drop file upload zone (client component). Uses
|       |   |                           #   react-dropzone. Validates file extension against allowed 3D
|       |   |                           #   formats (.stl, .obj, .gltf, .glb, .3mf) and 100MB size limit.
|       |   |                           #   Shows drag-active state, selected file info with size, and an
|       |   |                           #   upload progress bar during upload.
|       |   |
|       |   |-- pricing/
|       |   |   |-- PriceEstimator.tsx  # Price breakdown display (client component). Shows material cost,
|       |   |   |                       #   print time cost, estimated hours, price per unit, and total
|       |   |   |                       #   in a formatted card. Handles loading (skeleton), error (red
|       |   |   |                       #   banner), and empty (prompt to select material) states.
|       |   |   |
|       |   |   |-- MaterialSelector.tsx # Material selection grid (client component). Renders materials
|       |   |   |                       #   as clickable cards showing name, description, and cost per
|       |   |   |                       #   gram. Selected card highlighted with brand border and ring.
|       |   |   |
|       |   |   |-- ColorPicker.tsx     # Filament color selector (client component). Renders available
|       |   |                           #   colors as circular swatches with the actual hex color as
|       |   |                           #   background. Selected swatch shows checkmark and scale effect.
|       |   |                           #   Displays selected color name below.
|       |   |
|       |   |-- order/
|       |   |   |-- OrderStatusTracker.tsx # Order progress stepper (client component). Renders 6 steps
|       |   |   |                       #   (Pending -> Paid -> Printing -> Finished -> Shipped ->
|       |   |   |                       #   Completed) as connected circles with labels. Completed steps
|       |   |   |                       #   show checkmarks, current step is highlighted in brand color.
|       |   |   |                       #   Shows a red "Order Cancelled" banner for cancelled orders.
|       |   |   |
|       |   |   |-- OrderCard.tsx       # Order summary card. Links to order detail (customer or admin
|       |   |                           #   URL based on isAdmin prop). Shows order ID (truncated),
|       |   |                           #   status Badge, item count, date, and total amount. Admin
|       |   |                           #   variant additionally shows customer name and email.
|       |   |
|       |   |-- cart/
|       |   |   |-- CartItem.tsx        # Individual cart line item (client component). Shows color
|       |   |   |                       #   swatch, model name, material/quality/infill specs, quantity
|       |   |   |                       #   stepper (+/- buttons), remove link, unit price, and line
|       |   |   |                       #   total. Connected to cart-store for quantity updates and
|       |   |   |                       #   removal.
|       |   |   |
|       |   |   |-- CartDrawer.tsx      # Slide-in cart panel (client component). Triggered from Navbar
|       |   |                           #   cart icon. Renders a right-side overlay drawer with item list,
|       |   |                           #   total, and "View Cart & Checkout" button. Empty state with
|       |   |                           #   gallery link. Manages body scroll lock when open. Uses
|       |   |                           #   slide-in animation.
|       |   |
|       |   |-- home/
|       |   |   |-- HeroSection.tsx     # Landing page hero banner. Gradient blue background with dot
|       |   |   |                       #   pattern overlay. Large heading, description, two CTA buttons
|       |   |   |                       #   (Upload Your Model, Browse Gallery), and three stat counters
|       |   |   |                       #   (5+ Materials, 0.1mm Min Layer Height, 100MB Max File Size).
|       |   |   |
|       |   |   |-- FeaturedModels.tsx  # Homepage featured models section. Displays up to 8 models in
|       |   |   |                       #   a 4-column grid. Each model links to its gallery detail page.
|       |   |   |                       #   Shows 3D icon placeholder, name, category, and dimensions.
|       |   |   |                       #   "View All Models" button links to /gallery.
|       |   |   |
|       |   |   |-- HowItWorks.tsx      # Four-step process explainer. Steps: Upload Your Model,
|       |   |                           #   Configure Settings, Place Your Order, Receive Your Print.
|       |   |                           #   Each step has an icon, number, title, and description in a
|       |   |                           #   responsive 4-column grid.
|       |   |
|       |   |-- gallery/
|       |   |   |-- ModelCard.tsx        # Gallery model card. Links to /gallery/[slug]. Shows format
|       |   |   |                       #   badge, 3D icon placeholder (with hover color change), model
|       |   |   |                       #   name, description (2-line clamp), category pill, and
|       |   |   |                       #   dimensions in mono font.
|       |   |   |
|       |   |   |-- GalleryFilters.tsx  # Gallery filter bar (client component). Search input with
|       |   |                           #   placeholder and a category dropdown select populated from
|       |   |                           #   model data. Responsive row layout.
|       |   |
|       |   |-- auth/
|       |   |   |-- LoginForm.tsx       # Email/password login form (client component). Submits to
|       |   |   |                       #   authAPI.login(), stores user/token/refreshToken in auth-store
|       |   |   |                       #   and localStorage, redirects to /admin (ADMIN) or /dashboard
|       |   |   |                       #   (CUSTOMER). Shows error banner. Link to registration page.
|       |   |   |
|       |   |   |-- RegisterForm.tsx    # Registration form (client component). Fields: name, email,
|       |   |                           #   password, confirm password. Client-side validation (password
|       |   |                           #   match, min 8 chars). Submits to authAPI.register(), stores
|       |   |                           #   auth state, redirects to /dashboard. Link to login page.
|       |   |
|       |   |-- admin/
|       |       |-- StatsCard.tsx        # Dashboard metric card. Displays a numeric or formatted value
|       |                               #   with a label and customizable SVG icon in a brand-colored
|       |                               #   circle. Used on the admin dashboard for totals and revenue.
|       |
|       |-- hooks/
|       |   |-- useDebounce.ts          # Generic debounce hook. Delays updating the returned value
|       |   |                           #   until the specified delay (default 300ms) has passed since
|       |   |                           #   the last input change. Uses setTimeout with cleanup.
|       |   |
|       |   |-- usePricing.ts          # Real-time pricing hook. Accepts a partial PrintConfig, debounces
|       |                               #   it (300ms), and calls pricingAPI.estimate() whenever config
|       |                               #   changes. Returns { estimate, isLoading, error }. Skips the
|       |                               #   API call if materialId is not set.
|       |
|       |-- services/                   # API client modules (each wraps lib/api with typed endpoints)
|       |   |-- auth.service.ts         # Auth API client. Methods: register(), login(), getProfile(),
|       |   |                           #   refresh(). All return typed ApiResponse wrappers.
|       |   |
|       |   |-- models.service.ts      # Models API client. Methods: getAll(params), getFeatured(),
|       |   |                           #   getBySlug(slug), getMyModels(params), create(data),
|       |   |                           #   update(id, data), delete(id). Builds query strings from
|       |   |                           #   params objects.
|       |   |
|       |   |-- orders.service.ts      # Orders API client. Methods: create(data), getMyOrders(params),
|       |   |                           #   getById(id), getAll(params) (admin), updateStatus(id, status)
|       |   |                           #   (admin). Returns typed Order responses.
|       |   |
|       |   |-- materials.service.ts   # Materials API client. Methods: getActive(), getAll(params)
|       |   |                           #   (admin), getById(id), create(data), update(id, data),
|       |   |                           #   delete(id).
|       |   |
|       |   |-- pricing.service.ts     # Pricing API client. Methods: estimate(data), getRules(),
|       |   |                           #   createRule(data), updateRule(id, data), deleteRule(id).
|       |   |
|       |   |-- upload.service.ts      # Upload API client. Methods: getPresignedUrl(data) (returns
|       |   |                           #   uploadUrl, key, modelId), confirmUpload(data) (sends
|       |   |                           #   dimensions), uploadToPresignedUrl(url, file, onProgress)
|       |   |                           #   (XHR PUT with progress tracking via upload.onprogress).
|       |   |
|       |   |-- payments.service.ts    # Payments API client. Methods: createIntent(orderId). Returns
|       |   |                           #   Stripe clientSecret and paymentIntentId for client-side
|       |   |                           #   payment confirmation.
|       |   |
|       |   |-- admin.service.ts       # Admin API client. Methods: getDashboard() (stats), getUsers
|       |                               #   (params), updateUserRole(userId, role).
|       |
|       |-- store/                      # Zustand client-side state stores
|       |   |-- auth-store.ts           # Authentication store with persist middleware. State: user,
|       |   |                           #   token, refreshToken, isAuthenticated. Actions: setAuth()
|       |   |                           #   (stores user and tokens), setToken() (refresh), logout()
|       |   |                           #   (clears all). Persisted to localStorage as "auth-storage".
|       |   |                           #   On rehydration, syncs token to localStorage for the API client.
|       |   |
|       |   |-- cart-store.ts          # Shopping cart store with persist middleware. State: items array,
|       |   |                           #   isOpen (drawer). Actions: addItem() (merges quantity if
|       |   |                           #   duplicate config), removeItem(), updateQuantity() (min 1),
|       |   |                           #   clearCart(), toggleDrawer(), setDrawerOpen(). Persisted to
|       |   |                           #   localStorage as "3d-printing-cart" (items only). Selectors:
|       |   |                           #   selectCartTotal (sum of unitPrice * quantity),
|       |   |                           #   selectCartItemCount (sum of quantities).
|       |   |
|       |   |-- config-store.ts        # Print configuration store (not persisted). State: modelId,
|       |                               #   modelName, materialId, materialName, colorHex (#CCCCCC
|       |                               #   default), quality (STANDARD default), infillPercent (20
|       |                               #   default), quantity (1 default). Actions: setModel(),
|       |                               #   setMaterial(), setColor(), setQuality(), setInfill(),
|       |                               #   setQuantity(), reset(). Used to pass configuration between
|       |                               #   gallery/upload -> configure -> cart pages.
|       |
|       |-- types/
|       |   |-- index.ts               # Shared TypeScript type definitions for the frontend. Interfaces:
|       |                               #   Model3D (full model with dimensions, URLs, flags), MaterialColor,
|       |                               #   Material (with colors array and properties), OrderItem,
|       |                               #   Order (with items, user, shipping), ShippingAddress,
|       |                               #   PriceEstimate (cost breakdown), PricingRule, User,
|       |                               #   CartItem, ApiResponse<T> (with pagination meta),
|       |                               #   DashboardStats, PrintConfig. Type aliases: ModelFormat,
|       |                               #   OrderStatus, PrintQuality.
|       |
|       |-- lib/
|       |   |-- utils.ts               # Utility functions and constants. cn(): merges Tailwind classes
|       |   |                           #   via clsx + tailwind-merge. formatCurrency(): USD Intl
|       |   |                           #   formatter. formatDate()/formatDateTime(): locale-aware date
|       |   |                           #   formatting. formatFileSize(): human-readable bytes. getFile
|       |   |                           #   Extension(): extracts lowercase extension. truncate(): string
|       |   |                           #   truncation. ORDER_STATUS_CONFIG: maps each OrderStatus to
|       |   |                           #   label, text color, and background color for badges.
|       |   |                           #   QUALITY_OPTIONS: array of {value, label, description,
|       |   |                           #   layerHeight} for DRAFT/STANDARD/HIGH. ALLOWED_MODEL_FORMATS
|       |   |                           #   and MAX_FILE_SIZE constants.
|       |   |
|       |   |-- api.ts                 # Base HTTP client. Wraps fetch() with JSON content-type,
|       |                               #   automatic Bearer token injection from localStorage, and
|       |                               #   error handling (throws on non-OK responses). Exports api
|       |                               #   object with typed get/post/put/patch/delete methods.
|       |                               #   Base URL from NEXT_PUBLIC_API_URL env var.
|       |
|       |-- providers/
|       |   |-- Providers.tsx          # Client-side provider wrapper. Initializes a React Query
|       |                               #   QueryClient with 60-second stale time and 1 retry.
|       |                               #   Wraps children in QueryClientProvider.
|       |
|       |-- config/
|           |-- site.ts                # Site-wide configuration constants. Exports siteConfig with
|           |                           #   name ("3D Printing Service"), description, and URL (from
|           |                           #   NEXT_PUBLIC_APP_URL or localhost:3001 default).
|           |
|           |-- navigation.ts         # Navigation link definitions. Exports mainNav (Home, Gallery,
|                                       #   Upload with auth flag), customerNav (Dashboard, My Orders,
|                                       #   My Models), adminNav (Dashboard, Orders, Materials, Models,
|                                       #   Pricing). Used by Navbar, AdminSidebar, and mobile menu.
```
