# Supabase MCP Server Setup Guide

## Overview
The Supabase MCP (Model Context Protocol) server has been configured to provide Claude with direct read/write access to your Supabase project.

## Configuration Details

### Installation Location
- Repository cloned to: `/home/lyoncrypt/Desktop/Nuptul/supabase-mcp`
- Built distribution files in: `/home/lyoncrypt/Desktop/Nuptul/supabase-mcp/packages/mcp-server-supabase/dist/`

### MCP Configuration
The MCP server is configured in: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": [
        "/home/lyoncrypt/Desktop/Nuptul/supabase-mcp/packages/mcp-server-supabase/dist/transports/stdio.js"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_311fdd7a569e2ac85970a73dacebd1d496add654"
      }
    }
  }
}
```

### Access Token
- Token Type: Full Access Token
- Token Location: `/home/lyoncrypt/Desktop/Nuptul/Supabase Full Access Token`
- Token Value: `sbp_311fdd7a569e2ac85970a73dacebd1d496add654`

## Available Tools
Once the MCP server is active, Claude will have access to the following Supabase tools:

### Database Operations
- `list_tables` - List all tables in the database
- `select` - Query data from tables
- `insert` - Insert new records
- `update` - Update existing records
- `delete` - Delete records
- `execute_sql` - Execute raw SQL queries

### Project Management
- `list_projects` - List all Supabase projects
- `get_project` - Get project details
- `create_project` - Create new projects
- `pause_project` - Pause a project
- `resume_project` - Resume a paused project

### Edge Functions
- `list_edge_functions` - List all edge functions
- `deploy_edge_function` - Deploy edge functions
- `delete_edge_function` - Delete edge functions

### Development Tools
- `generate_typescript_types` - Generate TypeScript types from database schema
- `create_branch` - Create database branches for development
- `apply_migration` - Apply database migrations

## Usage
To use the Supabase MCP tools in Claude, you need to:

1. Restart Claude Desktop after configuration
2. The tools will be available with their original names (no prefix needed)
3. Example usage: Use the `list_tables` tool to see all database tables

## Security Notes
- The access token provides full access to your Supabase projects
- Keep the token secure and do not share it publicly
- The token is stored in the local MCP configuration file

## Troubleshooting
If the MCP server doesn't work:

1. Check that Node.js is installed: `node --version`
2. Verify the build was successful: Check for files in the dist directory
3. Ensure the configuration file path is correct
4. Check Claude Desktop logs for any error messages

## Project Connection
This MCP server is configured to work with the Nuptul wedding platform project:
- Supabase URL: `https://iwmfxcrzzwpmxomydmuq.supabase.co`
- Project uses the same access token for both development and MCP access