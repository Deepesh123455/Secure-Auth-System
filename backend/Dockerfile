# -------------------------------------------------------------------
# STAGE 1: BUILDER
# -------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# -------------------------------------------------------------------
# STAGE 2: RUNNER
# -------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Global tools install karo (Ye development mein kaam aayenge)
RUN npm install -g nodemon tsx

# Files copy karo
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Development ke liye source code bhi chahiye (Hot reload ke liye)
COPY . .

# Permissions set karo (root user hi install karega taaki permission error na aaye)
RUN npm install

# Ab user switch karo security ke liye
RUN chown -R node:node /app
USER node

EXPOSE 5000

# Default command (Docker-compose isse dev mein overwrite kar dega)
CMD ["node", "dist/server.js"]