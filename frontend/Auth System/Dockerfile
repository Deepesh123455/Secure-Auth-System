# LOCATION: ./frontend/Auth System/Dockerfile

# ----------------------------
# Stage 1: Builder
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Pipeline speed boost
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ----------------------------
# Stage 2: Nginx Runner
# ----------------------------
FROM nginx:alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy React Build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx Config (Niche dekho)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]