# Corpass: Production Deployment Guide
## For Coding Agent / IDE

**Project**: Corpass — B2B Corporate Procurement & Asset Management Platform  
**Goal**: Fix all critical bugs and production gaps so the codebase can be safely deployed.  
**Date**: June 2025  
**Scope**: This document covers ONLY what is needed to make the existing code deployable. Feature additions (OAuth, OTP, etc.) are explicitly excluded per project owner request.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Critical Security Blockers (P0)](#2-critical-security-blockers-p0)
3. [Infrastructure & Config (P0)](#3-infrastructure--config-p0)
4. [Input Validation & API Hardening (P1)](#4-input-validation--api-hardening-p1)
5. [Frontend Production Fixes (P1)](#5-frontend-production-fixes-p1)
6. [Database & Data Integrity (P1)](#6-database--data-integrity-p1)
7. [Observability & Error Handling (P2)](#7-observability--error-handling-p2)
8. [Build & Deploy Checklist](#8-build--deploy-checklist)

---

## 1. Project Architecture Overview

```
Corpass (Monorepo, pnpm workspaces)
├── apps/
│   ├── backend/     NestJS + Prisma + MySQL (port 3001)
│   └── web/         Next.js 14 App Router (port 3000)
├── frontend-admin/  Next.js 14 Admin Portal (port 3000 separate)
├── packages/
│   ├── shared/      Shared utilities
│   ├── types/       Shared TypeScript types
│   └── ui/          Shared UI components
├── infra/docker/    docker-compose.yml (MySQL only)
├── docs/            Design system, architecture docs
└── tests/e2e/       Playwright E2E tests
```

**Key Technologies**: NestJS 10, Prisma 5, MySQL 8, Next.js 14, Tailwind CSS, Cloudinary, JWT, bcryptjs, pnpm.

**Current Dev Command**: `pnpm dev` (runs backend + web concurrently via pnpm workspace scripts).

---

## 2. Critical Security Blockers (P0)

These MUST be fixed before any deployment. The platform handles corporate invoices, payments, and asset data.

### 2.1 Hardcoded Admin Backdoor — IMMEDIATE REMOVAL

**File**: `apps/backend/src/auth/auth.service.ts`  
**Lines**: 103–119

**Current (DANGEROUS)**:
```typescript
if (identifier === 'admin' && pass === 'admin') {
  const hashedPassword = await bcrypt.hash('admin', 10);
  await this.prisma.user.create({
    data: {
      name: 'System Admin',
      loginId: 'admin',
      email: 'admin@corpass.in',
      mobile: '0000000000',
      password: hashedPassword,
      address: 'HQ',
      city: 'Delhi',
      pincode: '110001',
      role: 'ADMIN' as any,
    }
  });
  return this.login('admin', 'admin', role);
}
```

**Why it's dangerous**: Anyone can log in as admin with `admin`/`admin`. This creates an unclosable backdoor.

**Fix**: Remove the entire hardcoded block. The admin seed script (`scripts/seed-admin.js` and `apps/backend/seed-admin.js`) already exists and creates the admin properly. The login flow should ONLY query the database.

**After (Safe)**:
```typescript
// Remove lines 103–119 entirely. Keep the existing UnauthorizedException:
throw new UnauthorizedException('Invalid credentials');
```

Also update the seed script to force a password change on first admin login (add a flag or document that the admin must change the password immediately after deployment).

---

### 2.2 JWT Secret Has a Hardcoded Fallback

**File**: `apps/backend/src/auth/auth.guard.ts`  
**Line**: 24

**Current**:
```typescript
secret: process.env.JWT_SECRET || 'super-secret-key-for-dev',
```

**Why it's dangerous**: If `JWT_SECRET` is missing from env, the app silently falls back to a public string. Any attacker can forge tokens.

**Fix**: Remove the fallback. Throw at application bootstrap if the secret is missing.

**After**:
```typescript
// In auth.guard.ts
secret: process.env.JWT_SECRET!, // Non-null assertion or better:

// Recommended: In main.ts or a dedicated config validation step
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

### 2.3 No Input Validation — All Controllers Accept `any`

**Problem**: Every `@Body()` in every controller is typed as `any`. No DTOs, no `class-validator`, no `ValidationPipe`. This means:
- Malformed JSON can crash the backend.
- SQL injection is theoretically possible (though Prisma helps).
- Type confusion between `string` and `number` causes silent bugs (e.g., `parseInt` on `undefined`).
- No protection against extra fields being sent.

**Files to fix**: All controllers in `apps/backend/src/*/`. Every `create`, `update`, `counterOffer` method.

**Fix**: Install and configure `class-validator` + `class-transformer` + global `ValidationPipe`.

**Step 1 — Install**:
```bash
cd apps/backend && pnpm add class-validator class-transformer
```

**Step 2 — Create DTOs** (examples for critical endpoints):

Create `apps/backend/src/auth/dto/register.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(3) loginId: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) mobile: string;
  @IsString() @MinLength(6) password: string;
  @IsString() address: string;
  @IsString() city: string;
  @IsString() pincode: string;
  @IsIn(['BUYER', 'SELLER']) role: string;

  // Buyer-specific
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() companyAddress?: string;
  @IsOptional() @IsString() companyType?: string;
  @IsOptional() @IsString() employeeCount?: string;

  // Seller-specific
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() deliveryRange?: string;
  @IsOptional() deliveryCities?: any;
  @IsOptional() deliveryPincodes?: any;
}
```

Create `apps/backend/src/products/dto/create-product.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() category: string;
  @IsOptional() @IsString() subCategory?: string;
  @IsIn(['FIXED', 'CONTACT_FOR_QUOTE']) priceType: string;
  @IsOptional() @IsNumber() price?: number;
  @IsIn(['PIECE', 'PAIR', 'SET', 'PACK', 'BUNDLE', 'BOX', 'CARTON', 'CASE', 'DOZEN', 'GRAM', 'KILOGRAM', 'TONNE', 'QUINTAL', 'MILLILITRE', 'LITRE', 'METRE', 'FOOT', 'ROLL', 'SQ_FOOT', 'SQ_METRE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'PROJECT']) pricingUnit: string;
  @IsOptional() @IsNumber() piecesPerUnit?: number;
  @IsOptional() @IsBoolean() isDeliverable?: boolean;
  @IsOptional() @IsIn(['LOCAL_100KM', 'HYPER_LOCAL_20KM', 'SHIPPING_AVAILABLE']) deliveryRange?: string;
  @IsOptional() deliveryCities?: any;
  @IsOptional() deliveryPincodes?: any;
  @IsNumber() minQtyPurchase: number;
  @IsNumber() minAmountPurchase: number;
  @IsOptional() @IsNumber() deliveryTimeDays?: number;
  @IsOptional() @IsNumber() stockQuantity?: number;
  @IsOptional() @IsArray() images?: string[];
}
```

Create `apps/backend/src/orders/dto/create-order.dto.ts`:
```typescript
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber() productId: number;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
  @IsString() shippingAddress: string;
  @IsString() billingAddress: string;
  @IsOptional() @IsString() buyerNote?: string;
  @IsOptional() @IsString() paymentMode?: string;
  @IsOptional() @IsString() buyerPincode?: string;
}
```

**Step 3 — Apply to controllers**:

Update `apps/backend/src/auth/auth.controller.ts`:
```typescript
import { RegisterDto } from './dto/register.dto';

@Post('register')
register(@Body() dto: RegisterDto) { ... }
```

Update `apps/backend/src/products/products.controller.ts`:
```typescript
import { CreateProductDto } from './dto/create-product.dto';

@Post()
create(@Request() req, @Body() createProductDto: CreateProductDto) { ... }
```

Update `apps/backend/src/orders/orders.controller.ts`:
```typescript
import { CreateOrderDto } from './dto/create-order.dto';

@Post()
create(@Request() req, @Body() dto: CreateOrderDto) { ... }
```

**Step 4 — Enable global ValidationPipe** in `apps/backend/src/main.ts`:
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip extra fields not in DTO
    forbidNonWhitelisted: true, // Throw on extra fields
    transform: true,        // Auto-transform types
  }));
  await app.listen(3001, '0.0.0.0');
}
```

---

### 2.4 No Rate Limiting / API Abuse Protection

**Problem**: `POST /auth/login` and `POST /auth/register` can be hit infinitely. No throttling on any endpoint.

**Fix**: Install `@nestjs/throttler` and apply globally.

```bash
cd apps/backend && pnpm add @nestjs/throttler
```

Update `apps/backend/src/app.module.ts`:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 10 },    // 10 req/sec
        { name: 'medium', ttl: 60000, limit: 50 },   // 50 req/min
        { name: 'long', ttl: 600000, limit: 100 },    // 100 req/10min
      ],
    }),
    // ... other imports
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

Override stricter limits on auth endpoints if needed using `@Throttle()` decorator.

---

### 2.5 CORS is Wide Open

**File**: `apps/backend/src/main.ts`  
**Line**: 25

**Current**:
```typescript
app.enableCors();
```

**Fix**: Restrict to known frontend origins. In production, the frontend and admin will be on specific domains.

```typescript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

Add `ALLOWED_ORIGINS` to `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,https://corpass.in,https://admin.corpass.in
```

---

### 2.6 No Security Headers

**Fix**: Add `helmet` to NestJS.

```bash
cd apps/backend && pnpm add helmet
```

Update `apps/backend/src/main.ts`:
```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));
```

---

## 3. Infrastructure & Config (P0)

### 3.1 Hardcoded API URLs Everywhere

**Problem**: Both `apps/web` and `frontend-admin` use `http://${window.location.hostname}:3001` in ~50+ fetch calls. This breaks on any real deployment (Vercel, AWS, custom domain, Docker network).

**Files affected** (partial list):
- `apps/web/src/app/login/page.tsx` (line 29)
- `apps/web/src/app/register/page.tsx` (line 38)
- `apps/web/src/hooks/useNotifications.ts` (lines 24, 32, 49, 66, 87)
- `apps/web/src/components/features/MessagesUI.tsx` (lines 59, 62, 150, 151, 197, 198, 218, 246, 263)
- `apps/web/src/components/features/SupportPageUI.tsx` (line 21)
- `apps/web/src/components/ui/LogoLink.tsx` (line 27)
- `apps/web/src/app/dashboard/buyer/page.tsx` (lines 26–27)
- `apps/web/src/app/dashboard/seller/page.tsx` (lines 26–29)
- `apps/web/src/app/dashboard/buyer/assets/page.tsx` (line 31)
- `frontend-admin/src/hooks/useNotifications.ts` (lines 23, 40, 57, 71)
- `frontend-admin/src/app/login/page.tsx` (line 15)
- `frontend-admin/src/app/dashboard/*/page.tsx` (all pages using 3001)

**Fix**: Create a centralized API client + env var.

**Step 1**: Add `NEXT_PUBLIC_API_URL` to both frontend `.env` files (or `.env.local`):
```
# For local dev
NEXT_PUBLIC_API_URL=http://localhost:3001

# For production (example)
NEXT_PUBLIC_API_URL=https://api.corpass.in
```

**Step 2**: Create `apps/web/src/lib/api.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit & { requireAuth?: boolean }): Promise<Response> {
  const url = apiUrl(path);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (options?.requireAuth !== false) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return res;
}

export async function apiFetchJSON<T>(path: string, options?: RequestInit & { requireAuth?: boolean }): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}
```

**Step 3**: Create identical `frontend-admin/src/lib/api.ts` (or import from shared package if properly configured).

**Step 4**: Replace every raw `fetch` in both frontends to use `apiFetch` or `apiFetchJSON`. Example migration for `useNotifications.ts`:

**Before**:
```typescript
const res = await fetch(`http://${window.location.hostname}:3001/notifications/unread-count`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After**:
```typescript
import { apiFetch } from '@/lib/api';

const res = await apiFetch('/notifications/unread-count');
```

**Note**: This is a large refactor. Do it systematically per file, or use a find-and-replace script.

---

### 3.2 Environment Variables Are Incomplete

**File**: `apps/backend/.env.example` (only has 4 lines)

**Current**:
```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/corpass"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Missing required env vars**:
- `JWT_SECRET` (required for token signing)
- `PORT` (default 3001)
- `ALLOWED_ORIGINS` (CORS whitelist)
- `NODE_ENV` (production/development)
- `CLOUDINARY_URL` (alternative to individual keys)

**Fix**: Update `.env.example` to include ALL required variables with documentation.

```
# === DATABASE ===
DATABASE_URL="mysql://root:candi2510@localhost:3306/corpass"

# === AUTH ===
JWT_SECRET="generate-a-random-256-bit-secret-here-min-32-chars"

# === SERVER ===
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

# === CLOUDINARY (Image Uploads) ===
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Also ensure `.env` is in `.gitignore` (check: `cat .gitignore | grep -E "\.env"`). If not, add it immediately.

---

### 3.3 No Backend Dockerfile

**Problem**: Only MySQL has a Docker container. The NestJS backend and Next.js frontends have no containerization.

**Fix**: Create production Dockerfiles.

**Create `apps/backend/Dockerfile`**:
```dockerfile
# === Build stage ===
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter backend build
RUN pnpm --filter backend exec prisma generate

# === Production stage ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

**Create `apps/web/Dockerfile`**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "start"]
```

**Create `frontend-admin/Dockerfile`** (similar to web).

**Create `docker-compose.prod.yml`**:
```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: corpass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    restart: always
    environment:
      DATABASE_URL: mysql://root:${MYSQL_ROOT_PASSWORD}@db:3306/corpass
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      NODE_ENV: production
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - db

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  admin:
    build:
      context: .
      dockerfile: frontend-admin/Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3002:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 4. Input Validation & API Hardening (P1)

### 4.1 Order/Invoice Number Generation Uses `Math.random()`

**Files**:
- `apps/backend/src/orders/orders.service.ts` lines 10–15
- `apps/backend/src/orders/orders.service.ts` lines 17–22
- `apps/backend/src/invoices/invoices.service.ts` lines 8–13

**Current**:
```typescript
private generateOrderNumber(): string {
  const date = new Date();
  const d = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${d}-${rand}`;
}
```

**Problem**: `Math.random()` is not cryptographically secure. Two orders placed in the same second have a 1/9000 collision chance. At scale, this WILL fail.

**Fix**: Use `nanoid` or `crypto.randomUUID()` + timestamp.

```bash
cd apps/backend && pnpm add nanoid
```

```typescript
import { nanoid } from 'nanoid';

private generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = nanoid(8); // 8-char alphanumeric, collision-safe
  return `ORD-${date}-${rand}`;
}
```

Apply the same fix to `generateInvoiceNumber()`.

---

### 4.2 No Pagination on List Endpoints

**Problem**: All `findMany` queries return the entire dataset. The marketplace, orders, invoices, assets, and admin tables will break at scale.

**Affected endpoints** (all lack `skip`/`take`):
- `GET /products/marketplace`
- `GET /orders`
- `GET /invoices`
- `GET /assets`
- `GET /admin/users`
- `GET /admin/orders`
- `GET /admin/products`
- `GET /admin/tickets`

**Fix**: Add standard pagination to every list endpoint.

**Backend pattern** (example for `orders.service.ts`):
```typescript
async findAll(userId: number, role: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  const where = role === 'BUYER' ? { buyerId: userId } : { sellerProfileId: (await this.prisma.sellerProfile.findUnique({ where: { userId } }))?.id };
  
  const [data, total] = await Promise.all([
    this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { /* ... */ },
    }),
    this.prisma.order.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

**Frontend**: Update all list pages to handle the `{ data, total, page, totalPages }` response shape. Add "Load More" or numbered pagination.

---

### 4.3 No Admin Guard on Admin Endpoints

**File**: `apps/backend/src/admin/admin.controller.ts`

**Current**: The controller only uses the generic `AuthGuard`. It does NOT verify that the user is actually an `ADMIN`.

**Fix**: Create an `AdminGuard`.

Create `apps/backend/src/admin/admin.guard.ts`:
```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return true;
  }
}
```

Apply to `admin.controller.ts`:
```typescript
@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController { ... }
```

---

## 5. Frontend Production Fixes (P1)

### 5.1 No Next.js Error or Loading Boundaries

**Problem**: No `error.tsx`, `loading.tsx`, or `not-found.tsx` files exist anywhere in the App Router. Users see blank white screens on any crash.

**Fix**: Create these at minimum for the root and dashboard routes.

**Create `apps/web/src/app/error.tsx`**:
```typescript
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-serif text-ink">Something went wrong</h1>
        <p className="text-slate">{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  );
}
```

**Create `apps/web/src/app/loading.tsx`**:
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-8 w-32 bg-surface-2 rounded mx-auto"></div>
        <div className="h-4 w-48 bg-surface-2 rounded mx-auto"></div>
      </div>
    </div>
  );
}
```

**Create `apps/web/src/app/not-found.tsx`**:
```typescript
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-ink">404</h1>
        <p className="text-slate">Page not found.</p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
```

Do the same for `frontend-admin/src/app/`.

---

### 5.2 Console Errors Leak to Users

**Problem**: ~50 `console.error` calls across frontend pages. No user-facing feedback on failures. Users see silent failures.

**Strategy**: Replace `console.error` with a toast notification system. The project already has `react-hot-toast` installed in `apps/web`.

**Example pattern for every `catch` block**:

**Before**:
```typescript
} catch (e) { console.error(e); }
```

**After**:
```typescript
import toast from 'react-hot-toast';

catch (e) {
  const message = e instanceof Error ? e.message : 'Something went wrong';
  toast.error(message);
  // Log to structured logger in production, not console
}
```

**Key files needing this fix**:
- `apps/web/src/app/dashboard/buyer/orders/page.tsx` (multiple catch blocks)
- `apps/web/src/app/dashboard/seller/orders/page.tsx` (multiple catch blocks)
- `apps/web/src/app/dashboard/buyer/assets/page.tsx`
- `apps/web/src/app/dashboard/buyer/catalog/page.tsx`
- `apps/web/src/app/dashboard/buyer/profile/page.tsx`
- `apps/web/src/app/dashboard/seller/catalog/page.tsx`
- `apps/web/src/app/dashboard/seller/stock/page.tsx`
- `apps/web/src/components/features/MessagesUI.tsx`
- `frontend-admin/src/app/dashboard/*/page.tsx` (all pages)

---

### 5.3 Duplicate STATUS_CONFIG and UOM Maps

**Problem**: `STATUS_CONFIG`, `INV_STATUS`, `PAY_STATUS_CONFIG`, and `UOM` objects are defined identically in both `buyer/orders/page.tsx` and `seller/orders/page.tsx`. This is a maintainability bug — any change must be made in two places.

**Fix**: Extract to a shared constants file.

**Create `apps/web/src/lib/constants.ts`**:
```typescript
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; cpBadge?: string }> = {
  PLACED: { label: "New Order", color: "text-amber-700", bg: "bg-amber-50", cpBadge: "cp-badge--info" },
  COUNTER_OFFERED: { label: "Counter Offer", color: "text-orange-700", bg: "bg-orange-50", cpBadge: "cp-badge--warning" },
  CONFIRMED: { label: "Confirmed", color: "text-ink", bg: "bg-paper-2", cpBadge: "cp-badge--neutral" },
  SHIPPED: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-50", cpBadge: "cp-badge--info" },
  DELIVERED: { label: "Delivered", color: "text-money", bg: "bg-paper-2 border border-money text-money", cpBadge: "cp-badge--success" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50", cpBadge: "cp-badge--danger" },
};

export const INV_STATUS = { /* ... */ };
export const PAY_STATUS_CONFIG = { /* ... */ };
export const UOM: Record<string, string> = { /* ... */ };
```

Import from `lib/constants.ts` in both order pages and remove the duplicate definitions.

---

## 6. Database & Data Integrity (P1)

### 6.1 Missing Database Indexes

**Problem**: `schema.prisma` has only 2 indexes (on `Notification`). Frequent query columns are unindexed. Queries will slow down at scale.

**Fix**: Add `@index` to frequently queried fields.

Update `apps/backend/prisma/schema.prisma`:
```prisma
model User {
  // ... existing fields
  @@index([loginId])
  @@index([email])
  @@index([mobile])
  @@index([role])
  @@index([companyId])
}

model ProductCatalog {
  // ... existing fields
  @@index([sellerProfileId])
  @@index([category])
  @@index([priceType])
  @@index([createdAt])
}

model Order {
  // ... existing fields
  @@index([buyerId])
  @@index([sellerProfileId])
  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
}

model Inquiry {
  // ... existing fields
  @@index([buyerId])
  @@index([sellerProfileId])
  @@index([productId])
  @@index([status])
}

model Invoice {
  // ... existing fields
  @@index([buyerId])
  @@index([sellerProfileId])
  @@index([invoiceNumber])
  @@index([status])
}

model Asset {
  // ... existing fields
  @@index([userId])
  @@index([sourceOrderId])
}

model SupportMessage {
  // ... existing fields
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

Run `pnpm exec prisma migrate dev --name add_indexes` after adding these.

---

### 6.2 No Soft Deletes

**Problem**: Deleting a user cascades hard-deletes their orders, assets, and reviews. This is destructive for a B2B platform with audit requirements.

**Fix**: Add `isActive` / `deletedAt` to key models. At minimum, start with `User` and `ProductCatalog`.

```prisma
model User {
  // ... existing fields
  isActive  Boolean  @default(true)
  deletedAt DateTime?
  @@index([isActive])
}

model ProductCatalog {
  // ... existing fields
  isActive  Boolean  @default(true)
  deletedAt DateTime?
  @@index([isActive])
}
```

Update all `findMany` and `findUnique` queries to include `where: { isActive: true }` unless explicitly requesting deleted records.

---

### 6.3 Switch from `prisma db push` to `prisma migrate deploy`

**Current**: README instructs `prisma db push`. This is for prototyping and destroys data on schema changes.

**Fix for production**:
1. Run `pnpm exec prisma migrate dev --name init` once to create the baseline migration.
2. In production, use `pnpm exec prisma migrate deploy` (not `db push`).
3. Update README setup instructions.

---

## 7. Observability & Error Handling (P2)

### 7.1 Add Health Check Endpoint

**File**: `apps/backend/src/main.ts` or new module

**Fix**: Add a basic health check so deployment platforms (AWS, Docker, Kubernetes) can verify the service is alive.

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'connected' };
  }
}
```

Register in `app.module.ts`.

---

### 7.2 Replace Raw `console.log` with a Logger

**Problem**: Production services should not use `console.log`/`console.error`. They should use a structured logger like `pino` or NestJS's built-in `Logger`.

**Fix**: Replace `console.log` in service files with `Logger`.

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  // ...
  this.logger.warn('Could not load pincodes.json');
}
```

Files to update:
- `apps/backend/src/products/products.service.ts` (line 11: console.warn)
- `apps/backend/src/notifications/notifications.service.ts` (line 19: console.error)
- `apps/backend/src/support/support.service.ts` (line 31: console.error)
- `apps/backend/src/cities/cities.controller.ts` (line 11: console.error)
- Remove all `console.log` from `products.service.ts` (line 183)

---

## 8. Build & Deploy Checklist

Before deploying, verify each item:

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | `.env` is NOT committed | `git ls-files | grep .env` should return nothing |
| 2 | `JWT_SECRET` is set and random | `echo $JWT_SECRET` should be 32+ random chars |
| 3 | Admin backdoor removed | Search `auth.service.ts` for `"admin" && pass === "admin"` — should be 0 matches |
| 4 | JWT fallback removed | `auth.guard.ts` has no `||` after `JWT_SECRET` |
| 5 | `class-validator` DTOs exist | Every controller `@Body()` has a typed DTO, not `any` |
| 6 | `ValidationPipe` is global | `main.ts` includes `app.useGlobalPipes(new ValidationPipe(...))` |
| 7 | Rate limiting active | `app.module.ts` includes `ThrottlerModule` and `ThrottlerGuard` |
| 8 | `helmet` active | `main.ts` includes `app.use(helmet())` |
| 9 | CORS restricted | `main.ts` `enableCors()` has origin whitelist, not wide open |
| 10 | API URLs are env-driven | `apps/web/src/lib/api.ts` uses `process.env.NEXT_PUBLIC_API_URL` |
| 11 | No raw `fetch` with 3001 | Search `grep -r "3001" apps/web/src` — only `api.ts` should reference it |
| 12 | Error boundaries exist | `apps/web/src/app/error.tsx` and `loading.tsx` exist |
| 13 | Pagination on lists | `GET /orders`, `GET /products/marketplace` return `{ data, total, page, totalPages }` |
| 14 | DB indexes added | `schema.prisma` has `@@index` on frequently queried columns |
| 15 | `prisma migrate deploy` used | Production deployment uses `migrate deploy`, not `db push` |
| 16 | Health check responds | `curl /health` returns `{ status: "ok" }` |
| 17 | Docker builds pass | `docker-compose -f docker-compose.prod.yml up --build` completes without errors |
| 18 | E2E tests pass | `pnpm test:e2e` passes with the production build |
| 19 | Console logs cleaned | `grep -r "console\." apps/web/src/app/dashboard/` returns only intentional logs |
| 20 | Duplicate constants extracted | `STATUS_CONFIG`, `UOM` defined once in `lib/constants.ts` |

---

## Excluded from Scope (Per Owner Request)

The following items are NOT to be implemented now. They are planned for future phases:
- OAuth / Social Login
- OTP / SMS Verification
- Email delivery service (SendGrid/SES)
- Real payment gateway integration (Razorpay/Stripe)
- WebSocket / real-time messaging (keep current 30-second polling)
- Redis / caching layer
- Multi-tenancy hardening (beyond existing ownership checks)

---

## Appendix: Quick Reference — All Files to Touch

```
apps/backend/src/auth/auth.service.ts              # Remove hardcoded admin
apps/backend/src/auth/auth.guard.ts                # Remove JWT fallback
apps/backend/src/auth/dto/register.dto.ts           # NEW
apps/backend/src/auth/dto/login.dto.ts              # NEW
apps/backend/src/products/dto/create-product.dto.ts # NEW
apps/backend/src/orders/dto/create-order.dto.ts     # NEW
apps/backend/src/inquiries/dto/create-inquiry.dto.ts # NEW
apps/backend/src/invoices/dto/create-invoice.dto.ts  # NEW
apps/backend/src/main.ts                           # ValidationPipe, helmet, CORS, env check
apps/backend/src/app.module.ts                     # ThrottlerModule
apps/backend/src/admin/admin.guard.ts              # NEW
apps/backend/src/admin/admin.controller.ts         # Apply AdminGuard
apps/backend/src/orders/orders.service.ts          # Use nanoid for IDs
apps/backend/src/invoices/invoices.service.ts      # Use nanoid for IDs
apps/backend/src/products/products.service.ts      # Remove console.log, fix mutation
apps/backend/src/notifications/notifications.service.ts # Replace console.error
apps/backend/src/support/support.service.ts        # Replace console.error
apps/backend/src/cities/cities.controller.ts       # Replace console.error
apps/backend/prisma/schema.prisma                  # Add indexes, soft delete flags
apps/web/src/lib/api.ts                             # NEW
apps/web/src/lib/constants.ts                     # NEW
apps/web/src/app/error.tsx                         # NEW
apps/web/src/app/loading.tsx                       # NEW
apps/web/src/app/not-found.tsx                     # NEW
apps/web/src/hooks/useNotifications.ts             # Use apiFetch
apps/web/src/components/features/MessagesUI.tsx     # Use apiFetch, add toasts
apps/web/src/app/login/page.tsx                     # Use apiFetch
apps/web/src/app/register/page.tsx                  # Use apiFetch
apps/web/src/app/dashboard/buyer/orders/page.tsx    # Use apiFetch, constants, toasts
apps/web/src/app/dashboard/seller/orders/page.tsx   # Use apiFetch, constants, toasts
apps/web/src/app/dashboard/buyer/catalog/page.tsx    # Use apiFetch, toasts
apps/web/src/app/dashboard/buyer/assets/page.tsx    # Use apiFetch, toasts
apps/web/src/app/dashboard/seller/catalog/page.tsx  # Use apiFetch, toasts
apps/web/src/app/dashboard/seller/stock/page.tsx    # Use apiFetch, toasts
frontend-admin/src/lib/api.ts                       # NEW
frontend-admin/src/hooks/useNotifications.ts        # Use apiFetch
frontend-admin/src/app/login/page.tsx               # Use apiFetch
frontend-admin/src/app/dashboard/*/page.tsx          # Use apiFetch, toasts
apps/backend/Dockerfile                             # NEW
apps/web/Dockerfile                                 # NEW
frontend-admin/Dockerfile                           # NEW
docker-compose.prod.yml                             # NEW
apps/backend/.env.example                           # Expand
infra/docker/.env.example                           # Expand
README.md                                           # Update setup instructions
```
