import * as z from 'zod/v3';

export const SearchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .describe(`The base search query to send to the You.com API.
  This will be combined with additional filters like site, fileType, and language to create the final search query.
  You can also use operators directly: + (exact term, e.g., "Enron +GAAP"), - (exclude term, e.g., "guitar -prs"), site: (domain, e.g., "site:uscourts.gov"), filetype: (e.g., "filetype:pdf"), lang: (e.g., "lang:es"). Use parentheses for multi-word phrases (e.g., "+(machine learning)", "-(social media)").`),
  count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe(
      `Specifies the maximum number of results to return per section.
      Range 1 ≤ count ≤ 20.`,
    ),
  freshness: z
    .enum(['day', 'week', 'month', 'year'])
    .optional()
    .describe('Specifies the freshness of the results to return.'),
  offset: z
    .number()
    .int()
    .min(0)
    .max(9)
    .optional()
    .describe(`Indicates the offset for pagination.
      The offset is calculated in multiples of count.
      For example, if count = 5 and offset = 1, results 5–10 will be returned.
      Range 0 ≤ offset ≤ 9.`),
  country: z
    .enum([
      'AR',
      'AU',
      'AT',
      'BE',
      'BR',
      'CA',
      'CL',
      'DK',
      'FI',
      'FR',
      'DE',
      'HK',
      'IN',
      'ID',
      'IT',
      'JP',
      'KR',
      'MY',
      'MX',
      'NL',
      'NZ',
      'NO',
      'CN',
      'PL',
      'PT',
      'PH',
      'RU',
      'SA',
      'ZA',
      'ES',
      'SE',
      'CH',
      'TW',
      'TR',
      'GB',
      'US',
    ])
    .optional()
    .describe('Specifies the Country Code for search'),
  safesearch: z
    .enum(['off', 'moderate', 'strict'])
    .optional()
    .describe(
      `Configures the safesearch filter for content moderation.
      * off - no filtering applied.
      * moderate - moderate content filtering (default).
      * strict - strict content filtering.`,
    ),
  site: z
    .string()
    .optional()
    .describe("Search within a specific website domain (e.g., 'github.com')"),
  fileType: z
    .string()
    .optional()
    .describe("Filter by a specific file type (e.g., 'pdf', 'doc', 'txt')"),
  language: z
    .string()
    .optional()
    .describe(
      "Filter by a specific language using ISO 639-1 code (e.g., 'en', 'es', 'fr')",
    ),
  excludeTerms: z
    .string()
    .optional()
    .describe(
      "Terms to exclude with logical operators: 'spam AND|ads|NOT relevant' (pipe-separated, add AND/OR after terms, default OR)",
    ),
  exactTerms: z
    .string()
    .optional()
    .describe(
      "Exact terms with logical operators: 'python AND|tutorial|NOT beginner' (pipe-separated, add AND/OR after terms, default OR)",
    ),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const WebResultSchema = z.object({
  url: z.string().describe('The URL of the specific search result.'),
  title: z.string().describe(`
    The title or name of the search result.
    Example: "The World's Greatest Search Engine!"
  `),
  description: z.string().describe(`
    A brief description of the content of the search result.
    Example: "Search on YDC"
  `),
  snippets: z
    .array(z.string())
    .describe(
      'An array of text snippets from the search result, providing a preview of the content.',
    ),
  thumbnail_url: z
    .string()
    .optional()
    .describe(`
    URL of the thumbnail.
    Example: "https://www.somethumbnailsite.com/thumbnail.jpg"
  `),
  original_thumbnail_url: z
    .string()
    .optional()
    .describe(`
    URL of the original thumbnail.
    Example: "https://www.somethumbnailsite.com/thumbnail.jpg"
  `),
  page_age: z
    .string()
    .optional()
    .describe(`
    The age of the search result.
    Example: "2025-06-25T11:41:00"
  `),
  authors: z
    .array(z.string())
    .optional()
    .describe('An array of authors of the search result.'),
  favicon_url: z
    .string()
    .optional()
    .describe(`
    The URL of the favicon of the search result's domain.
    Example: "https://someurl.com/favicon"
  `),
});

export type WebResult = z.infer<typeof WebResultSchema>;

export const NewsResultSchema = z.object({
  title: z.string().describe(`
    The title of the news result.
    Example: "Exclusive | You.com becomes the backbone of the EU's AI strategy"
  `),
  description: z.string().describe(`
    A brief description of the content of the news result.
    Example: "As the EU's AI strategy is being debated, You.com becomes the backbone of the EU's AI strategy."
  `),
  page_age: z.string().describe(`
    UTC timestamp of the article's publication date.
    Example: "2025-06-25T11:41:00"
  `),
  thumbnail_url: z
    .string()
    .optional()
    .describe(`
    URL of the thumbnail.
    Example: "https://www.somethumbnailsite.com/thumbnail.jpg"
  `),
  original_thumbnail_url: z
    .string()
    .optional()
    .describe(`
    URL of the original thumbnail.
    Example: "https://www.somethumbnailsite.com/thumbnail.jpg"
  `),
  url: z.string().describe(`
    The URL of the news result.
    Example: "https://www.you.com/news/eu-ai-strategy-youcom"
  `),
});

export type NewsResult = z.infer<typeof NewsResultSchema>;

export const MetadataSchema = z.object({
  request_uuid: z
    .string()
    .describe(`
      The request id of the query sent to the You.com API
      Example: "942ccbdd-7705-4d9c-9d37-4ef386658e90"
    `)
    .optional(),
  query: z.string().describe(`The query to sent to the You.com API
    Example: "China"`),
  latency: z.number().describe(`
    The latency of the query sent to the You.com API
    Example: 0.123`),
});

export type Metadata = z.infer<typeof MetadataSchema>;

export const SearchResponseSchema = z.object({
  results: z.object({
    web: z.array(WebResultSchema).optional(),
    news: z.array(NewsResultSchema).optional(),
  }),
  metadata: MetadataSchema.partial(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
