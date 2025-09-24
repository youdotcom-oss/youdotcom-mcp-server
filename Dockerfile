# Optimized multi-stage Dockerfile for You.com MCP Server HTTP mode

# Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json bun.lock* ./

# Install dependencies (ignoring prepare scripts for production)
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source code
COPY src ./src
COPY bin ./bin
COPY tsconfig.json ./

# Copy bin/http to server.ts and fix import path
COPY bin/http server.ts
RUN sed -i 's|../src/http.js|./src/http.js|g' server.ts

# Compile to standalone binary (includes Bun runtime)
RUN bun build server.ts --compile --outfile mcp-server

# Minimal production stage
FROM ubuntu:22.04 AS production

WORKDIR /app

# Create non-root user for security
RUN groupadd --system --gid 1001 bunuser && \
    useradd --system --uid 1001 --gid bunuser bunuser

# Copy only the standalone binary
COPY --from=build --chown=bunuser:bunuser /app/mcp-server /app/mcp-server

# Make binary executable
RUN chmod +x /app/mcp-server

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose the port
EXPOSE 4000

# Switch to non-root user
USER bunuser

# Start the HTTP server
CMD ["/app/mcp-server"]
