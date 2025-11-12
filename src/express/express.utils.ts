import {
  checkResponseForErrors,
  formatSearchResultsText,
  setUserAgent,
} from '../shared/shared.utils';
import {
  type ExpressAgentApiResponse,
  ExpressAgentApiResponseSchema,
  type ExpressAgentInput,
  type ExpressAgentMcpResponse,
} from './express.schemas';

// Express Agent Constants
const AGENTS_RUN_URL = 'https://api.you.com/v1/agents/runs';

/**
 * Checks response status and throws appropriate errors for agent API calls
 */
const agentThrowOnFailedStatus = async (response: Response) => {
  const errorCode = response.status;

  const errorData = (await response.json()) as {
    errors?: Array<{ detail?: string }>;
  };

  // Check for error field in 200 responses
  checkResponseForErrors(errorData);

  if (errorCode === 400) {
    throw new Error(`Bad Request:\n${JSON.stringify(errorData)}`);
  } else if (errorCode === 401) {
    throw new Error(
      `Unauthorized: The Agent APIs require a valid You.com API key with agent access. Note: Agent APIs use Bearer token authentication, while Search API uses X-API-Key. Ensure your YDC_API_KEY has permissions for agent endpoints.`,
    );
  } else if (errorCode === 403) {
    throw new Error(
      `Forbidden: You are not allowed to use the requested tool for this agent or tenant`,
    );
  } else if (errorCode === 429) {
    throw new Error('Rate limited by You.com API. Please try again later.');
  }
  throw new Error(`Failed to call agent. Error code: ${errorCode}`);
};

export const callExpressAgent = async ({
  YDC_API_KEY = process.env.YDC_API_KEY,
  agentInput: { input, tools },
  getClientVersion,
  progressToken,
  sendProgress,
}: {
  agentInput: ExpressAgentInput;
  YDC_API_KEY?: string;
  getClientVersion: () => string;
  progressToken?: string | number;
  sendProgress?: (params: {
    progressToken: string | number;
    progress: number;
    total: number;
    message: string;
  }) => Promise<void>;
}) => {
  const requestBody: {
    agent: string;
    input: string;
    stream: boolean;
    tools?: Array<{ type: 'web_search' }>;
  } = {
    agent: 'express',
    input,
    stream: false, // Use non-streaming JSON response
  };

  // Only include tools if provided
  if (tools) {
    requestBody.tools = tools;
  }

  // Progress: Connecting to API (33%)
  if (progressToken && sendProgress) {
    await sendProgress({
      progressToken,
      progress: 33,
      total: 100,
      message: 'Connecting to You.com API...',
    });
  }

  const options = {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${YDC_API_KEY || ''}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': setUserAgent(getClientVersion()),
    }),
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(AGENTS_RUN_URL, options);

  if (!response.ok) {
    await agentThrowOnFailedStatus(response);
  }

  // Parse JSON response directly
  const jsonResponse = await response.json();

  // Check for error field in response
  checkResponseForErrors(jsonResponse);

  // Validate API response schema (full response with all fields)
  const apiResponse: ExpressAgentApiResponse =
    ExpressAgentApiResponseSchema.parse(jsonResponse);

  // Find the answer (always present as message.answer, validated by Zod)
  const answerItem = apiResponse.output.find(
    (item) => item.type === 'message.answer',
  )!;

  // Find search results (optional, present when web_search tool is used)
  const searchItem = apiResponse.output.find(
    (item) => item.type === 'web_search.results',
  );

  // Transform API response to MCP output format (answer + optional search results, token efficient)
  const mcpResponse: ExpressAgentMcpResponse = {
    answer: answerItem.text,
    agent: apiResponse.agent,
  };

  // Transform search results if present
  if (
    searchItem &&
    'content' in searchItem &&
    Array.isArray(searchItem.content)
  ) {
    mcpResponse.results = {
      web: searchItem.content.map((item) => ({
        url: item.url || item.citation_uri || '',
        title: item.title || '',
        snippet: item.snippet || '',
      })),
    };
  }

  return mcpResponse;
};

export const formatExpressAgentResponse = (
  response: ExpressAgentMcpResponse,
) => {
  const _agentId = response.agent || 'express';
  const content: Array<{ type: 'text'; text: string }> = [];

  // 1. Answer first (always present)
  content.push({
    type: 'text',
    text: `Express Agent Answer:\n\n${response.answer}`,
  });

  // 2. Search results second (if present when web_search tool was used)
  if (response.results?.web?.length) {
    const formattedResults = formatSearchResultsText(response.results.web);
    content.push({
      type: 'text',
      text: `\nSearch Results:\n\n${formattedResults}`,
    });
  }

  return {
    content,
    structuredContent: response,
  };
};
