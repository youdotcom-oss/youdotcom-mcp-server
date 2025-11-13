import { describe, expect, test } from 'bun:test';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setUserAgent, useGetClientVersion } from '../shared.utils';

describe('useGetClientVersion', () => {
  test('returns formatted string with all fields present', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '1.0.0',
          title: 'Test Client',
          websiteUrl: 'https://example.com',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('test-client; 1.0.0; Test Client; https://example.com');
  });

  test('returns formatted string with name and version only', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '1.0.0',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('test-client; 1.0.0');
  });

  test('returns UNKNOWN when no client version available', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => null,
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('UNKNOWN');
  });

  test('returns UNKNOWN when getClientVersion returns undefined', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => undefined,
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('UNKNOWN');
  });

  test('filters out empty strings from fields', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '1.0.0',
          title: '', // Empty string should be filtered out
          websiteUrl: 'https://example.com',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('test-client; 1.0.0; https://example.com');
    expect(result).not.toContain(';;'); // No double semicolons
  });

  test('filters out null values from fields', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '1.0.0',
          title: null, // Null should be filtered out
          websiteUrl: 'https://example.com',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('test-client; 1.0.0; https://example.com');
  });

  test('handles partial fields - name, version, and title only', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'Claude Desktop',
          version: '0.7.6',
          title: 'Claude Desktop App',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('Claude Desktop; 0.7.6; Claude Desktop App');
  });

  test('handles Claude Desktop client info format', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'Claude Desktop',
          version: '0.7.6',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const result = getClientVersion();

    expect(result).toBe('Claude Desktop; 0.7.6');
  });

  test('returns a function that can be called multiple times', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '1.0.0',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);

    // Call multiple times to ensure consistent results
    const result1 = getClientVersion();
    const result2 = getClientVersion();
    const result3 = getClientVersion();

    expect(result1).toBe('test-client; 1.0.0');
    expect(result2).toBe('test-client; 1.0.0');
    expect(result3).toBe('test-client; 1.0.0');
  });
});

describe('setUserAgent', () => {
  test('formats User-Agent with client version', () => {
    const client = 'test-client; 1.0.0';
    const userAgent = setUserAgent(client);

    expect(userAgent).toMatch(
      /^MCP\/[\d.]+ \(You\.com; test-client; 1\.0\.0\)$/,
    );
  });

  test('formats User-Agent with UNKNOWN client', () => {
    const client = 'UNKNOWN';
    const userAgent = setUserAgent(client);

    expect(userAgent).toMatch(/^MCP\/[\d.]+ \(You\.com; UNKNOWN\)$/);
  });

  test('formats User-Agent with Claude Desktop client', () => {
    const client = 'Claude Desktop; 0.7.6';
    const userAgent = setUserAgent(client);

    expect(userAgent).toMatch(
      /^MCP\/[\d.]+ \(You\.com; Claude Desktop; 0\.7\.6\)$/,
    );
  });

  test('formats User-Agent with detailed client info', () => {
    const client = 'test-client; 1.0.0; Test Client App; https://example.com';
    const userAgent = setUserAgent(client);

    expect(userAgent).toMatch(
      /^MCP\/[\d.]+ \(You\.com; test-client; 1\.0\.0; Test Client App; https:\/\/example\.com\)$/,
    );
  });

  test('User-Agent starts with MCP version', () => {
    const client = 'test-client';
    const userAgent = setUserAgent(client);

    expect(userAgent).toMatch(/^MCP\/\d+\.\d+\.\d+/);
  });

  test('User-Agent includes You.com identifier', () => {
    const client = 'test-client';
    const userAgent = setUserAgent(client);

    expect(userAgent).toContain('You.com');
  });

  test('User-Agent format matches expected pattern', () => {
    const client = 'test-client; 1.0.0';
    const userAgent = setUserAgent(client);

    // Should match pattern: MCP/{version} (You.com; {client})
    expect(userAgent).toMatch(/^MCP\/[\d.]+ \(You\.com; .+\)$/);
  });
});

describe('useGetClientVersion and setUserAgent integration', () => {
  test('work together to create proper User-Agent string', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'Claude Desktop',
          version: '0.7.6',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const clientString = getClientVersion();
    const userAgent = setUserAgent(clientString);

    expect(clientString).toBe('Claude Desktop; 0.7.6');
    expect(userAgent).toMatch(
      /^MCP\/[\d.]+ \(You\.com; Claude Desktop; 0\.7\.6\)$/,
    );
  });

  test('handle UNKNOWN client gracefully', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => null,
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const clientString = getClientVersion();
    const userAgent = setUserAgent(clientString);

    expect(clientString).toBe('UNKNOWN');
    expect(userAgent).toMatch(/^MCP\/[\d.]+ \(You\.com; UNKNOWN\)$/);
  });

  test('create User-Agent with all client fields', () => {
    const mockMcp = {
      server: {
        getClientVersion: () => ({
          name: 'test-client',
          version: '2.0.0',
          title: 'Test Client',
          websiteUrl: 'https://test.com',
        }),
      },
    } as unknown as McpServer;

    const getClientVersion = useGetClientVersion(mockMcp);
    const clientString = getClientVersion();
    const userAgent = setUserAgent(clientString);

    expect(clientString).toBe(
      'test-client; 2.0.0; Test Client; https://test.com',
    );
    expect(userAgent).toMatch(
      /^MCP\/[\d.]+ \(You\.com; test-client; 2\.0\.0; Test Client; https:\/\/test\.com\)$/,
    );
  });
});
