FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies (keep only production deps)
RUN npm prune --production

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create directory for WhatsApp auth info (persistent volume)
RUN mkdir -p /app/auth_info_baileys

# Expose port (adjust if needed)
ENV PORT=8080
EXPOSE 8080

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Run the server
CMD ["node", "dist/avital.js"]