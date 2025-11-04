# ============================================
# Multi-stage Dockerfile voor DaCapo Toolbox
# ============================================

# ---- Stage 1: Frontend Build ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Kopieer client package files
COPY client/package*.json ./
RUN npm ci --omit=dev

# Kopieer client source code
COPY client/ ./

# Build frontend voor productie
RUN npm run build

# ---- Stage 2: Backend Dependencies ----
FROM node:20-alpine AS backend-deps

WORKDIR /app/server

# Kopieer server package files
COPY server/package*.json ./
RUN npm ci --omit=dev

# ---- Stage 3: Production Runtime ----
FROM node:20-alpine

# Install dumb-init voor proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Kopieer production .env
COPY .env.production ./.env.production

# Kopieer backend code en dependencies
COPY server/ ./server/
COPY --from=backend-deps /app/server/node_modules ./server/node_modules

# Kopieer gebouwde frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Maak uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch naar non-root user voor security
USER node

# Environment variabelen
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start met dumb-init voor proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
