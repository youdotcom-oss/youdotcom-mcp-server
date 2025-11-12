import { StreamableHTTPTransport } from '@hono/mcp';
import { type Context, Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import packageJson from '../package.json' with { type: 'json' };
import { registerExpressTool } from './express/register-express-tool.js';
import { getMCpServer } from './get-mcp-server.js';
import { registerSearchTool } from './search/register-search-tool.js';
import { useGetClientVersion } from './shared/shared.utils.js';

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

  const YDC_API_KEY = extractBearerToken(authHeader);

  if (!YDC_API_KEY) {
    c.status(401);
    c.header('Content-Type', 'text/plain');
    return c.text('Unauthorized: Bearer token required');
  }
  const mcp = getMCpServer();
  const getClientVersion = useGetClientVersion(mcp);

  registerSearchTool({
    mcp,
    YDC_API_KEY,
    getClientVersion,
  });
  registerExpressTool({ mcp, YDC_API_KEY, getClientVersion });

  const transport = new StreamableHTTPTransport();
  await mcp.connect(transport);
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
