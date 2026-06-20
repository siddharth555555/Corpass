# Corpass Monorepo

## Overview
This is a monorepo containing a Next.js frontend, a NestJS backend, and shared packages using pnpm workspaces.

## Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma, MySQL
- **Packages**: Shared UI, Types, Utilities
- **Tooling**: pnpm, Vitest, Playwright, Docker

## Setup
Since Node/pnpm may not be installed globally, ensure you have Node.js and pnpm installed.

```bash
# 1. Install dependencies
pnpm install

# 2. Start Infrastructure (MySQL Database)
cd infra/docker
docker-compose up -d

# 3. Setup Database schema
cd apps/backend
pnpm exec prisma db push

# 4. Start Development Servers
cd ../..
pnpm dev
```

## Running without Docker (Native Local Setup)
If you prefer not to use Docker, you can run the MySQL database directly on your machine.

**1. Install and Start MySQL** (Using Homebrew on Mac)
```bash
brew install mysql
brew services start mysql
```

**2. Secure MySQL & Set Password**
```bash
# Follow the prompts to set the root password to "candi2510" (as configured in apps/backend/.env)
mysql_secure_installation
```

**3. Create the Database**
```bash
# Login to MySQL
mysql -u root -p
# Execute the following SQL command:
CREATE DATABASE corpass;
exit;
```

**4. Continue Normal Setup**
```bash
# Push the schema and start the servers
cd apps/backend
pnpm exec prisma db push
cd ../..
pnpm dev
```

## Production Deployment
Corpass comes with production-ready Dockerfiles and a `docker-compose.prod.yml` configuration.

**1. Setup Environment Variables**
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
# Edit the .env files and add secure passwords and JWT secrets
```

**2. Build and Start Services**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This will spin up:
- `db` (MySQL 8.0) on port 3306
- `backend` (NestJS) on port 3001
- `web` (Next.js) on port 3000
- `frontend-admin` (Next.js) on port 3002
