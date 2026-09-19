# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests for clean, reproducible dependency installation
COPY package.json package-lock.json ./

# Install exact dependencies defined in package-lock.json without running git hooks (husky)
RUN npm ci --ignore-scripts

# Copy application source code and configuration
COPY . .

# Build the production bundle into dist/
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

# Remove default Nginx welcome page files
RUN rm -rf ./*

# Copy production static assets from the builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration with SPA fallback and API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check verifying Nginx is serving the root document
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
