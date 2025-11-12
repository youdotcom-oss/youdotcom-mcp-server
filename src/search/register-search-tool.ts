import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getLogger } from '../shared/shared.utils';
import { SearchQuerySchema, SearchResponseSchema } from './search.schemas';
import { fetchSearchResults, formatSearchResults } from './search.utils';

export const registerSearchTool = ({
  mcp,
  YDC_API_KEY,
  getClientVersion,
}: {
  mcp: McpServer;
  YDC_API_KEY?: string;
  getClientVersion: () => string;
}) => {
  mcp.registerTool(
    'you-search',
    {
      title: 'You.com Search',
      description:
        'Performs a web and news search using the You.com Search API and returns a formatted list of results.',
      inputSchema: SearchQuerySchema.shape,
      outputSchema: SearchResponseSchema.shape,
    },
    async (searchQuery) => {
      const logger = getLogger(mcp);
      try {
        const response = await fetchSearchResults({
          searchQuery,
          YDC_API_KEY,
          getClientVersion,
        });

        const webCount = response.results.web?.length ?? 0;
        const newsCount = response.results.news?.length ?? 0;

        if (!webCount && !newsCount) {
          await logger({
            level: 'info',
            data: `No results found for query: "${searchQuery.query}"`,
          });

          return {
            content: [{ type: 'text' as const, text: 'No results found.' }],
            structuredContent: response,
          };
        }

        await logger({
          level: 'info',
          data: `Search successful for query: "${searchQuery.query}" - ${webCount} web results, ${newsCount} news results (${webCount + newsCount} total)`,
        });

        return formatSearchResults(response);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        await logger({
          level: 'error',
          data: `Search API call failed: ${errorMessage}`,
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
