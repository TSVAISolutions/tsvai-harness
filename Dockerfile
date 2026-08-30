# Multi-stage build for Harness Factory

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user (use available UID if 1000 is taken)
RUN addgroup -g 1001 harness && adduser -D -u 1001 -G harness harness || adduser -D harness

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=harness:harness . .

# Create required directories
RUN mkdir -p /data/brain-wiki /var/log/harness && \
    chown -R harness:harness /data /var/log/harness

# Switch to non-root user
USER harness

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose ports
EXPOSE 3000 3001

# Use dumb-init to run Node (handles signals properly)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
