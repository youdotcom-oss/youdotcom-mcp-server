import { describe, expect, setDefaultTimeout, test } from 'bun:test';
import type { ExpressAgentMcpResponse } from '../express.schemas';
import { callExpressAgent, formatExpressAgentResponse } from '../express.utils';

const getClientVersion = () => 'MCP/test (You.com; test-client)';

setDefaultTimeout(20_000);

describe('callExpressAgent', () => {
  test('returns answer only (WITHOUT web_search tools)', async () => {
    const result = await callExpressAgent({
      agentInput: { input: 'What is machine learning?' },
      getClientVersion,
    });

    // Verify MCP response structure
    expect(result).toHaveProperty('answer');
    expect(typeof result.answer).toBe('string');
    expect(result.answer.length).toBeGreaterThan(0);

    // Should NOT have results when web_search is not used
    expect(result.results).toBeUndefined();

    expect(result.agent).toBe('express');
  });

  test('returns answer and search results (WITH web_search tools)', async () => {
    const result = await callExpressAgent({
      agentInput: {
        input: 'Latest developments in quantum computing',
        tools: [{ type: 'web_search' }],
      },
      getClientVersion,
    });

    // Verify MCP response has both answer and results
    expect(result).toHaveProperty('answer');
    expect(typeof result.answer).toBe('string');
    expect(result.answer.length).toBeGreaterThan(0);

    expect(result).toHaveProperty('results');
    expect(result.results).toHaveProperty('web');
    expect(Array.isArray(result.results?.web)).toBe(true);
    expect(result.results?.web.length).toBeGreaterThan(0);

    // Verify each search result has required fields
    const firstResult = result.results?.web[0];
    expect(firstResult).toHaveProperty('url');
    expect(firstResult).toHaveProperty('title');
    expect(firstResult).toHaveProperty('snippet');
    expect(typeof firstResult?.url).toBe('string');
    expect(typeof firstResult?.title).toBe('string');
    expect(typeof firstResult?.snippet).toBe('string');
    expect(firstResult?.url.length).toBeGreaterThan(0);
    expect(firstResult?.title.length).toBeGreaterThan(0);

    expect(result.agent).toBe('express');
  }, 30000);

  test('calls progress callback when provided', async () => {
    const progressUpdates: Array<{
      progressToken: string | number;
      progress: number;
      total: number;
      message: string;
    }> = [];

    const sendProgress = async (params: {
      progressToken: string | number;
      progress: number;
      total: number;
      message: string;
    }) => {
      progressUpdates.push(params);
    };

    const result = await callExpressAgent({
      agentInput: { input: 'What is the capital of France?' },
      getClientVersion,
      progressToken: 'test-token-123',
      sendProgress,
    });

    // Verify result is valid
    expect(result).toHaveProperty('answer');
    expect(result.answer.length).toBeGreaterThan(0);

    // Verify progress updates were sent (only 33% since we removed streaming)
    expect(progressUpdates.length).toBeGreaterThanOrEqual(1);

    // Check 33% progress (connecting to API)
    const connectingProgress = progressUpdates.find((p) => p.progress === 33);
    expect(connectingProgress).toBeDefined();
    expect(connectingProgress?.progressToken).toBe('test-token-123');
    expect(connectingProgress?.total).toBe(100);
    expect(connectingProgress?.message).toBe('Connecting to You.com API...');
  });

  test('works without progress callback (backward compatibility)', async () => {
    const result = await callExpressAgent({
      agentInput: { input: 'What is the capital of France?' },
      getClientVersion,
      // No progressToken or sendProgress provided
    });

    // Should work normally without progress tracking
    expect(result).toHaveProperty('answer');
    expect(result.answer.length).toBeGreaterThan(0);
    expect(result.agent).toBe('express');
  });
});

describe('formatExpressAgentResponse', () => {
  test('formats response with answer only (no search results)', () => {
    const mockResponse: ExpressAgentMcpResponse = {
      answer: 'The capital of France is Paris.',
      agent: 'express',
    };

    const result = formatExpressAgentResponse(mockResponse);

    // Verify content array has 1 item (answer only)
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBe(1);

    // Verify answer content
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0]?.text).toContain('Express Agent Answer');
    expect(result.content[0]?.text).toContain(
      'The capital of France is Paris.',
    );

    // Verify structuredContent matches MCP response
    expect(result).toHaveProperty('structuredContent');
    expect(result.structuredContent).toEqual(mockResponse);
    expect(result.structuredContent.answer).toBe(mockResponse.answer);
    expect(result.structuredContent.results).toBeUndefined();
  });

  test('formats response with answer and search results', () => {
    const mockResponse: ExpressAgentMcpResponse = {
      answer:
        'Quantum computing is advancing rapidly with recent breakthroughs in error correction.',
      results: {
        web: [
          {
            url: 'https://example.com/quantum1',
            title: 'Quantum Computing Breakthrough',
            snippet: 'Scientists achieve quantum error correction milestone.',
          },
          {
            url: 'https://example.com/quantum2',
            title: 'Latest in Quantum Research',
            snippet: 'New quantum processor demonstrates superiority.',
          },
        ],
      },
      agent: 'express',
    };

    const result = formatExpressAgentResponse(mockResponse);

    // Verify content array has 2 items (answer + search results)
    expect(result.content.length).toBe(2);

    // Verify answer comes FIRST
    expect(result.content[0]?.type).toBe('text');
    expect(result.content[0]?.text).toContain('Express Agent Answer');
    expect(result.content[0]?.text).toContain(
      'Quantum computing is advancing rapidly',
    );

    // Verify search results come SECOND
    expect(result.content[1]?.type).toBe('text');
    expect(result.content[1]?.text).toContain('Search Results');
    expect(result.content[1]?.text).toContain('Quantum Computing Breakthrough');
    expect(result.content[1]?.text).toContain('https://example.com/quantum1');
    expect(result.content[1]?.text).toContain('Latest in Quantum Research');
    expect(result.content[1]?.text).toContain('https://example.com/quantum2');

    // Verify structuredContent matches MCP response exactly
    expect(result.structuredContent).toEqual(mockResponse);
    expect(result.structuredContent.answer).toBe(mockResponse.answer);
    expect(result.structuredContent.results).toEqual(mockResponse.results!);
    expect(result.structuredContent.results?.web).toHaveLength(2);
  });

  test('structuredContent validation for answer only', () => {
    const mockResponse: ExpressAgentMcpResponse = {
      answer:
        'Neural networks are computational models inspired by biological neurons.',
      agent: 'express',
    };

    const result = formatExpressAgentResponse(mockResponse);

    // Verify structure matches schema
    expect(result.structuredContent).toMatchObject({
      answer: expect.any(String),
      agent: 'express',
    });

    // Ensure no results field when not provided
    expect(result.structuredContent.results).toBeUndefined();
  });

  test('structuredContent validation for answer with results', () => {
    const mockResponse: ExpressAgentMcpResponse = {
      answer:
        'Recent AI breakthroughs include advances in language models and computer vision.',
      results: {
        web: [
          {
            url: 'https://example.com/ai-breakthrough',
            title: 'AI Breakthrough 2025',
            snippet: 'Major advances in artificial intelligence.',
          },
        ],
      },
      agent: 'express',
    };

    const result = formatExpressAgentResponse(mockResponse);

    // Verify structuredContent exactly matches input (no transformation)
    expect(result.structuredContent).toEqual(mockResponse);

    // Verify structure has all expected fields
    expect(result.structuredContent.answer).toBe(
      'Recent AI breakthroughs include advances in language models and computer vision.',
    );
    expect(result.structuredContent.agent).toBe('express');
    expect(result.structuredContent.results).toBeDefined();
    expect(Array.isArray(result.structuredContent.results?.web)).toBe(true);
    expect(result.structuredContent.results?.web.length).toBe(1);

    // Verify search result fields
    const searchResult = result.structuredContent.results?.web[0];
    expect(searchResult?.url).toBe('https://example.com/ai-breakthrough');
    expect(searchResult?.title).toBe('AI Breakthrough 2025');
    expect(searchResult?.snippet).toBe(
      'Major advances in artificial intelligence.',
    );
  });
});
