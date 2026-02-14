# -------------------------------------------------------------------
# STAGE 1: DEVELOPMENT (Hot Reload ke liye)
# -------------------------------------------------------------------
FROM node:20-alpine AS development
# Alpine mein extra tools install karna zaroori hota hai kabhi kabhi
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
# Sabhi dependencies install karo
RUN npm install

COPY . .

EXPOSE 5173

# Vite ko 0.0.0.0 par chalana zaroori hai Docker ke liye
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -------------------------------------------------------------------
# STAGE 2: BUILDER (For Production Build)
# -------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# -------------------------------------------------------------------
# STAGE 3: RUNNER (Nginx for Production)
# -------------------------------------------------------------------
FROM nginx:stable-alpine AS runner
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]