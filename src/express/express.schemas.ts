import * as z from 'zod/v3';

export const ExpressAgentInputSchema = z.object({
  input: z
    .string()
    .min(1, 'Input is required')
    .describe(
      'The query or prompt to send to the Express agent. Example: "What is the capital of France?"',
    ),
  tools: z
    .array(
      z.object({
        type: z
          .enum(['web_search'])
          .describe(
            'Tool type: currently only "web_search" is supported for Express agent',
          ),
      }),
    )
    .optional()
    .describe(
      'Tools the system can call to expand its capabilities, providing more precise answers. Currently supports web search only.',
    ),
});

export type ExpressAgentInput = z.infer<typeof ExpressAgentInputSchema>;

// API Response Schema - Validates the full response from You.com API

// Search result content item from web_search.results
const ApiSearchResultItemSchema = z.object({
  source_type: z.string().optional(),
  citation_uri: z.string().optional(),
  url: z.string(),
  title: z.string(),
  snippet: z.string(),
  thumbnail_url: z.string().optional(),
  provider: z.any().optional(),
});

// Union of possible output item types from API
export const ExpressAgentApiOutputItemSchema = z.union([
  // web_search.results type - has content array, no text
  z.object({
    type: z.literal('web_search.results'),
    content: z.array(ApiSearchResultItemSchema),
  }),
  // message.answer type - has text, no content
  z.object({
    type: z.literal('message.answer'),
    text: z.string(),
  }),
]);

export type ExpressAgentApiOutputItem = z.infer<
  typeof ExpressAgentApiOutputItemSchema
>;

export const ExpressAgentApiResponseSchema = z
  .object({
    output: z.array(ExpressAgentApiOutputItemSchema),
    agent: z
      .string()
      .optional()
      .describe('The agent identifier at the response level.'),
    mode: z.string().optional().describe('The mode used for the agent.'),
    input: z
      .array(z.any())
      .optional()
      .describe('The input messages sent to the agent.'),
  })
  .passthrough();

export type ExpressAgentApiResponse = z.infer<
  typeof ExpressAgentApiResponseSchema
>;

// MCP Output Schema - Defines what we return to the MCP client (answer + optional search results, token efficient)

// Search result item for MCP output
export const McpSearchResultItemSchema = z.object({
  url: z.string().describe('The URL of the search result.'),
  title: z.string().describe('The title of the search result.'),
  snippet: z.string().describe('A text snippet from the search result.'),
});

export type McpSearchResultItem = z.infer<typeof McpSearchResultItemSchema>;

// MCP response structure: answer (always) + results (optional when web_search used)
export const ExpressAgentMcpResponseSchema = z.object({
  answer: z.string().describe('The AI-synthesized answer from Express agent.'),
  results: z
    .object({
      web: z
        .array(McpSearchResultItemSchema)
        .describe('Array of web search results.'),
    })
    .optional()
    .describe('Web search results when web_search tool is used.'),
  agent: z
    .string()
    .optional()
    .describe('The agent identifier at the response level.'),
});

export type ExpressAgentMcpResponse = z.infer<
  typeof ExpressAgentMcpResponseSchema
>;

// Legacy exports for backward compatibility
export const ExpressAgentResponseSchema = ExpressAgentMcpResponseSchema;
export type ExpressAgentResponse = ExpressAgentMcpResponse;

export const ExpressAgentErrorSchema = z.object({
  errors: z.array(
    z.object({
      status: z.string(),
      code: z.string(),
      title: z.string(),
      detail: z.string(),
    }),
  ),
});

export type ExpressAgentError = z.infer<typeof ExpressAgentErrorSchema>;
