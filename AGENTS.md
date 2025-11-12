---
description: Development guidelines for You.com MCP Server using Bun runtime.
globs: "*.ts, *.tsx, *.js, *.jsx, package.json"
alwaysApply: false
---

# You.com MCP Server Development Guide

This is a Model Context Protocol (MCP) server that provides web search and AI agent capabilities through You.com's APIs.

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

## API Key Requirements

This server uses a single `YDC_API_KEY` for both Search and Agent APIs, but they use different authentication methods:

- **Search API** (`you-search` tool): Uses `X-API-Key` header for authentication
- **Agent API** (`you-express` tool): Uses `Authorization: Bearer` header for authentication

**Important**: If you receive 401 Unauthorized errors when using agent tools, ensure your You.com API key has permissions for agent endpoints. Some API keys may only have access to the Search API and need to be upgraded for agent access. Contact You.com support if you need agent API access enabled.

## Available MCP Tools

This server provides two MCP tools:

1. **`you-search`** - Web and news search using You.com Search API
   - Returns web results with snippets and news articles
   - Supports filters: freshness, country, safesearch, file types, etc.

2. **`you-express`** - Express Agent for quick AI responses with web search
   - Best for straightforward queries
   - Fast responses with real-time web information
   - Returns an AI-synthesized answer and optionally web search results when web_search tool is used
   - Supports optional progress notifications when clients provide a progress token
   - Uses non-streaming JSON responses from You.com API (stream: false)

## Progress Notifications

The Express agent tool supports MCP progress notifications for long-running queries:

- **Client Support**: Optional - clients can provide a `progressToken` in request metadata
- **Progress Updates**: Sent at key milestones (0%, 33%, 100%)
- **Graceful Fallback**: If no progress token provided, tool works normally without notifications
- **Implementation**: Uses `@modelcontextprotocol/sdk` v1.20.2 progress notification API

**Progress Timeline:**
- 0% - Starting Express agent query
- 33% - Connecting to You.com API
- 100% - Complete (implicit with final response)

## Development Commands

- `bun run dev` - Start MCP server in stdio mode for development
- `bun start` - Start MCP server in HTTP mode on port 4000
- `bun run build` - Build production bundle to bin/
- `bun run test` - Run test suite
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:coverage:watch` - Run tests with coverage in watch mode
- `bun run check` - Run Biome linting and formatting checks
- `bun run check:write` - Auto-fix linting and formatting issues
- `bun run inspect` - Start MCP inspector with environment variables loaded
- `bun run prepare` - Set up git hooks for the repository

## MCP Inspector

The MCP Inspector is a development tool for testing and debugging MCP servers:

- **Command**: `bun run inspect` - Automatically loads environment variables from `.env` file
- **Usage**: Opens an interactive UI to test MCP tools and view server responses
- **Requirement**: Ensure `YDC_API_KEY` is set in your `.env` file before running
- **Documentation**: See [MCP Inspector docs](https://modelcontextprotocol.io/docs/tools/inspector) for more details

## Git Hooks

The project uses git hooks to maintain code quality:

- **Setup**: `bun run prepare` - Installs git hooks (automatically runs after `bun install`)
- **Purpose**: Enforces code quality checks before commits and pushes
- **Note**: The prepare script is configured as a lifecycle script in package.json and runs automatically

## Code Quality with Biome

This project uses Biome for linting and formatting instead of ESLint/Prettier:

- **Configuration**: Uses single quotes, space indentation, and auto-import organization
- **Key Rules**: `noUnusedVariables: error`, `useConst: error`, `noExplicitAny: error` (warn in test files)
- **Style Preference**: Use arrow functions instead of function declarations
- **Commands**: Use `bun run check` to verify code quality, `bun run check:write` to auto-fix

## MCP Server Development

### Tool Registration

Use Zod schemas for tool parameter validation:

```ts
mcp.registerTool(
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
const logger = getLogger(mcp);

try {
  const response = await fetchSearchResults({ searchQuery, YDC_API_KEY });
  // Handle successful response
  return formatSearchResults(response);
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);

  await logger({
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

Use MCP server's built-in logging via the `getLogger()` helper:

```ts
const logger = getLogger(mcp);

// Info logging for successful operations
await logger({
  level: 'info',
  data: `Search successful for query: "${query}" - ${webCount} web results, ${newsCount} news results`
});

// Info logging for no results
await logger({
  level: 'info',
  data: `No results found for query: "${query}"`
});

// Error logging in catch blocks
await logger({
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

Use `bun test` for testing MCP tools with integration tests:

```ts
import { afterAll, beforeAll, test, expect } from 'bun:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client;
let transport: StdioClientTransport;

beforeAll(async () => {
  // Build the project before tests
  await Bun.build({ entrypoints: ['./src/stdio.ts'], outdir: './bin' });

  // Create client and connect
  transport = new StdioClientTransport({ command: 'bun', args: ['./bin/stdio.js'] });
  client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
});

test('search tool returns results', async () => {
  const result = await client.callTool({ name: 'you-search', arguments: { query: 'test' } });
  expect(result.content).toBeDefined();
});

afterAll(async () => {
  await client.close();
});
```

## Deployment Modes

- **Stdio Mode**: `bun run dev` (runs `bun src/stdio.ts`) - For local development and MCP clients
- **HTTP Mode**: `bun start` or `bun src/http.ts` or Docker - Runs on port 4000 (configurable) with `/mcp` endpoint
  - Uses `StreamableHTTPTransport` from `@hono/mcp` for SSE-based streaming
  - Hono web framework with Bearer token authentication
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

### Core Server Files
- `src/stdio.ts` - Stdio transport server entry point (used by `bun run dev`)
- `src/http.ts` - HTTP transport server with Bearer token authentication (Hono app)
- `src/get-mcp-server.ts` - MCP server factory function that creates and configures the server

### Search Tool (you-search)
- `src/search/register-search-tool.ts` - Registers the `you-search` tool with validation and error handling
- `src/search/search.schemas.ts` - Zod schemas for search parameters and response validation
- `src/search/search.utils.ts` - Core search functionality: API calls, query building, result formatting
- `src/search/tests/search.utils.spec.ts` - Unit tests for search utilities

### Express Agent Tool (you-express)
- `src/express/register-express-tool.ts` - Registers the `you-express` agent tool with progress notification support
  - Extracts `progressToken` from request metadata
  - Sends 0% progress notification before API call (line 36-44)
  - Passes progress callback to `callExpressAgent()` which sends 33% notification (express.utils.ts line 80-87)
- `src/express/express.schemas.ts` - Zod schemas for Express agent input/output validation
  - Dual schema architecture: API response validation (ExpressAgentApiResponseSchema) + token-efficient MCP output (ExpressAgentMcpResponseSchema)
  - API validates full You.com response with `message.answer` and optional `web_search.results`
  - MCP output returns only essential fields: `answer` (required), `results` (optional), `agent` (optional)
- `src/express/express.utils.ts` - Express agent API calls, response transformation, and formatting
  - `callExpressAgent()` - Calls You.com Express API with non-streaming JSON responses (stream: false) and optional progress callbacks
  - Transforms API response to MCP format: extracts answer from `message.answer` and search results from `web_search.results`
  - `formatExpressAgentResponse()` - Formats MCP response with answer first, then search results (uses shared `formatSearchResultsText()` utility)
  - `agentThrowOnFailedStatus()` - Handles agent API error responses
- `src/express/tests/express.utils.spec.ts` - Unit tests for Express agent utilities

### Shared Utilities
- `src/shared/shared.utils.ts` - Utilities shared across multiple tools
  - `useGetClientVersion()` - Hook that returns a function to format MCP client version information
  - `setUserAgent()` - Creates User-Agent string for API requests
  - `getLogger()` - Creates MCP logging function that wraps server.sendLoggingMessage
  - `checkResponseForErrors()` - Validates API responses for error fields

### Integration Tests
- `src/tests/http.spec.ts` - Integration tests for HTTP server endpoints
- `src/tests/tool.spec.ts` - End-to-end tests for MCP tools
