---
description: Development guidelines for You.com MCP Server using Bun runtime.
globs: "*.ts, *.tsx, *.js, *.jsx, package.json"
alwaysApply: false
---

# You.com MCP Server Development Guide

This is a Model Context Protocol (MCP) server that provides web search capabilities through You.com's Search API.

## Runtime and Package Management

Use Bun instead of Node.js (requires Bun >= 1.2.21):

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env files, so don't use dotenv

## Local Development Setup

Set up your environment file with your You.com API key:

```bash
echo "export YDC_API_KEY=<you-api-key>" > .env
source .env
```

Usage: Replace `<you-api-key>` with your actual API key:
```bash
echo "export YDC_API_KEY=your-actual-api-key-here" > .env
source .env
```

This creates a .env file with your API key and loads it into your shell session.

## Development Commands

- `bun run dev` - Start MCP server in stdio mode for development
- `bun run build` - Build production bundle to dist/
- `bun run test` - Run test suite
- `bun run test:coverage` - Run tests with coverage report
- `bun run check` - Run Biome linting and formatting checks
- `bun run check:write` - Auto-fix linting and formatting issues

## Code Quality with Biome

This project uses Biome for linting and formatting instead of ESLint/Prettier:

- **Configuration**: Uses single quotes, space indentation, and auto-import organization
- **Key Rules**: `noUnusedVariables: error`, `useConst: error`
- **Style Preference**: Use arrow functions instead of function declarations
- **Commands**: Use `bun run check` to verify code quality, `bun run check:write` to auto-fix

## MCP Server Development

### Tool Registration

Use Zod schemas for tool parameter validation:

```ts
server.registerTool(
  'tool-name',
  {
    title: 'Tool Title',
    description: 'Tool description',
    inputSchema: SomeZodSchema.shape,
    outputSchema: ResponseSchema.shape,
  },
  async (parameters) => {
    // Tool implementation
    return {
      content: [{ type: 'text', text: 'Result' }],
      structuredContent: responseData,
    };
  }
);
```

### Error Handling

Use try/catch blocks for error handling and logging:

```ts
try {
  const response = await fetchSearchResults({ searchQuery, YDC_API_KEY });
  // Handle successful response
  return formatSearchResults(response);
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  
  await server.server.sendLoggingMessage({
    level: 'error',
    data: `Search API call failed: ${errorMessage}`,
  });

  return {
    content: [{ type: 'text', text: `Error: ${errorMessage}` }],
    isError: true,
  };
}
```

### Logging Patterns

Use MCP server's built-in logging:

```ts
// Info logging for successful operations
await server.server.sendLoggingMessage({
  level: 'info',
  data: `Search successful for query: "${query}" - ${webCount} web results, ${newsCount} news results`
});

// Info logging for no results
await server.server.sendLoggingMessage({
  level: 'info',
  data: `No results found for query: "${query}"`
});

// Error logging in catch blocks
await server.server.sendLoggingMessage({
  level: 'error',
  data: `Search API call failed: ${errorMessage}`
});
```

## API Integration

### You.com API Key

- Set `YDC_API_KEY` environment variable for development
- HTTP mode supports `Authorization: Bearer <token>` header for per-request keys
- Always validate API responses and handle rate limiting (429 errors)
- Handle 403 errors for invalid API keys

### Testing

Use `bun test` for testing MCP tools:

```ts
import { test, expect } from 'bun:test';
import { createMockServer } from './testUtils';

test('search tool returns results', async () => {
  const server = createMockServer();
  const result = await server.executeSearch({ query: 'test' });
  expect(result.isOk()).toBe(true);
});
```

## Deployment Modes

- **Stdio Mode**: `bun run dev` (runs `bun src/stdio.ts`) - For local development and MCP clients
- **HTTP Mode**: `bun src/http.ts` or Docker - Runs on port 4000 (configurable) with `/mcp` endpoint  
- **Docker Mode**: `docker run -d -p 4000:4000 --name youdotcom-mcp youdotcom-mcp-server` - For containerized deployment
- **Health Check**: GET `/mcp-health` endpoint for monitoring
- **Authentication**: HTTP mode requires `Authorization: Bearer <token>` header

## Claude Code Setup (Local Development)

To test this MCP server with Claude Code during development:

1. **Build and start the Docker container:**
   ```bash
   docker build -t youdotcom-mcp-server .
   docker run -d -p 4000:4000 --name youdotcom-mcp youdotcom-mcp-server
   ```

2. **Configure Claude Code:**
   - Copy `.mcp.example.json` to `.mcp.json` in your workspace
   - Replace `<you.com api key>` with your actual You.com API key
   
   ```bash
   cp .mcp.example.json .mcp.json
   ```

3. **Verify the setup:**
   - Server runs on `http://localhost:4000/mcp`
   - Health check: `http://localhost:4000/mcp-health`

## Architecture

- `src/stdio.ts` - Stdio transport server entry point (used by `bun run dev`)
- `src/http.ts` - HTTP transport server with Bearer token authentication (Hono app)
- `src/get-mcp-server.ts` - MCP server factory function that creates and configures the server
- `src/search/register-search-tool.ts` - Registers the `you-search` tool with validation and error handling
- `src/search/search.schemas.ts` - Zod schemas for search parameters and response validation
- `src/search/search.utils.ts` - Core search functionality: API calls, query building, result formatting
- `src/search/tests/search.utils.spec.ts` - Unit tests for search utilities
- `src/tests/http.spec.ts` - Integration tests for HTTP server endpoints
- `src/tests/tool.spec.ts` - End-to-end tests for the you-search tool functionality
