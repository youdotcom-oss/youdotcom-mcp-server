import { describe, expect, test } from 'bun:test';
import type { SearchResponse } from '../search.schemas';
import { fetchSearchResults, formatSearchResults } from '../search.utils';

describe('fetchSearchResults', () => {
  test('returns valid response structure for basic query', async () => {
    const result = await fetchSearchResults({
      searchQuery: { query: 'latest stock news', count: 5 },
    });

    expect(result).toHaveProperty('results');
    expect(result).toHaveProperty('metadata');
    expect(result.results).toHaveProperty('web');
    expect(result.results).toHaveProperty('news');
    expect(Array.isArray(result.results.web)).toBe(true);
    if (result.results.news) {
      expect(Array.isArray(result.results.news)).toBe(true);
    }
    if (result.metadata?.query) {
      expect(typeof result.metadata.query).toBe('string');
    }
    if (result.metadata?.request_uuid) {
      expect(typeof result.metadata.request_uuid).toBe('string');
    }
  });

  test('handles search with filters', async () => {
    const result = await fetchSearchResults({
      searchQuery: {
        query: 'javascript tutorial',
        count: 3,
        freshness: 'week',
        country: 'US',
      },
    });

    expect(result.results.web?.length).toBeLessThanOrEqual(3);
    if (result.metadata?.query) {
      expect(result.metadata.query).toContain('javascript tutorial');
    }
  });

  test('validates response schema', async () => {
    const result = await fetchSearchResults({
      searchQuery: { query: 'latest technolofy news' },
    });

    // Test that web results have required properties
    // biome-ignore lint/style/noNonNullAssertion: Test
    const webResult = result.results.web![0];

    expect(webResult).toHaveProperty('url');
    expect(webResult).toHaveProperty('title');
    expect(webResult).toHaveProperty('description');
    expect(webResult).toHaveProperty('snippets');
    expect(Array.isArray(webResult?.snippets)).toBe(true);

    // Test that news results have required properties
    // biome-ignore lint/style/noNonNullAssertion: Test
    const newsResult = result.results.news![0];
    expect(newsResult).toHaveProperty('url');
    expect(newsResult).toHaveProperty('title');
    expect(newsResult).toHaveProperty('description');
    expect(newsResult).toHaveProperty('page_age');
  });
});

describe('formatSearchResults', () => {
  test('formats web results correctly', () => {
    const mockResponse: SearchResponse = {
      results: {
        web: [
          {
            url: 'https://example.com',
            title: 'Test Title',
            description: 'Test description',
            snippets: ['snippet 1', 'snippet 2'],
            thumbnail_url: 'https://example.com/thumb.jpg',
            original_thumbnail_url: 'https://example.com/orig.jpg',
            page_age: '2023-01-01T00:00:00',
            authors: ['Author Name'],
            favicon_url: 'https://example.com/favicon.ico',
          },
        ],
        news: [],
      },
      metadata: {
        request_uuid: 'test-uuid',
        query: 'test query',
        latency: 0.1,
      },
    };

    const result = formatSearchResults(mockResponse);

    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('structuredContent');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0]?.text).toContain('WEB RESULTS:');
    expect(result.content[0]?.text).toContain('Test Title');
    expect(result.structuredContent).toBe(mockResponse);
  });

  test('formats news results correctly', () => {
    const mockResponse: SearchResponse = {
      results: {
        web: [],
        news: [
          {
            title: 'News Title',
            description: 'News description',
            page_age: '2023-01-01T00:00:00',
            thumbnail_url: 'https://news.com/thumb.jpg',
            original_thumbnail_url: 'https://news.com/orig.jpg',
            url: 'https://news.com/article',
          },
        ],
      },
      metadata: {
        request_uuid: 'test-uuid',
        query: 'test query',
        latency: 0.1,
      },
    };

    const result = formatSearchResults(mockResponse);

    expect(result.content[0]?.text).toContain('NEWS RESULTS:');
    expect(result.content[0]?.text).toContain('News Title');
    expect(result.content[0]?.text).toContain('Published: 2023-01-01T00:00:00');
  });

  test('formats both web and news results', () => {
    const mockResponse: SearchResponse = {
      results: {
        web: [
          {
            url: 'https://web.com',
            title: 'Web Title',
            description: 'Web description',
            snippets: ['web snippet'],
            thumbnail_url: 'https://web.com/thumb.jpg',
            original_thumbnail_url: 'https://web.com/orig.jpg',
            page_age: '2023-01-01T00:00:00',
            authors: ['Web Author'],
            favicon_url: 'https://web.com/favicon.ico',
          },
        ],
        news: [
          {
            title: 'News Title',
            description: 'News description',
            page_age: '2023-01-01T00:00:00',
            thumbnail_url: 'https://news.com/thumb.jpg',
            original_thumbnail_url: 'https://news.com/orig.jpg',
            url: 'https://news.com/article',
          },
        ],
      },
      metadata: {
        request_uuid: 'test-uuid',
        query: 'test query',
        latency: 0.1,
      },
    };

    const result = formatSearchResults(mockResponse);

    expect(result.content[0]?.text).toContain('WEB RESULTS:');
    expect(result.content[0]?.text).toContain('NEWS RESULTS:');
    expect(result.content[0]?.text).toContain(`=${'='.repeat(49)}`);
  });
});
