# You.com MCP Server

A Model Context Protocol (MCP) server that provides web search functionality using the You.com Search API. Built with Bun runtime for optimal performance and supports multiple transport protocols for compatibility with different MCP clients.

## Features

- **Web and News Search**: Comprehensive search using You.com's unified Search API with advanced search operators
- **Multiple Transport Protocols**: Stdio and Streamable HTTP support
- **Bearer Token Authentication**: Secure API access in HTTP mode
- **TypeScript Support**: Full type safety with Zod schemas
- **Advanced Search Parameters**: Site filtering, file type filtering, language filtering, exact terms, and exclude terms

## Adding to your MCP client

This server can be integrated with MCP clients in two ways:

- **Option 1: Remote Server (Recommended)** - No installation required, uses hosted server at `https://api.you.com/mcp` with HTTP transport and API key authentication
- **Option 2: Local NPM Package** - Install via `npx @youdotcom-oss/mcp` with stdio transport, environment variable authentication, and runs locally on your machine

### Standard Configuration Templates

**Remote Server (Recommended):**
```json
{
  "mcpServers": {
    "ydc-search": {
      "type": "http",
      "url": "https://api.you.com/mcp",
      "headers": {
        "Authorization": "Bearer <you-api-key>"
      }
    }
  }
}
```

**Local NPM Package:**
```json
{
  "mcpServers": {
    "ydc-search": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": {
        "YDC_API_KEY": "<you-api-key>"
      }
    }
  }
}
```

<details>
<summary><strong>Claude Code</strong></summary>

**Quick Setup:**
```bash
# Add using Claude Code CLI (if available)
claude mcp add ydc-search npx @youdotcom-oss/mcp
```

**Manual Setup:**
1. Follow the [Claude Code setup guide](https://docs.anthropic.com/en/docs/claude-code/setup)
2. Create or update `.mcp.json` in your workspace root using the standard configuration template above
3. For remote server: add `"type": "http"` to the configuration
4. For local package: add `"type": "stdio"` to the configuration

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

**Setup:**
Use the standard configuration template above in your Claude Desktop MCP configuration.

**Installation:**
Follow the [Claude Desktop MCP guide](https://docs.anthropic.com/en/docs/build-with-claude/computer-use) for setup.

[Download Claude Desktop](https://claude.ai/download)

</details>

<details>
<summary><strong>Codex</strong></summary>

**Setup:**
Edit `~/.codex/config.toml`:

```toml
[mcp_servers.ydc-search]
command = "npx"
args = ["@youdotcom-oss/mcp"]

[mcp_servers.ydc-search.env]
YDC_API_KEY = "<you-api-key>"
```

[Download Codex](https://github.com/openai/codex)

</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

**GUI Setup (Easiest):**
1. Go to Cursor Settings > Features > MCP
2. Click "+ Add New MCP Server"
3. For remote: Select "Streamable HTTP" transport, URL: `https://api.you.com/mcp`
4. For local: Select "stdio" transport, Command: `npx`, Args: `@youdotcom-oss/mcp`

**Manual Setup:**
Create `.cursor/mcp.json` in your project directory or `~/.cursor/mcp.json` globally using the standard configuration template above.

**Note:** Remove the `"type"` field from the remote server configuration for Cursor.

[Documentation](https://docs.cursor.com/en/context/mcp) | [Download Cursor](https://cursor.com)

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

**Setup:**
Use the standard configuration template above in your Gemini CLI MCP server configuration.

**Installation:**
1. Install [Gemini CLI](https://google-gemini.github.io/gemini-cli/)
2. Follow the [MCP server setup guide](https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html)

[Documentation](https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html) | [Download Gemini CLI](https://google-gemini.github.io/gemini-cli/)

</details>

<details>
<summary><strong>Goose</strong></summary>

**Quick Setup:**
Go to "Advanced settings" → "Extensions" → "Add custom extension"

**Manual Setup:**
Use the standard configuration template above in your Goose extensions configuration.

[Installation Guide](https://block.github.io/goose/docs/getting-started/installation) | [Download Goose](https://block.github.io/goose/)

</details>

<details>
<summary><strong>JetBrains IDEs</strong></summary>

**Setup:**
Configure in your IDE settings using the local NPM package configuration from the standard template above.

**For Remote Server:**
Use [mcp-remote](https://www.npmjs.com/package/mcp-remote) since JetBrains only supports stdio transport:
```json
{
  "mcpServers": {
    "ydc-search": {
      "command": "npx",
      "args": ["mcp-remote", "https://api.you.com/mcp", "--header", "Authorization: Bearer ${YDC_API_KEY}"],
      "env": { "YDC_API_KEY": "<you-api-key>" }
    }
  }
}
```

**Supported IDEs:** IntelliJ IDEA, PyCharm, WebStorm, etc. (requires AI Assistant enabled)

[Documentation](https://www.jetbrains.com/help/ai-assistant/mcp.html)

</details>

<details>
<summary><strong>LM Studio</strong></summary>

**Setup:**
Edit `mcp.json` in LM Studio settings using the standard configuration template above.

**Installation:**
Configure through program settings or edit configuration file manually.

[Download LM Studio](https://lmstudio.ai/)

</details>

<details>
<summary><strong>opencode</strong></summary>

**Setup:**
Edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ydc-search": {
      "type": "local",
      "command": ["npx", "@youdotcom-oss/mcp"],
      "enabled": true,
      "env": { "YDC_API_KEY": "<you-api-key>" }
    }
  }
}
```

**For Remote Server:**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ydc-search": {
      "type": "local",
      "command": ["npx", "mcp-remote", "https://api.you.com/mcp", "--header", "Authorization: Bearer ${YDC_API_KEY}"],
      "enabled": true,
      "env": { "YDC_API_KEY": "<you-api-key>" }
    }
  }
}
```

[Documentation](https://opencode.ai/docs)

</details>

<details>
<summary><strong>Qodo Gen</strong></summary>

**Setup:**
1. Open Qodo Gen chat panel in VSCode or IntelliJ
2. Click "Connect more tools" → "+ Add new MCP"
3. Paste the standard config above
4. Click Save

[Documentation](https://docs.qodo.ai/qodo-documentation/qodo-gen)

</details>

<details>
<summary><strong>VS Code</strong></summary>

**Quick Setup (Command Line):**
```bash
# Add MCP server
code --add-mcp "{\"name\":\"ydc-search\",\"command\":\"npx\",\"args\":[\"@youdotcom-oss/mcp\"],\"env\":{\"YDC_API_KEY\":\"<you-api-key>\"}}"
```

**Manual Setup:**
Create `mcp.json` file in your workspace (`.vscode/mcp.json`) or user profile using the standard configuration template above, but replace `"mcpServers"` with `"servers"`.

**Secure Setup with Input Prompts:**
```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "ydc-api-key",
      "description": "You.com API Key",
      "password": true
    }
  ],
  "servers": {
    "ydc-search": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_API_KEY": "${input:ydc-api-key}" }
    }
  }
}
```

**Requirements:** GitHub Copilot extension must be installed

[Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers#_commandline-configuration) | [Download VS Code](https://code.visualstudio.com/)

</details>

<details>
<summary><strong>Windsurf</strong></summary>

**Setup:**
Use the standard configuration template above.

**Installation:**
Follow MCP documentation for Windsurf-specific setup instructions.

[Documentation](https://docs.windsurf.com/windsurf/cascade/mcp) | [Download Windsurf](https://docs.windsurf.com/windsurf/getting-started)

</details>

<details>
<summary><strong>Zed Editor</strong></summary>

**Setup:**
Add to your Zed `settings.json` using `"context_servers"` instead of `"mcpServers"`:

```json
{
  "context_servers": {
    "ydc-search": {
      "source": "custom",
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": {
        "YDC_API_KEY": "<you-api-key>"
      }
    }
  }
}
```

**For Remote Server:**
Use [mcp-remote](https://www.npmjs.com/package/mcp-remote) to bridge HTTP to stdio:
```json
{
  "context_servers": {
    "ydc-search": {
      "source": "custom",
      "command": "npx",
      "args": ["mcp-remote", "https://api.you.com/mcp", "--header", "Authorization: Bearer ${YDC_API_KEY}"],
      "env": { "YDC_API_KEY": "<you-api-key>" }
    }
  }
}
```

[Setup Instructions](https://zed.dev/docs/ai/mcp) | [Download Zed](https://zed.dev)

</details>

### General Configuration Notes

- **Remote Server:** Recommended for most users - no installation required, just API key
- **NPM Package:** Alternative for local usage or when you prefer running locally
- **HTTP Transport:** Use for remote server connections and web applications
- **Stdio Transport:** Use for local npm package installations and development
- **API Key:** Always required - either as environment variable (stdio) or in headers (http)
- **Docker/Local Development:** See sections below for advanced local development setups

See the [Transport Protocols](#transport-protocols) section for detailed protocol information.

## Building and Running Locally

### Prerequisites

- **Bun 1.2.21 or higher** (replaces Node.js)
- You.com API key (get one at [api.you.com](https://api.you.com))

### Local Workspace Setup

Since this package is not published to npm (marked as private), you need to clone and set it up locally:

```bash
# Clone the repository
git clone <repository-url>
cd you-mcp-server

# Install dependencies
bun install

# Set up your environment file with your You.com API key (optional)
echo "export YDC_API_KEY=<you-api-key>" > .env
```

### Building

```bash
# Build is optional for development, required for production bin executables
bun run build  # Builds only stdio.ts to dist/stdio.js
```

**For MCP Client Integration:**
Use the full path to your local server installation in your `.mcp.json`:

```json
{
  "mcpServers": {
    "ydc-search": {
      "type": "stdio",
      "command": "bun",
      "args": ["/full/path/to/you-mcp-server/src/stdio.ts"],
      "env": {
        "YDC_API_KEY": "<you-api-key>"
      }
    }
  }
}
```

**Alternative using built executable:**
```json
{
  "mcpServers": {
    "ydc-search": {
      "type": "stdio",
      "command": "node",
      "args": ["/full/path/to/you-mcp-server/bin/stdio"],
      "env": {
        "YDC_API_KEY": "<you-api-key>"
      }
    }
  }
}
```

### Configuration

Set up your environment file with your You.com API key:

```bash
echo "export YDC_API_KEY=<you-api-key>" > .env
source .env
```

Replace `<you-api-key>` with your actual API key:
```bash
echo "export YDC_API_KEY=your-actual-api-key-here" > .env
source .env
```

Alternatively, set it as an environment variable:

```bash
export YDC_API_KEY="your-api-key-here"
```

### Available Scripts

- `bun run dev` - Start server in stdio mode for development
- `bun run build` - Build stdio.ts to dist/ for production
- `bun start` - Start HTTP server on port 4000 (or PORT env var)
- `bun run test` - Run test suite
- `bun run check` - Run Biome linting and formatting checks

### Executable Scripts

The project includes executable scripts in `bin/`:
- `./bin/stdio` - Stdio transport server (requires `bun run build` first)
- `./bin/http` - HTTP transport server (runs directly from source)

### Running the Server

**Stdio Mode (Recommended for MCP Clients)** - For local workspace integration:
```bash
# Development mode (direct source)
bun run dev
# or
bun src/stdio.ts

# Production mode (built distribution)
bun run build  # Build first
./bin/stdio    # Run built version
```

**HTTP Mode** - For web applications and remote clients:
```bash
# Default port 4000
bun start
# or
./bin/http

# Custom port
PORT=8080 bun start
# or
PORT=8080 ./bin/http
```

### Docker Deployment

**Build and run with Docker:**

```bash
# Build the optimized Docker image (243MB final size)
docker build -t youdotcom-mcp-server .

# Run the container
docker run -d -p 4000:4000 --name youdotcom-mcp youdotcom-mcp-server
```

**Optimization Features:**
- **Multi-stage build**: Uses standalone binary compilation with `bun build --compile`
- **Minimal base image**: Ubuntu 22.04 with no additional packages
- **Size optimized**: 243MB final image
- **Self-contained**: Includes Bun runtime in compiled binary
- **Security**: Runs as non-root user, minimal attack surface

**Using Docker Compose:**

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  you-mcp-server:
    build: .
    ports:
      - "4000:4000"
    environment:
      - YDC_API_KEY=${YDC_API_KEY}
      - PORT=4000
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

### Claude Code Setup with Docker

To use this MCP server with Claude Code via Docker:

1. **Start the Docker container:**
   ```bash
   docker run -d -p 4000:4000 --name youdotcom-mcp youdotcom-mcp-server
   ```

2. **Configure Claude Code:**
   - Copy `.mcp.example.json` to `.mcp.json`
   - Replace `<you.com api key>` with your actual You.com API key

   ```bash
   cp .mcp.example.json .mcp.json
   ```

   Your `.mcp.json` should look like:
   ```json
   {
     "mcpServers": {
       "ydc-search": {
         "type": "http",
         "url": "http://localhost:4000/mcp",
         "headers": {
           "Authorization": "Bearer <you-api-key>"
         }
       }
     }
   }
   ```

3. **Verify the setup:**
   - The server will be available at `http://localhost:4000/mcp`
   - Health check endpoint: `http://localhost:4000/mcp-health`

## API Reference

### you-search

Performs a comprehensive web and news search using the You.com Search API.

**Parameters:**
- `query` (string, required): The base search query to send to the You.com API. This will be combined with additional filters like site, fileType, and language to create the final search query. You can also use operators directly: + (exact term, e.g., "Enron +GAAP"), - (exclude term, e.g., "guitar -prs"), site: (domain, e.g., "site:uscourts.gov"), filetype: (e.g., "filetype:pdf"), lang: (e.g., "lang:es"). Use parentheses for multi-word phrases (e.g., "+(machine learning)", "-(social media)").
- `site` (string, optional): Search within a specific website domain (e.g., 'github.com')
- `fileType` (string, optional): Filter by a specific file type (e.g., 'pdf', 'doc', 'txt')
- `language` (string, optional): Filter by a specific language using ISO 639-1 code (e.g., 'en', 'es', 'fr')
- `exactTerms` (string, optional): Exact terms with logical operators: 'python AND|tutorial|NOT beginner' (pipe-separated, add AND/OR after terms, default OR). Use parentheses for multi-word phrases (e.g., '(machine learning)|typescript')
- `excludeTerms` (string, optional): Terms to exclude with logical operators: 'spam AND|ads|NOT relevant' (pipe-separated, add AND/OR after terms, default OR). Use parentheses for multi-word phrases (e.g., '(social media)|ads'). Cannot be used with exactTerms.
- `count` (integer, optional): Maximum number of results to return per section. Range: 1-20.
- `freshness` (string, optional): Freshness of results. Options: `day`, `week`, `month`, `year`.
- `offset` (integer, optional): Offset for pagination (calculated in multiples of count). Range: 0-9.
- `country` (string, optional): Country code for localized results. Examples: `US`, `GB`, `DE`, `FR`, `JP`, `CA`, `AU`, etc.
- `safesearch` (string, optional): Content filtering level. Options: `off`, `moderate` (default), `strict`.

**Returns:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Search Results for \"machine learning\":\n\nWEB RESULTS:\n\nTitle: Introduction to Machine Learning\nURL: https://github.com/ml-tutorials/intro\nDescription: A comprehensive guide to machine learning fundamentals\nSnippets:\n- Learn the basics of supervised and unsupervised learning\n- Practical examples with Python and TensorFlow\n\n---\n\nTitle: Machine Learning Course\nURL: https://coursera.org/ml-course\nDescription: Stanford's machine learning course materials\nSnippets:\n- Mathematical foundations of ML algorithms\n- Hands-on programming assignments\n\n==================================================\n\nNEWS RESULTS:\n\nTitle: AI Breakthrough in Medical Diagnosis\nURL: https://techcrunch.com/ai-medical-breakthrough\nDescription: New machine learning model achieves 95% accuracy\nPublished: 2024-01-15T10:30:00"
    }
  ],
  "structuredContent": {
    "results": {
      "web": [
        {
          "url": "https://github.com/ml-tutorials/intro",
          "title": "Introduction to Machine Learning",
          "description": "A comprehensive guide to machine learning fundamentals",
          "snippets": [
            "Learn the basics of supervised and unsupervised learning",
            "Practical examples with Python and TensorFlow"
          ],
          "page_age": "2024-01-10T14:20:00",
          "authors": ["ML Tutorial Team"]
        }
      ],
      "news": [
        {
          "url": "https://techcrunch.com/ai-medical-breakthrough",
          "title": "AI Breakthrough in Medical Diagnosis",
          "description": "New machine learning model achieves 95% accuracy",
          "page_age": "2024-01-15T10:30:00"
        }
      ]
    },
    "metadata": {
      "query": "machine learning",
      "request_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "latency": 0.247
    }
  }
}
```
