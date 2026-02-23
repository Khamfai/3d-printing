# 3D Printing Service – System Requirements

## 1. Project Overview
A web-based platform for a 3D printing service that allows customers to:
- View example 3D models interactively
- Upload their own 3D models
- Get automatic price estimates
- Place and track printing orders

The system must also include an admin dashboard to manage orders, materials, pricing, and sample models.

---

## 2. User Roles

### 2.1 Customer
- Customer registration and login (email/password + social login)
- User dashboard to view past orders and uploaded models
- Browse sample 3D models
- View models in an interactive 3D viewer
- Upload STL/OBJ/GLTF files
- Configure print settings (material, color, quality, infill)
- View automatic price estimation
- Place and pay for orders
- Track order status

### 2.2 Admin
- Login to admin dashboard
- Admin role for managing orders, models, and pricing
- Manage materials and pricing rules
- View and update order statuses
- Mark order status updates
- Download customer-uploaded 3D files
- Manage print queue

---

## 3. Functional Requirements

### 3.1 Frontend (Website)
- Display a gallery of example/pre-made 3D models
- Interactive 3D viewer in the browser (rotate, zoom, pan)
- Support for common 3D file formats: `.STL`, `.OBJ`, `.3MF`, `.glTF/.GLB`
- Responsive design (desktop, tablet, mobile), model viewing with AR support (optional)
- SEO-friendly public pages
- Product-style gallery for sample models


### 3.2 3D Model Viewer
- Support STL, OBJ, and GLTF formats
- Rotate, zoom, and pan models
- Auto-center and auto-scale models
- Display model dimensions (X, Y, Z)
- Preview material colors

### 3.3 File Upload & Preview
- Customers can upload their own 3D model files
- Uploaded files render as an interactive 3D preview before checkout
- Files stored securely and privately (not publicly accessible)
- Support upload of large files (STL files can be 50MB+)
- Secure upload of 3D model files
- File size and format validation
- Store files in cloud storage
- Generate preview-ready formats if required

### 3.4 Pricing & Estimation
- Calculate model volume
- Estimate print time
- Pricing based on:
  - Material type
  - Material density
  - Layer height
  - Infill percentage
  - Machine cost per hour
- Display real-time price estimate to user

### 3.5 Order Management
- Create orders from uploaded models
- Store selected print settings
- Customers configure print options (material, color, scale, quantity)
- Dynamic pricing calculated based on configuration
- Order status lifecycle:
  - Pending
  - Paid
  - Printing
  - Finished
  - Shipped / Completed
- Order history for customers

### 3.6 Payment
- Online payment integration
- Support card and local payment methods
- Payment confirmation and order locking

### 3.7 Notifications
- Email confirmation on order placement
- Email update when print is ready / shipped

---

## 4. Backend Requirements
- REST or GraphQL API
- Authentication and authorization (customer / admin)
- Role-based access control
- Secure file access using signed URLs
- Business logic for pricing calculation

---

## 5. Database Requirements

### Core Entities
- User
- 3DModel
- Material
- PrintSetting
- Order
- OrderItem
- Payment

### Relationships
- User → Orders
- Order → OrderItems
- OrderItem → 3DModel
- OrderItem → PrintSetting

---

## 6. Admin Dashboard Requirements
- Order list with filters
- Order detail view
- Update order status
- Manage materials and pricing rules
- Upload and manage sample models

---

## 7. Non-Functional Requirements
- Back-end sparate: middleware (gaurd, roles, permission, data-validation), routes, models, controller, service, response handle format, and handle error. 
- Fast page loading
- Secure file handling
- Scalable architecture
- Maintainable codebase
- Easy deployment and updates

---

## 8. MVP Scope
- Homepage
- Sample 3D model gallery
- 3D viewer
- Upload & preview model
- Price estimation
- Order & payment
- Admin dashboard (basic)
- Performance: Page load < 3s; 3D viewer loads < 5s 
- Scalability: Handle 3D file uploads up to 100MB
- Security: Auth-protected routes; presigned URLs for file access
- SEO: Server-side rendered pages for model gallery and homepage
- Accessibility: WCAG 2.1 AA compliance for core pages
- Uptime: 99.9% availability target

---

## 9. Future Enhancements
- Automatic slicing integration
- Machine availability scheduling
- Shipping cost calculation
- Customer notifications (email / SMS)
- Multi-language support

---

## 10. Out of Scope (v1)

- Automated print queue / machine integration
- Real-time print progress tracking
- Multi-vendor / marketplace features
- Mobile native app
- AI-based model repair or optimization

---

## 11. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | SSR, routing, styling |
| 3D Viewer | Three.js (STLLoader / OBJLoader) | In-browser 3D rendering |
| Backend | Bun + Elysia | High-performance TypeScript API server |
| API Client | Eden Treaty | End-to-end type safety (Elysia's client) |
| ORM | Prisma | Type-safe DB access, migrations |
| Database | PostgreSQL via Supabase | Users, orders, model metadata |
| File Storage | Cloudflare R2 | STL/OBJ files; zero egress fees |
| Authentication | NextAuth.js v5 / Clerk | Sessions, roles |
| Payments | Stripe | Checkout, webhooks |
| Email | Resend | Order confirmations, status updates |
| Deployment | Vercel (frontend) + Fly.io or Railway (Bun server) | CI/CD via GitHub |

---
