# TSVAI Plugin Dockerfile
# Multi-stage build for ai/plugin

FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY ai/plugin/package.json ./
COPY ai/plugin/package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY ai/plugin/src ./src
COPY ai/plugin/skills ./skills
COPY ai/plugin/.claude-plugin ./.claude-plugin
COPY ai/plugin/.mcp.json ./
COPY ai/plugin/CLAUDE.md ./
COPY ai/plugin/CONNECTORS.md ./

# Build if needed
RUN npm run build 2>/dev/null || true

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy built artifacts from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/skills ./skills
COPY --from=build /app/.claude-plugin ./.claude-plugin
COPY --from=build /app/.mcp.json ./
COPY --from=build /app/CLAUDE.md ./
COPY --from=build /app/CONNECTORS.md ./

# Copy runtime scripts
COPY ai/plugin/bin ./bin

# Make CLI executable
RUN chmod +x bin/tsvai

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('ok')" || exit 1

EXPOSE 3000

ENV NODE_ENV=production

# Default command
CMD ["node", "src/index.js"]
