# Nuptul Deploy Host - Project Documentation

## 🚀 MCP Integration Status

### Docker MCP Gateway
**Status**: ✅ ACTIVE - 200+ specialized tools via Docker containers

**Tool Categories**:
- **GitHub Tools** (60+): Repository management, issues, PRs, workflows
- **Browser Automation** (40+): Web scraping, testing, automation
- **AI Agents**: Claude, OpenAI, browser-based agents
- **Academic Research**: ArXiv, PubMed, Semantic Scholar integration
- **Development Tools**: Code execution, file operations, media processing

**Access**: Tools use prefix `mcp__docker-mcp__[tool_name]`

### Supabase MCP
**Status**: ✅ ACTIVE - Direct database and project management

**Tool Categories**:
- **Database Operations**: `list_tables`, `execute_sql`, `apply_migration`
- **Project Management**: `list_projects`, `create_project`, `pause_project`
- **Edge Functions**: `deploy_edge_function`, `list_edge_functions`
- **Development**: `create_branch`, `generate_typescript_types`

**Access**: Direct tool names (no prefix needed)

### Magic MCP (21st.dev)
**Status**: ✅ ACTIVE - AI-powered UI component generation

**Tool Categories**:
- **Component Creation**: `create_crafted_component` - Natural language to React
- **Logo Integration**: `search_and_return_logos` - Brand assets
- **Design Library**: `get_components_for_inspiration` - Examples

**Access**: Direct tool names (no prefix needed)
**Note**: Requires API key from https://21st.dev/magic/console

### Netlify MCP
**Status**: ✅ ACTIVE - Production deployment and hosting

**Tool Categories**:
- **Site Management**: `create_site`, `list_sites`, `get_site`, `update_site`, `delete_site`
- **Deployment**: `deploy_site`, `list_deploys`, `get_deploy`, `restore_deploy`
- **Domain Management**: `add_domain`, `list_domains`, `get_domain`
- **Environment**: `create_env_var`, `list_env_vars`, `update_env_var`
- **Analytics**: `get_site_analytics`, `get_deploy_logs`, `get_build_logs`

**Access**: Direct tool names (no prefix needed)

### Documentation Structure
- **Main Project Instructions**: THIS FILE (`/CLAUDE.md`)
- **SuperClaude Framework**: `.claude/` directory contains:
  - `MCP.md` - MCP server integration guide
  - `MCP_DOCKER_TOOLS.md` - Complete Docker MCP tool reference
  - `SUPABASE_MCP_TOOLS.md` - Supabase database tools
  - `MAGIC_MCP_TOOLS.md` - UI generation tools
  - `NETLIFY_MCP_TOOLS.md` - Deployment and hosting tools
  - `COMMANDS.md`, `FLAGS.md`, `PERSONAS.md` - SuperClaude components

## Project Overview

Nuptul Deploy Host is a luxury wedding planning platform built with React, TypeScript, and Supabase. It provides a comprehensive suite of features for wedding planning, guest management, and event coordination.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Glass morphism design system
- **Backend**: Supabase (PostgreSQL, Real-time subscriptions, Authentication)
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite
- **Package Manager**: npm

## Key Features

- Guest RSVP management
- Real-time instant messaging
- Photo galleries and media sharing
- Transportation booking
- Accommodation management
- Admin dashboard for event organizers
- Mobile-responsive design

## File Organization Rules

- Rule: All files that are not explicitly required to run the application must be stored in this folder. No exceptions unless explicitly approved.
- This folder is designated for:
  - Test scripts
  - Documentation
  - Supporting files
  - Development resources
- Always maintain proper organization following industry-standard naming conventions and folder hierarchy.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Project Structure

- `/src`: Source code
  - `/components`: React components
  - `/pages`: Page components
  - `/hooks`: Custom React hooks
  - `/utils`: Utility functions
  - `/types`: TypeScript type definitions
  - `/integrations`: External service integrations
- `/public`: Static assets
- `/dist`: Production build output
- `/development Files`: Development resources and documentation

## SuperClaude Framework Integration

This project includes the complete SuperClaude framework with Docker MCP integration:

- **Commands**: See `.claude/COMMANDS.md` for available commands
- **Flags**: See `.claude/FLAGS.md` for command flags
- **Personas**: See `.claude/PERSONAS.md` for AI personas
- **MCP Tools**: See `.claude/MCP_DOCKER_TOOLS.md` for all available tools

### Key SuperClaude Features:
- Wave orchestration for complex operations
- Intelligent persona activation
- Docker MCP tool integration
- Task management and tracking
- Quality gates and validation

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.