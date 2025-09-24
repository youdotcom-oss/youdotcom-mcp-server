import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import packageJson from '../package.json' with { type: 'json' };

export const getMCpServer = () =>
  new McpServer(
    {
      name: 'You.com',
      version: packageJson.version,
    },
    {
      capabilities: {
        logging: {},
        tools: { listChanged: true },
      },
      instructions: 'Use this server to search the web using You.com.',
    },
  );
