import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { $ } from 'bun';
import type { SearchResponse } from '../search/search.schemas';

let client: Client;

beforeAll(async () => {
  await $`bun run build`; // 1256
  const transport = new StdioClientTransport({
    command: 'npx',
    args: [Bun.resolveSync('../../bin/stdio', import.meta.dir)],
    env: {
      YDC_API_KEY: process.env.YDC_API_KEY ?? '',
    },
  });

  client = new Client({
    name: 'test-client',
    version: '0.0.1',
  });

  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
});

describe('registerSearchTool', () => {
  test('tool is registered and available', async () => {
    const tools = await client.listTools();

    const searchTool = tools.tools.find((t) => t.name === 'you-search');

    expect(searchTool).toBeDefined();
    expect(searchTool?.title).toBe('You.com Search');
    expect(searchTool?.description).toContain('Performs a web and news search');
  });

  test('performs basic search successfully', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'javascript tutorial',
        count: 3,
      },
    });
    const content = result.content as { type: string; text: string }[];
    expect(result).toHaveProperty('content');
    expect(Array.isArray(content)).toBe(true);
    expect(content[0]).toHaveProperty('type', 'text');
    expect(content[0]).toHaveProperty('text');

    const text = content[0]?.text;
    expect(text).toContain('Search Results for');
    expect(text).toContain('javascript tutorial');
    const structuredContent = result.structuredContent as SearchResponse;
    // Should have structured content
    expect(result).toHaveProperty('structuredContent');
    expect(structuredContent).toHaveProperty('results');
    expect(structuredContent).toHaveProperty('metadata');
  });

  test('handles search with web results formatting', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'react components',
        count: 2,
      },
    });

    const content = result.content as { type: string; text: string }[];
    const text = content[0]?.text;
    expect(text).toContain('WEB RESULTS:');
    expect(text).toContain('Title:');
    expect(text).toContain('URL:');
    expect(text).toContain('Description:');
    expect(text).toContain('Snippets:');

    // Verify structured data
    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.results.web).toBeDefined();
    expect(Array.isArray(structuredContent?.results.web)).toBe(true);
  });

  test('handles search with news results', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'technology news',
        count: 2,
      },
    });

    const content = result.content as { type: string; text: string }[];
    const text = content[0]?.text;

    const structuredContent = result.structuredContent as SearchResponse;
    // Check if news results are included
    if (
      structuredContent?.results.news &&
      structuredContent.results.news.length > 0
    ) {
      expect(text).toContain('NEWS RESULTS:');
      expect(text).toContain('Published:');
      expect(Array.isArray(structuredContent.results.news)).toBe(true);
    }
  });

  test('handles mixed web and news results with proper separation', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'artificial intelligence',
        count: 3,
      },
    });

    const content = result.content as { type: string; text: string }[];
    const text = content[0]?.text;

    // Should have web results
    expect(text).toContain('WEB RESULTS:');

    const structuredContent = result.structuredContent as SearchResponse;
    // If both web and news results exist, check for separator
    if (
      structuredContent?.results.news &&
      structuredContent.results.news.length > 0
    ) {
      expect(text).toContain('NEWS RESULTS:');
      expect(text).toContain('='.repeat(50));
    }
  });

  test('validates required query parameter', async () => {
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {},
      }),
    ).rejects.toThrow();
  });

  test('validates count parameter boundaries', async () => {
    // Test valid count
    const validResult = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test',
        count: 5,
      },
    });

    const content = validResult.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    // Test invalid count (too high)
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          count: 25, // Max is 20
        },
      }),
    ).rejects.toThrow();

    // Test invalid count (too low)
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          count: 0, // Min is 1
        },
      }),
    ).rejects.toThrow();
  });

  test('validates offset parameter boundaries', async () => {
    // Test valid offset
    const validResult = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test',
        offset: 2,
      },
    });

    const content = validResult.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    // Test invalid offset (too high)
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          offset: 15, // Max is 9
        },
      }),
    ).rejects.toThrow();

    // Test invalid offset (negative)
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          offset: -1, // Min is 0
        },
      }),
    ).rejects.toThrow();
  });

  test('handles freshness parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'recent news',
        freshness: 'week',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe('recent news');
  });

  test('handles country parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'local news',
        country: 'US',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe('local news');
  });

  test('handles safesearch parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'educational content',
        safesearch: 'strict',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe('educational content');
  });

  test('validates enum parameters', async () => {
    // Test invalid freshness
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          freshness: 'invalid',
        },
      }),
    ).rejects.toThrow();

    // Test invalid country
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          country: 'XX',
        },
      }),
    ).rejects.toThrow();

    // Test invalid safesearch
    await expect(
      client.callTool({
        name: 'you-search',
        arguments: {
          query: 'test',
          safesearch: 'invalid',
        },
      }),
    ).rejects.toThrow();
  });

  test('validates new string parameters', async () => {
    // Test valid site parameter
    const validSiteResult = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test',
        site: 'github.com',
      },
    });

    const siteStructuredContent =
      validSiteResult.structuredContent as SearchResponse;
    expect(siteStructuredContent?.metadata?.query).toBe('test site:github.com');

    // Test valid fileType parameter
    const validFileTypeResult = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test',
        fileType: 'pdf',
      },
    });

    const fileTypeStructuredContent =
      validFileTypeResult.structuredContent as SearchResponse;
    expect(fileTypeStructuredContent?.metadata?.query).toBe(
      'test fileType:pdf',
    );

    // Test valid language parameter
    const validLanguageResult = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test',
        language: 'en',
      },
    });

    const languageStructuredContent =
      validLanguageResult.structuredContent as SearchResponse;
    expect(languageStructuredContent?.metadata?.query).toBe('test lang:en');
  });

  test('handles empty string values for new parameters', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'test query',
        site: '',
        fileType: '',
        language: '',
        exactTerms: '',
        excludeTerms: '',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toContain('test query');
  });

  test('handles site parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'react components',
        site: 'github.com',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'react components site:github.com',
    );
  });

  test('handles fileType parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'documentation',
        fileType: 'pdf',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'documentation fileType:pdf',
    );
  });

  test('handles language parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'tutorial',
        language: 'es',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe('tutorial lang:es');
  });

  test('handles exactTerms parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'programming',
        exactTerms: 'javascript|typescript',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'programming +javascript AND +typescript',
    );
  });

  test('handles excludeTerms parameter', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'tutorial',
        excludeTerms: 'beginner|basic',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'tutorial -beginner AND -basic',
    );
  });

  test('handles multi-word phrases with parentheses in exactTerms', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'programming',
        exactTerms: '(machine learning)|typescript',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'programming +(machine learning) AND +typescript',
    );
  });

  test('handles multi-word phrases with parentheses in excludeTerms', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'programming',
        excludeTerms: '(social media)|ads',
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'programming -(social media) AND -ads',
    );
  });

  test('handles complex search with multiple parameters', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'machine learning tutorial',
        count: 5,
        offset: 1,
        freshness: 'month',
        country: 'US',
        safesearch: 'moderate',
        site: 'github.com',
        fileType: 'md',
        language: 'en',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toBe(
      'machine learning tutorial site:github.com fileType:md lang:en',
    );

    // Verify results are limited by count
    const webResults = structuredContent?.results.web || [];
    expect(webResults.length).toBeLessThanOrEqual(5);
  });

  test('handles special characters in query', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'C++ programming "hello world"',
      },
    });

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('text');

    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.metadata?.query).toContain('C++');
  });

  test('handles empty search results gracefully', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: '_',
      },
    });

    const content = result.content as { type: string; text: string }[];

    // Should still have content even if no results
    expect(content[0]).toHaveProperty('text');

    const text = content[0]?.text;
    const structuredContent = result.structuredContent as SearchResponse;
    expect(structuredContent?.results.web).toBeUndefined();
    expect(structuredContent?.results.news?.length).toBeUndefined();
    expect(text).toContain('No results found');
  });

  test('validates structured response format', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: `what's the latest tech news`,
        count: 2,
      },
    });

    const structuredContent = result.structuredContent as SearchResponse;
    // Validate structured content schema
    expect(structuredContent).toHaveProperty('results');
    expect(structuredContent).toHaveProperty('metadata');

    const results = structuredContent?.results;
    expect(results).toHaveProperty('web');
    expect(Array.isArray(results?.web)).toBe(true);

    // Check web result structure if results exist
    // biome-ignore lint/style/noNonNullAssertion: Test
    const webResult = results.web![0];
    expect(webResult).toHaveProperty('url');
    expect(webResult).toHaveProperty('title');
    expect(webResult).toHaveProperty('description');
    expect(webResult).toHaveProperty('snippets');
    expect(Array.isArray(webResult?.snippets)).toBe(true);

    // Check news result structure if results exist
    // biome-ignore lint/style/noNonNullAssertion: Test
    const newsResult = results.news![0];
    expect(newsResult).toHaveProperty('url');
    expect(newsResult).toHaveProperty('title');
    expect(newsResult).toHaveProperty('description');
    expect(newsResult).toHaveProperty('page_age');

    // Check metadata structure
    const metadata = structuredContent?.metadata;
    expect(typeof metadata.query).toBe('string');
    expect(typeof metadata.latency).toBe('number');

    if (metadata?.request_uuid) {
      expect(typeof metadata.request_uuid).toBe('string');
    }
  });

  test('returns error when both exactTerms and excludeTerms are provided', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'programming',
        exactTerms: 'javascript',
        excludeTerms: 'beginner',
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as { type: string; text: string }[];
    expect(content[0]?.text).toContain(
      'Cannot specify both exactTerms and excludeTerms - please use only one',
    );
  });

  test('handles API errors gracefully', async () => {
    try {
      await client.callTool({
        name: 'you-search',
        arguments: {
          query: undefined,
        },
      });
    } catch (error) {
      // If it errors, that's also acceptable behavior
      expect(error).toBeDefined();
    }
  });

  test.skip('handles network timeout scenarios', async () => {
    // TODO: How do we test this?
  });

  test('verifies response content type and structure', async () => {
    const result = await client.callTool({
      name: 'you-search',
      arguments: {
        query: 'web development',
        count: 1,
      },
    });

    // Verify content array structure
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toHaveLength(1);

    const content = result.content as { type: string; text: string }[];
    expect(content[0]).toHaveProperty('type', 'text');
    expect(content[0]).toHaveProperty('text');
    expect(typeof content[0]?.text).toBe('string');

    // Should not have isError flag on successful requests
    expect(result.isError).toBeUndefined();
  });
});
