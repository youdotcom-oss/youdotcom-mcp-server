import { StreamableHTTPTransport } from '@hono/mcp';
import { type Context, Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import packageJson from '../package.json' with { type: 'json' };
import { getMCpServer } from './get-mcp-server.js';
import { registerSearchTool } from './search/register-search-tool.js';

const extractBearerToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

const handleMcpRequest = async (c: Context) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    c.status(401);
    c.header('Content-Type', 'text/plain');
    return c.text('Unauthorized: Authorization header required');
  }

  const token = extractBearerToken(authHeader);

  if (!token) {
    c.status(401);
    c.header('Content-Type', 'text/plain');
    return c.text('Unauthorized: Bearer token required');
  }
  const mcpServer = getMCpServer();
  registerSearchTool(mcpServer, token);

  const transport = new StreamableHTTPTransport();
  await mcpServer.connect(transport);
  return transport.handleRequest(c);
};

const app = new Hono();
app.use(trimTrailingSlash());

app.get('/mcp-health', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    service: 'youdotcom-mcp-server',
  });
});

app.all('/mcp', handleMcpRequest);
app.all('/mcp/', handleMcpRequest);

export default app;
