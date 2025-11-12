import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getLogger } from '../shared/shared.utils';
import {
  ExpressAgentInputSchema,
  ExpressAgentResponseSchema,
} from './express.schemas';
import { callExpressAgent, formatExpressAgentResponse } from './express.utils';

export const registerExpressTool = ({
  mcp,
  YDC_API_KEY,
  getClientVersion,
}: {
  mcp: McpServer;
  YDC_API_KEY?: string;
  getClientVersion: () => string;
}) => {
  mcp.registerTool(
    'you-express',
    {
      title: 'You.com Express Agent',
      description:
        'Calls the You.com Express agent for quick AI-powered responses with optional web search capabilities. Returns an AI-synthesized answer and optionally web search results when the web_search tool is used. Best for straightforward queries that benefit from real-time web information.',
      inputSchema: ExpressAgentInputSchema.shape,
      outputSchema: ExpressAgentResponseSchema.shape,
    },
    async (agentInput, extra) => {
      const logger = getLogger(mcp);

      // Extract progress token from request metadata (if provided by client)
      const progressToken = extra?._meta?.progressToken;

      try {
        // Send initial progress notification if client provided a progress token
        if (progressToken) {
          await mcp.server.notification({
            method: 'notifications/progress',
            params: {
              progressToken,
              progress: 0,
              total: 100,
              message: 'Starting Express agent query...',
            },
          });
        }

        const response = await callExpressAgent({
          agentInput,
          YDC_API_KEY,
          getClientVersion,
          progressToken,
          sendProgress: progressToken
            ? async (params) => {
                await mcp.server.notification({
                  method: 'notifications/progress',
                  params,
                });
              }
            : undefined,
        });

        await logger({
          level: 'info',
          data: `Express agent call successful for input: "${agentInput.input}"`,
        });

        return formatExpressAgentResponse(response);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        await logger({
          level: 'error',
          data: `Express agent call failed: ${errorMessage}`,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
};
