# Complete MCP Servers Setup Guide

## Overview
This document provides a comprehensive guide to all MCP (Model Context Protocol) servers configured for the Nuptul project.

## Configured MCP Servers

### 1. Supabase MCP
**Purpose**: Direct database and project management for Supabase
**Location**: `/home/lyoncrypt/Desktop/Nuptul/supabase-mcp`
**Access Token**: `sbp_311fdd7a569e2ac85970a73dacebd1d496add654`

**Available Tools**:
- Database operations: `list_tables`, `select`, `insert`, `update`, `delete`, `execute_sql`
- Project management: `list_projects`, `get_project`, `create_project`
- Edge functions: `list_edge_functions`, `deploy_edge_function`
- Development: `generate_typescript_types`, `create_branch`, `apply_migration`

### 2. Context7 MCP
**Purpose**: Provides up-to-date documentation and code examples for libraries
**Location**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/context7`
**API Key**: Not required

**Usage**: Add `use context7` to your prompts to fetch current documentation
**Features**: 
- Real-time documentation fetching
- Version-specific code examples
- No hallucinated APIs

### 3. Sequential Thinking MCP
**Purpose**: Structured problem-solving and step-by-step reasoning
**Location**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/mcp-servers-repo/src/sequentialthinking`
**API Key**: Not required

**Features**:
- Step-by-step problem decomposition
- Structured reasoning chains
- Complex problem solving

### 4. Magic MCP by 21st.dev
**Purpose**: AI-powered UI component generation
**Location**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/magic-mcp`
**API Key**: Need to obtain from https://21st.dev/magic/console

**Features**:
- Natural language to React components
- Modern UI library access
- Logo integration via SVGL
- TypeScript support

**Tools**:
- `create_crafted_component` - Generate UI components from descriptions
- `search_and_return_logos` - Access brand assets
- `get_components_for_inspiration` - Browse component examples

### 5. Netlify MCP
**Purpose**: Deployment and site management on Netlify
**Location**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/netlify-mcp`
**Auth Token**: `nfp_Z92vbVtp7iKb6gzgDicRjEYkB8dFycuD82f2`

**Available Tools**:
- Site Management: `create_site`, `list_sites`, `get_site`, `update_site`, `delete_site`
- Deployment: `deploy_site`, `list_deploys`, `get_deploy`, `restore_deploy`
- Domain Management: `add_domain`, `list_domains`, `get_domain`
- Environment Variables: `create_env_var`, `list_env_vars`, `update_env_var`
- Analytics: `get_site_analytics`, `get_deploy_logs`, `get_build_logs`

### 6. Playwright MCP
**Purpose**: Browser automation and web testing
**Location**: Uses npx to run the latest version
**Installation**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/playwright-mcp` (for reference)
**API Key**: Not required

**Features**:
- Fast, lightweight browser automation using accessibility trees
- LLM-friendly - no screenshots or vision models needed
- Deterministic tool application

**Available Tools**:
- `navigate` - Navigate to a URL
- `screenshot` - Take a screenshot of the current page
- `click` - Click on an element
- `type` - Type text into an input field
- `scroll` - Scroll the page
- `hover` - Hover over an element
- `close` - Close the browser

### 7. GitHub MCP
**Purpose**: Repository management, issues, PRs, and workflow automation
**Location**: `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/github-mcp-server`
**Binary**: Pre-built Linux x86_64 binary from official release
**GitHub PAT**: `[REDACTED - stored in secure configuration]`

**Features**:
- Repository Management: Browse code, search files, analyze commits
- Issue & PR Automation: Create, update, manage issues and pull requests
- CI/CD & Workflow Intelligence: Monitor GitHub Actions, analyze builds
- Code Analysis: Security findings, Dependabot alerts, code patterns
- Team Collaboration: Access discussions, manage notifications

**Available Tool Categories**:
- Repository tools: Get repo info, list repos, search code
- Issue/PR tools: Create, update, list, search issues and PRs
- Workflow tools: List runs, get logs, trigger workflows
- User/org tools: Get user info, list org members
- Code tools: Get file contents, tree structure, commits
- Release tools: List releases, create releases

## Configuration File Location
MCP servers are configured in Claude Code using the `claude mcp` command. Configuration is stored in `~/.claude.json`.

### Claude Code MCP Configuration
All servers have been added using:
```bash
claude mcp add <server-name> <command> [args...] --env KEY=value
```

### Current Configuration Status:
- **supabase**: ✓ Connected
- **context7**: ✓ Connected
- **sequential-thinking**: ✓ Connected
- **magic**: ✓ Connected (with API key)
- **netlify**: ✓ Connected
- **playwright**: ✓ Connected
- **github**: ✓ Connected

## Setup Instructions

### Initial Setup (Already Completed)
1. All repositories have been cloned to `/home/lyoncrypt/Desktop/Nuptul/mcp-servers/`
2. Dependencies installed for each server
3. Projects built where necessary
4. Configuration file created at `~/.config/claude/claude_desktop_config.json`

### To Activate the MCP Servers
MCP servers are immediately available in Claude Code after being added with `claude mcp add`. No restart required.

### Accessing Tools
- **Supabase**: Tools available directly (e.g., `list_tables`, `execute_sql`)
- **Context7**: Add `use context7` to your prompts
- **Sequential Thinking**: Will activate automatically for complex reasoning tasks
- **Magic**: Use tools like `create_crafted_component` (API key configured)
- **Netlify**: Use deployment tools directly (e.g., `list_sites`, `deploy_site`)
- **Playwright**: Browser automation tools (e.g., `navigate`, `click`, `type`)
- **GitHub**: Repository and workflow tools (e.g., `list-repos`, `create-issue`)

## Important Notes

### API Keys Status
- ✅ **Supabase**: Configured with full access token
- ✅ **Netlify**: Configured with auth token
- ✅ **Magic**: Configured with API key
- ✅ **GitHub**: Configured with Personal Access Token
- ✅ **Context7**: No API key required
- ✅ **Sequential Thinking**: No API key required
- ✅ **Playwright**: No API key required

### Security Considerations
1. All tokens are stored locally in the MCP configuration
2. Never commit the configuration file to version control
3. Tokens provide full access to respective services
4. Rotate tokens regularly for security

### Troubleshooting
If any MCP server doesn't work:
1. Ensure Node.js is installed: `node --version`
2. Check that the build files exist in the specified paths
3. Verify the configuration file syntax is correct
4. Check Claude Desktop logs for error messages
5. Ensure you've restarted Claude Desktop after configuration

## Next Steps
1. **Test Each Server**: Try using tools from each server to verify they're working
2. **Check Server Status**: Run `claude mcp list` to see all connected servers
3. **View Available Tools**: Run `/mcp` in Claude to see available tools
4. **Start Using**: All servers are ready for immediate use

## Related Documentation
- Supabase MCP Setup: `/home/lyoncrypt/Desktop/Nuptul/nuptul-deploy-host/development Files/supabase-mcp-setup.md`
- Project Credentials: `/home/lyoncrypt/Desktop/Nuptul/nuptul-deploy-host/development Files/credentials.md`
- API Keys: `/home/lyoncrypt/Desktop/Nuptul/api keys.md`