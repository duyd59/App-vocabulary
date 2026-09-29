# ============================================================================
# HanViệt Lexicon — Production Dockerfile (Optimized for Coolify One-Click)
# ============================================================================
FROM node:22-alpine

WORKDIR /app

# Copy package manifests and .npmrc first for layer caching
COPY package*.json .npmrc ./
RUN npm install --include=dev --legacy-peer-deps --no-audit --no-fund

# Copy application source and build Vite frontend assets into /app/dist
ARG GEMINI_API_KEY=""
ARG VITE_GEMINI_API_KEY=""
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
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

CMD ["node", "server.ts"]
