FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy frontend-admin package.json
COPY frontend-admin/package.json frontend-admin/

# Install dependencies
RUN pnpm install --filter frontend-admin...

# Copy all frontend-admin source code
COPY frontend-admin frontend-admin/

# Build frontend-admin
WORKDIR /app/frontend-admin
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets
COPY --from=builder /app/frontend-admin/public ./frontend-admin/public
COPY --from=builder /app/frontend-admin/.next/standalone ./
COPY --from=builder /app/frontend-admin/.next/static ./frontend-admin/.next/static

EXPOSE 3002
CMD ["node", "frontend-admin/server.js"]
