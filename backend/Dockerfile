# LOCATION: ./backend/Dockerfile

# ----------------------------
# Stage 1: Builder
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Cache optimization keys
COPY package*.json ./

# 'npm ci' ensures exact versions from lockfile (Critical for CI pipelines)
RUN npm ci

COPY . .
RUN npm run build

# ----------------------------
# Stage 2: Runner (AWS Ready)
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Sirf production dependencies (AWS cost & security saving)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Non-root user for security (AWS GuardDuty likes this)
RUN chown -R node:node /app
USER node

# Port expose (AWS Load Balancer will map to this)
EXPOSE 5000

CMD ["node", "dist/server.js"]