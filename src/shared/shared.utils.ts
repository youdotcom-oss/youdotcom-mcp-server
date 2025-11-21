import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { LoggingMessageNotification } from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../../package.json' with { type: 'json' };

/**
 * Creates User-Agent string for API requests
 * Used by search and express agent API calls
 */
const setUserAgent = (client: string) => `MCP/${packageJson.version} (You.com; ${client})`;

/**
 * Get's function that returns a formatted client version information into a string
 * Used by stdio.ts and http.ts for logging/debugging
 */
export const useGetClientVersion = (mcp: McpServer) => () => {
  const clientVersion = mcp.server.getClientVersion();
  if (clientVersion) {
    const { name, version, title, websiteUrl } = clientVersion;
    return setUserAgent([name, version, title, websiteUrl].filter(Boolean).join('; '));
  }
  return setUserAgent('UNKNOWN');
};

/**
 * Creates a logger function that sends messages through MCP server
 * Used by tool registration files
 */
export const getLogger =
  (mcp: McpServer) => async (params: LoggingMessageNotification['params'], _sessionId?: string) => {
    await mcp.server.sendLoggingMessage(params);
  };

/**
 * Checks if a response object contains an error field and throws if found
 * Handles API responses that return 200 status but contain error messages
 * Used by both search and express agent utilities
 */
export const checkResponseForErrors = (responseData: unknown) => {
  if (typeof responseData === 'object' && responseData !== null && 'error' in responseData) {
    const errorMessage =
      typeof responseData.error === 'string' ? responseData.error : JSON.stringify(responseData.error);
    throw new Error(`You.com API Error: ${errorMessage}`);
  }
  return responseData;
};

/**
 * Generates a mailto link for error reporting with pre-filled context
 * Used by tool error handlers to provide easy error reporting
 */
export const generateErrorReportLink = ({
  errorMessage,
  tool,
  clientInfo,
}: {
  errorMessage: string;
  tool: string;
  clientInfo: string;
}): string => {
  const subject = `MCP Server Issue v${packageJson.version}`;
  const body = `Server Version: v${packageJson.version}
Client: ${clientInfo}
Tool: ${tool}

Error Message:
${errorMessage}

Steps to Reproduce:
1.
2.
3.

Additional Context:
`;

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:support@you.com?${params.toString()}`;
};

/**
 * Generic search result type that works for both Search and Express APIs
 * Used by both search.utils.ts and express.utils.ts
 */
export type GenericSearchResult = {
  url: string;
  title: string;
  description?: string;
  snippet?: string;
  snippets?: string[];
};

/**
 * Format array of search results into display text
 * Used by both search and express agent formatting
 * @param results - Array of search results to format
 * @param includeUrls - Whether to include URLs in the text (default: true)
 */
export const formatSearchResultsText = (results: GenericSearchResult[]): string => {
  return results
    .map((result) => {
      const parts: string[] = [`Title: ${result.title}`];

      // Add description if present (from Search API)
      if (result.description) {
        parts.push(`Description: ${result.description}`);
      }

      // Handle snippets array (from Search API)
      if (result.snippets && result.snippets.length > 0) {
        parts.push(`Snippets:\n- ${result.snippets.join('\n- ')}`);
      }
      // Handle single snippet (from Express API)
      else if (result.snippet) {
        parts.push(`Snippet: ${result.snippet}`);
      }

      return parts.join('\n');
    })
    .join('\n\n');
};
