# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json ./
RUN npm install

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./
COPY .env.example ../.env
RUN npm run build

# --- Stage 3: Production (static files via nginx, unprivileged image) ---
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
USER nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# --- Stage 4: Development (Vite hot reload) ---
FROM node:20-alpine AS development
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend ./
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
