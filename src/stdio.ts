#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getMCpServer } from './get-mcp-server.js';
import { registerSearchTool } from './search/register-search-tool.js';

const YDC_API_KEY = process.env.YDC_API_KEY;

try {
  const mcpServer = getMCpServer();
  registerSearchTool(mcpServer, YDC_API_KEY);

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
