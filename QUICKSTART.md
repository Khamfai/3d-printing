# 3D Printing Service - Quick Start Guide

This guide walks you through setting up and running the 3D Printing Service project locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running Development Servers](#running-development-servers)
6. [Default Test Accounts](#default-test-accounts)
7. [API Documentation](#api-documentation)
8. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool       | Minimum Version | Install Guide                          |
|------------|-----------------|----------------------------------------|
| **Bun**    | 1.0+            | https://bun.sh/docs/installation       |
| **Node.js**| 18+             | https://nodejs.org/                    |
| **PostgreSQL** | 14+         | https://www.postgresql.org/download/   |

Verify your installations:

```bash
bun --version
node --version
psql --version
```

---

## Clone the Repository

```bash
git clone <your-repo-url> 3d-printing
cd 3d-printing
```

The project structure looks like this:

```
3d-printing/
├── src/                # Backend (Bun + Elysia)
├── prisma/             # Prisma schema and migrations
├── frontend/           # Frontend (Next.js 14)
├── .env.example        # Backend environment template
└── package.json        # Backend dependencies
```

---

## Backend Setup

All backend commands are run from the project root (`3d-printing/`).

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Open `.env` and configure the following:

```dotenv
# --- Required ---

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/printing3d?schema=public"

# JWT secret for authentication (use any long random string)
JWT_SECRET="your-secret-key-change-this-in-production"

# --- Optional for Development ---

# Cloudflare R2 (file storage) - not required for basic dev workflow
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# Stripe (payments) - not required for basic dev workflow
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PUBLISHABLE_KEY=""

# Resend (email) - not required for basic dev workflow
RESEND_API_KEY=""
```

> **Note:** Only `DATABASE_URL` and `JWT_SECRET` are required to get the project running locally. Cloudflare R2, Stripe, and Resend integrations are optional during development.

### 3. Create the PostgreSQL database

If you have not already created the database:

```bash
createdb printing3d
```

Or via `psql`:

```sql
CREATE DATABASE printing3d;
```

### 4. Generate Prisma client and push the schema

```bash
bunx prisma generate
bunx prisma db push
```

- `prisma generate` creates the typed Prisma client from `prisma/schema.prisma`.
- `prisma db push` synchronizes your database schema without creating migration files (suitable for development).

### 5. Seed the database

```bash
bunx prisma db seed
```

This populates the database with initial data including test user accounts, sample materials, and other reference data needed for development.

---

## Frontend Setup

All frontend commands are run from the `frontend/` directory.

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
bun install
```

> You can also use `npm install` or `yarn install` if you prefer.

### 3. Configure environment variables

If a `.env.example` or `.env.local.example` file exists in the frontend directory:

```bash
cp .env.example .env.local
```

At minimum, ensure the backend API URL is set:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Running Development Servers

You need to run both the backend and frontend servers simultaneously. Open two terminal windows or tabs.

### Terminal 1 - Backend (port 3000)

From the project root:

```bash
bun run dev
```

The backend server starts at: **http://localhost:3000**

### Terminal 2 - Frontend (port 3001)

From the `frontend/` directory:

```bash
bun run dev
```

The frontend server starts at: **http://localhost:3001**

> **Tip:** If port 3001 is not the default for your Next.js setup, you can explicitly set it:
> ```bash
> bun run dev -- -p 3001
> ```

---

## Default Test Accounts

After running the database seed, the following test accounts are available:

| Role     | Email                      | Password          |
|----------|----------------------------|--------------------|
| Admin    | admin@printing3d.com       | admin123456        |
| Customer | customer@example.com       | customer123456     |

Use these credentials to log in via the frontend or to obtain JWT tokens from the backend API.

---

## API Documentation

Interactive API documentation is available via Swagger UI once the backend is running:

**http://localhost:3000/swagger**

The Swagger UI provides:

- A complete list of all API endpoints
- Request/response schemas
- The ability to test endpoints directly from the browser
- Authentication support (use the test accounts above to obtain a token)

---

## Common Issues and Troubleshooting

### Database connection refused

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Fix:** Ensure PostgreSQL is running:

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Check status
pg_isready
```

Also verify your `DATABASE_URL` in `.env` matches your actual PostgreSQL credentials and port.

---

### Prisma client not generated

**Symptom:** `Error: @prisma/client did not initialize yet` or import errors related to Prisma.

**Fix:** Run the Prisma client generator:

```bash
bunx prisma generate
```

This must be run any time `prisma/schema.prisma` is modified.

---

### Port already in use

**Symptom:** `Error: listen EADDRINUSE :::3000` or `:::3001`

**Fix:** Kill the process occupying the port:

```bash
# Find the process using the port
lsof -i :3000

# Kill it by PID
kill -9 <PID>
```

---

### Prisma schema out of sync with database

**Symptom:** Runtime errors about missing columns or tables.

**Fix:** Re-push the schema to your database:

```bash
bunx prisma db push
```

> **Warning:** In development, `db push` may reset data if there are breaking schema changes. Re-run the seed afterward if needed:
> ```bash
> bunx prisma db seed
> ```

---

### Bun not recognized / command not found

**Symptom:** `command not found: bun`

**Fix:** Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then restart your terminal or source your shell profile:

```bash
source ~/.bashrc   # or ~/.zshrc
```

---

### Frontend cannot reach backend API

**Symptom:** Network errors or CORS issues in the browser console.

**Fix:**

1. Confirm the backend is running on port 3000.
2. Ensure `NEXT_PUBLIC_API_URL` is set to `http://localhost:3000` in `frontend/.env.local`.
3. If you see CORS errors, verify the backend has CORS configured to allow requests from `http://localhost:3001`.

---

### Seed command fails

**Symptom:** `Error: prisma db seed` fails with validation or connection errors.

**Fix:**

1. Make sure the database exists and the schema has been pushed:
   ```bash
   bunx prisma db push
   ```
2. Check that your `.env` file has the correct `DATABASE_URL`.
3. Review the seed script (typically `prisma/seed.ts`) for any hardcoded values that might conflict with your local setup.

---

### Node.js version mismatch

**Symptom:** Unexpected syntax errors or incompatible API warnings in the frontend.

**Fix:** Ensure you are running Node.js 18 or later:

```bash
node --version
```

If you need to manage multiple Node.js versions, consider using [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 18
nvm use 18
```

---

## Summary of Commands

Here is a quick reference of all setup commands in order:

```bash
# Backend setup (from project root)
bun install
cp .env.example .env          # then edit .env with your values
createdb printing3d            # create the PostgreSQL database
bunx prisma generate
bunx prisma db push
bunx prisma db seed

# Frontend setup (from frontend/)
cd frontend
bun install
cp .env.example .env.local     # then edit .env.local if needed

# Run servers (two terminals)
# Terminal 1 (project root): bun run dev
# Terminal 2 (frontend/):    bun run dev
```
