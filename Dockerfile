# ============================================================================
# HanViệt Lexicon — Production Dockerfile (Optimized for Coolify One-Click)
# ============================================================================
FROM node:22-alpine

WORKDIR /app

# Install dependencies with clean lockfile/cache
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy application source and build Vite frontend assets into /app/dist
COPY . .
RUN npm run build

# Set production environment defaults for Coolify
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Built-in container healthcheck for Coolify zero-downtime deployment
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-3000}/api/health || exit 1

CMD ["npm", "start"]
