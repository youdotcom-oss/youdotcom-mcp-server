#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerExpressTool } from './express/register-express-tool.js';
import { getMCpServer } from './get-mcp-server.js';
import { registerSearchTool } from './search/register-search-tool.js';
import { useGetClientVersion } from './shared/shared.utils.js';

const YDC_API_KEY = process.env.YDC_API_KEY;

try {
  const mcp = getMCpServer();
  const getClientVersion = useGetClientVersion(mcp);

  registerSearchTool({ mcp, YDC_API_KEY, getClientVersion });
  registerExpressTool({ mcp, YDC_API_KEY, getClientVersion });

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
