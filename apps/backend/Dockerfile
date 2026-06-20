FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl
RUN npm install -g pnpm

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy backend package.json
COPY apps/backend/package.json apps/backend/

# Install dependencies
RUN pnpm install --filter backend...

# Copy all backend source code
COPY apps/backend apps/backend/

# Build backend
WORKDIR /app/apps/backend
RUN pnpm prisma generate
RUN pnpm run build

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/src/resources ./apps/backend/src/resources

WORKDIR /app/apps/backend
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/src/main"]
