# You.com MCP Server

A Model Context Protocol (MCP) server that provides web search, AI-powered answers, and content extraction using You.com APIs. Built with Bun runtime for optimal performance and supports multiple transport protocols for compatibility with different MCP clients.

## Features

- **Web and News Search**: Comprehensive search using You.com's unified Search API with advanced search operators
- **AI-Powered Express Agent**: Fast responses with optional real-time web search integration
- **Content Extraction**: Extract and retrieve full content from web pages in markdown or HTML format
- **Multiple Transport Protocols**: Stdio and Streamable HTTP support
- **Bearer Token Authentication**: Secure API access in HTTP mode
- **TypeScript Support**: Full type safety with Zod schemas
- **Advanced Search Parameters**: Site filtering, file type filtering, language filtering, exact terms, and exclude terms

## Getting Started

Get up and running with the You.com MCP Server in 4 quick steps:

### 1. Get Your API Key

Visit [you.com/platform/api-keys](https://you.com/platform/api-keys) to get your You.com API key. Keep this key secure - you'll need it for configuration.

### 2. Choose Your Setup

**Remote Server (Recommended)** - No installation, always up-to-date, just add the URL and API key
- Use `https://api.you.com/mcp` with HTTP transport
- Authentication via `Authorization: Bearer <your-key>` header

**NPM Package** - Runs locally on your machine
- Use `npx @youdotcom-oss/mcp` with stdio transport
- Authentication via `YDC_API_KEY` environment variable
- Requires Bun or Node.js

### 3. Configure Your Client

Choose your MCP client from the [detailed setup guides](#adding-to-your-mcp-client) below. Most clients use this basic structure:

**Remote Server:**
```json
{
  "mcpServers": {
    "ydc-search": {
      "type": "http",
      "url": "https://api.you.com/mcp",
      "headers": { "Authorization": "Bearer <you-api-key>" }
    }
  }
}
```

**NPM Package:**
```json
{
  "mcpServers": {
    "ydc-search": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_API_KEY": "<you-api-key>" }
    }
  }
}
```

### 4. Test Your Setup

Ask your AI agent a simple query to verify everything works:
- "Search the web for the latest news about artificial intelligence"
- "What is the capital of France?" (with web search)
- "Extract the content from https://example.com"

Your agent will automatically use the appropriate tool based on your natural language request.

## Adding to your MCP client

Detailed configuration instructions for specific MCP clients. See [Getting Started](#getting-started) above for a quick overview.

### Standard Configuration Templates

**Configuration Notes:**
- Remote server recommended for most users (no installation, always up-to-date)
- NPM package for local usage or self-hosting scenarios
- HTTP transport for remote connections; stdio transport for local packages
- API key always required (header for HTTP, environment variable for stdio)

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

## Available Tools

This MCP server provides three tools that work seamlessly with your AI agent through natural language:

### you-search
Comprehensive web and news search with advanced filtering capabilities. Perfect for finding current information, research articles, documentation, and news stories.

**When to use**: When you need to search the web for information, filter by specific sites/file types, or get the latest news on a topic.

### you-express
Fast AI-powered agent that provides synthesized answers with optional real-time web search. Ideal for straightforward questions that benefit from AI interpretation.

**When to use**: When you want a direct answer to a question, with optional web search for up-to-date context and citations.

### you-contents
Extract full page content from URLs in markdown or HTML format. Useful for documentation analysis, content processing, and batch URL extraction.

**When to use**: When you need to extract and analyze content from web pages, either for reading or processing in your workflow.

---

**Note**: Your MCP client automatically shows you all available parameters and their descriptions when you use these tools. Simply ask your AI agent in natural language what you want to do, and it will orchestrate the appropriate tool calls for you.

## Use Cases & Examples

Here are common scenarios showing when and how to use each tool with natural language queries:

### Research & Information Gathering

**Use you-search when:**
- "Find recent research papers about quantum computing on arxiv.org"
- "Search for TypeScript documentation about generics"
- "Get the latest news about renewable energy from the past week"
- "Find PDF files about machine learning algorithms"

**Use you-express when:**
- "What are the key differences between REST and GraphQL?"
- "Explain how quantum entanglement works"
- "What happened in the tech industry today?" (with web search enabled)
- "Summarize the main features of the latest Python release"

### Content Extraction & Analysis

**Use you-contents when:**
- "Extract the content from this blog post: https://example.com/article"
- "Get the documentation from these three URLs in markdown format"
- "Pull the HTML content from this page preserving the layout"
- "Batch extract content from these 5 documentation pages"

### Combined Workflows

Your AI agent can combine multiple tools in a single conversation:
1. **Research + Extract**: "Search for the best TypeScript tutorials, then extract the content from the top 3 results"
2. **Question + Deep Dive**: "What is WebAssembly? Then search for real-world examples and extract code samples"
3. **News + Analysis**: "Find recent articles about AI regulation, then summarize the key points"

### Pro Tips

- **Be specific**: Include domains, date ranges, or file types when searching
- **Natural language**: You don't need to memorize parameters - just describe what you want
- **Follow up**: Ask clarifying questions to refine results
- **Combine tools**: Let your agent orchestrate multiple tool calls for complex workflows

## Troubleshooting & Support

### Common Issues

**Server not connecting:**
- Verify your API key is correct and properly formatted
- Check that your MCP client configuration matches the template for your setup (remote vs local)
- For HTTP mode: Ensure the Authorization header includes "Bearer " prefix
- For stdio mode: Verify the YDC_API_KEY environment variable is set

**Tool not working:**
- Check your MCP client logs for error messages
- Verify your API key has the necessary permissions
- For remote server: Ensure you can reach https://api.you.com/mcp-health
- For local: Verify Bun or Node.js is installed and the package is properly set up

**Authentication errors:**
- Remote server uses Bearer token authentication in headers
- Local stdio mode uses YDC_API_KEY environment variable
- Make sure you're using the correct authentication method for your setup

### Error Logs

Error messages and detailed logs appear in your MCP client's log output. Check your client's documentation for how to access logs:
- Claude Code: Check terminal output or logs
- Claude Desktop: View logs in application menu
- Cursor: Check MCP server logs in settings
- VS Code: View Output panel for MCP server logs

### Report an Issue

If you encounter a problem, you can report it via email or GitHub:

**Email Support:** support@you.com

**Web Support:** [You.com Support](https://you.com/support/contact-us)

**GitHub Issues:** [Report bugs and feature requests](https://github.com/youdotcom-oss/youdotcom-mcp-server/issues)

**Tip:** When errors occur, check your MCP client logs - they include a pre-filled mailto link with error details for easy reporting.

## For Contributors

Interested in contributing to the You.com MCP Server? We'd love your help!

**Note:** This section is for contributors and self-hosting only. Most users should use the remote server or NPM package from [Getting Started](#getting-started).

### Development Setup

For complete development setup instructions, code style guidelines, testing patterns, and contribution workflow, see [AGENTS.md](./AGENTS.md).

The developer guide includes:
- Local workspace setup with Bun runtime
- Code style preferences and TypeScript guidelines
- MCP-specific patterns and best practices
- Testing strategy and examples
- Git hooks and code quality tools
- API integration details
- Architecture overview with diagrams
- Troubleshooting common issues
- Contributing guidelines with commit conventions

### Local Development & Self-Hosting

**Quick Docker Setup**:
```bash
docker build -t youdotcom-mcp-server .
docker run -d -p 4000:4000 --name youdotcom-mcp youdotcom-mcp-server
```

**Local Workspace Setup**:
```bash
# Clone and install
git clone https://github.com/youdotcom-oss/youdotcom-mcp-server.git
cd youdotcom-mcp-server
bun install

# Set up environment
echo "export YDC_API_KEY=your-api-key-here" > .env
source .env

# Run development server (stdio mode)
bun run dev

# Or run HTTP server (port 4000)
bun start
```

For detailed instructions on building from source, running in different modes, and deployment options, see [AGENTS.md](./AGENTS.md).

### Quick Links

- **Developer Guide**: [AGENTS.md](./AGENTS.md) - Complete technical reference
- **Report Issues**: [GitHub Issues](https://github.com/youdotcom-oss/youdotcom-mcp-server/issues)
- **Source Code**: [GitHub Repository](https://github.com/youdotcom-oss/youdotcom-mcp-server)
- **API Documentation**: [You.com Docs](https://documentation.you.com/get-started/welcome)

### How to Contribute

1. Fork the repository
2. Create a feature branch following naming conventions in AGENTS.md
3. Follow the code style guidelines and use conventional commits
4. Write tests for your changes (maintain >80% coverage)
5. Run quality checks: `bun run check && bun test`
6. Submit a pull request with a clear description

We appreciate all contributions, whether it's:
- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- Test coverage improvements

---

**License**: MIT
**Author**: You.com (https://you.com)
