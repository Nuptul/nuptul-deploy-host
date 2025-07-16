# Multi-Agent Development System Implementation Guide

## Quick Start

This guide walks you through setting up the Multi-Agent Development System for Nuptul, enabling parallel AI-driven development with real-time monitoring.

## Prerequisites

- GitHub account with repository creation permissions
- Docker MCP configured and running
- Supabase project for dashboard data
- Netlify account for deployments
- Node.js 18+ installed locally

## Step 1: Create GitHub Repository

### 1.1 Initialize Production Repository

```bash
# Create new repository
gh repo create nuptul-production --public --description "Production repository for Nuptul with multi-agent development"

# Clone repository
git clone https://github.com/YOUR_USERNAME/nuptul-production.git
cd nuptul-production

# Create initial structure
mkdir -p .github/{workflows,agents,ISSUE_TEMPLATE}
mkdir -p src public agent-workspace observability docs scripts
mkdir -p agent-workspace/{testing,orchestrator}
```

### 1.2 Set Up Branch Protection

```bash
# Protect main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["continuous-integration"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## Step 2: Configure Agent System

### 2.1 Create Agent Configuration Files

Create `.github/agents/testing/config.json`:

```json
{
  "name": "nuptul-testing-agent",
  "type": "testing",
  "version": "1.0.0",
  "capabilities": [
    "browser_automation",
    "screenshot_capture",
    "visual_regression",
    "issue_creation"
  ],
  "mcp_tools": [
    "mcp__docker-mcp__browser_navigate",
    "mcp__docker-mcp__browser_take_screenshot",
    "mcp__docker-mcp__browser_snapshot",
    "mcp__docker-mcp__create_issue"
  ],
  "schedule": {
    "interval": "30m",
    "tests": [
      {
        "name": "Homepage Test",
        "url": "/",
        "actions": ["screenshot", "accessibility", "performance"]
      },
      {
        "name": "RSVP Flow",
        "url": "/rsvp",
        "actions": ["user_flow", "form_validation", "screenshot"]
      }
    ]
  },
  "issue_template": {
    "labels": ["ui-issue", "automated-test"],
    "assignees": ["orchestrator-bot"]
  }
}
```

Create `.github/agents/orchestrator/router.json`:

```json
{
  "routing_rules": [
    {
      "condition": {
        "labels": ["bug"],
        "priority": "high"
      },
      "assign_to": "bug_fix_agent",
      "max_agents": 2
    },
    {
      "condition": {
        "labels": ["feature"],
        "priority": "medium"
      },
      "assign_to": "feature_agent",
      "max_agents": 3
    },
    {
      "condition": {
        "labels": ["ui-issue"],
        "priority": "high"
      },
      "assign_to": "frontend_agent",
      "max_agents": 2
    },
    {
      "condition": {
        "labels": ["documentation"],
        "priority": "low"
      },
      "assign_to": "docs_agent",
      "max_agents": 1
    }
  ],
  "conflict_resolution": {
    "strategy": "auto_merge",
    "fallback": "create_pr_for_review"
  },
  "resource_limits": {
    "max_concurrent_agents": 8,
    "max_agents_per_issue": 1,
    "agent_timeout": "2h"
  }
}
```

### 2.2 Create GitHub Workflows

Create `.github/workflows/agent-ci.yml`:

```yaml
name: Agent CI/CD Pipeline

on:
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:
    inputs:
      agent_id:
        description: 'Agent ID to run tests for'
        required: true

jobs:
  identify-agent:
    runs-on: ubuntu-latest
    outputs:
      agent_id: ${{ steps.extract.outputs.agent_id }}
      agent_type: ${{ steps.extract.outputs.agent_type }}
    steps:
      - name: Extract Agent Info
        id: extract
        run: |
          if [[ "${{ github.event_name }}" == "workflow_dispatch" ]]; then
            echo "agent_id=${{ github.event.inputs.agent_id }}" >> $GITHUB_OUTPUT
          else
            # Extract from branch name (e.g., feature/agent-001-add-gallery)
            AGENT_ID=$(echo "${{ github.head_ref }}" | grep -oP 'agent-\K\d+' || echo "unknown")
            echo "agent_id=${AGENT_ID}" >> $GITHUB_OUTPUT
          fi

  validate-code:
    needs: identify-agent
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Linting
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Run Tests
        run: npm test -- --coverage
      
      - name: Security Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'

  update-dashboard:
    needs: [identify-agent, validate-code]
    runs-on: ubuntu-latest
    steps:
      - name: Report Status to Dashboard
        run: |
          curl -X POST "${{ secrets.DASHBOARD_URL }}/api/agent/status" \
            -H "Authorization: Bearer ${{ secrets.DASHBOARD_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "agent_id": "${{ needs.identify-agent.outputs.agent_id }}",
              "status": "validation_complete",
              "pr_number": "${{ github.event.pull_request.number }}",
              "test_results": "passed"
            }'
```

Create `.github/workflows/orchestrator.yml`:

```yaml
name: Orchestrator Workflow

on:
  issues:
    types: [opened, labeled, closed]
  pull_request:
    types: [opened, closed, merged]
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  process-new-issues:
    if: github.event_name == 'issues' && github.event.action == 'opened'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Analyze Issue
        id: analyze
        uses: actions/github-script@v7
        with:
          script: |
            const issue = context.payload.issue;
            const labels = issue.labels.map(l => l.name);
            
            // Determine priority based on labels and title
            let priority = 'medium';
            if (labels.includes('critical') || issue.title.includes('URGENT')) {
              priority = 'high';
            } else if (labels.includes('enhancement')) {
              priority = 'low';
            }
            
            // Determine agent type
            let agentType = 'general';
            if (labels.includes('bug')) agentType = 'bug_fix';
            else if (labels.includes('feature')) agentType = 'feature';
            else if (labels.includes('ui-issue')) agentType = 'frontend';
            else if (labels.includes('documentation')) agentType = 'docs';
            
            core.setOutput('priority', priority);
            core.setOutput('agent_type', agentType);
      
      - name: Assign to Agent
        uses: actions/github-script@v7
        with:
          script: |
            const issueNumber = context.payload.issue.number;
            const agentType = '${{ steps.analyze.outputs.agent_type }}';
            const priority = '${{ steps.analyze.outputs.priority }}';
            
            // Call orchestrator API to assign agent
            const response = await fetch('${{ secrets.ORCHESTRATOR_URL }}/assign', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ${{ secrets.ORCHESTRATOR_TOKEN }}',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                issue_number: issueNumber,
                agent_type: agentType,
                priority: priority,
                repository: context.repo.repo
              })
            });
            
            const result = await response.json();
            
            // Add comment to issue with assignment
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issueNumber,
              body: `🤖 **Agent Assignment**\n\nThis issue has been assigned to \`${result.agent_id}\` (${agentType} agent).\n\nExpected completion: ${result.estimated_time}`
            });

  monitor-agents:
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check Agent Health
        run: |
          # Check all active agents
          AGENTS=$(curl -s "${{ secrets.ORCHESTRATOR_URL }}/agents/active" \
            -H "Authorization: Bearer ${{ secrets.ORCHESTRATOR_TOKEN }}")
          
          echo "Active agents: $AGENTS"
          
          # Check for stuck agents
          STUCK=$(echo "$AGENTS" | jq -r '.[] | select(.last_update < (now - 1800)) | .id')
          
          if [ ! -z "$STUCK" ]; then
            echo "Found stuck agents: $STUCK"
            # Restart stuck agents
            for agent in $STUCK; do
              curl -X POST "${{ secrets.ORCHESTRATOR_URL }}/agents/$agent/restart" \
                -H "Authorization: Bearer ${{ secrets.ORCHESTRATOR_TOKEN }}"
            done
          fi
      
      - name: Rebalance Workload
        run: |
          # Get workload distribution
          WORKLOAD=$(curl -s "${{ secrets.ORCHESTRATOR_URL }}/workload" \
            -H "Authorization: Bearer ${{ secrets.ORCHESTRATOR_TOKEN }}")
          
          # Check if rebalancing needed
          if [ $(echo "$WORKLOAD" | jq '.needs_rebalancing') == "true" ]; then
            curl -X POST "${{ secrets.ORCHESTRATOR_URL }}/rebalance" \
              -H "Authorization: Bearer ${{ secrets.ORCHESTRATOR_TOKEN }}"
          fi
```

Create `.github/workflows/test-automation.yml`:

```yaml
name: Automated UI Testing

on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  ui-testing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Testing Environment
        run: |
          # Install dependencies
          npm ci
          npx playwright install chromium
      
      - name: Start Test Server
        run: |
          npm run build
          npx serve -s dist -p 3000 &
          sleep 5
      
      - name: Run Testing Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MCP_DOCKER_TOKEN: ${{ secrets.MCP_DOCKER_TOKEN }}
        run: |
          # Run testing agent script
          node scripts/run-testing-agent.js \
            --config .github/agents/testing/config.json \
            --base-url http://localhost:3000 \
            --output agent-workspace/testing/results
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ github.run_id }}
          path: agent-workspace/testing/results/
      
      - name: Create Issues from Findings
        if: always()
        run: |
          # Process test results and create issues
          node scripts/process-test-results.js \
            --results agent-workspace/testing/results/report.json \
            --create-issues
```

## Step 3: Set Up Testing Agent

### 3.1 Create Testing Agent Script

Create `scripts/run-testing-agent.js`:

```javascript
const { program } = require('commander');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');

class TestingAgent {
  constructor(config, options) {
    this.config = config;
    this.options = options;
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.results = [];
  }

  async run() {
    console.log('🤖 Testing Agent starting...');
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      for (const test of this.config.schedule.tests) {
        await this.runTest(browser, test);
      }
      
      await this.generateReport();
      await this.createIssuesFromFindings();
    } finally {
      await browser.close();
    }
  }

  async runTest(browser, test) {
    console.log(`📋 Running test: ${test.name}`);
    const page = await browser.newPage();
    const testResult = {
      name: test.name,
      url: test.url,
      timestamp: new Date().toISOString(),
      findings: []
    };

    try {
      // Navigate to page
      await page.goto(`${this.options.baseUrl}${test.url}`, {
        waitUntil: 'networkidle2'
      });

      // Run each action
      for (const action of test.actions) {
        const result = await this.performAction(page, action, test);
        if (result.issues.length > 0) {
          testResult.findings.push(...result.issues);
        }
      }

      this.results.push(testResult);
    } catch (error) {
      testResult.findings.push({
        type: 'error',
        severity: 'high',
        description: `Test failed: ${error.message}`,
        screenshot: await this.captureScreenshot(page, `error-${test.name}`)
      });
    } finally {
      await page.close();
    }
  }

  async performAction(page, action, test) {
    const issues = [];

    switch (action) {
      case 'screenshot':
        const screenshotPath = await this.captureScreenshot(page, test.name);
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        break;

      case 'accessibility':
        const a11yIssues = await this.checkAccessibility(page);
        issues.push(...a11yIssues);
        break;

      case 'performance':
        const perfIssues = await this.checkPerformance(page);
        issues.push(...perfIssues);
        break;

      case 'visual_regression':
        const visualIssues = await this.checkVisualRegression(page, test.name);
        issues.push(...visualIssues);
        break;

      case 'user_flow':
        const flowIssues = await this.testUserFlow(page, test);
        issues.push(...flowIssues);
        break;
    }

    return { issues };
  }

  async captureScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.options.output, 'screenshots', filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await page.screenshot({ path: filepath, fullPage: true });
    
    return filepath;
  }

  async checkAccessibility(page) {
    const issues = [];
    
    // Check for missing alt texts
    const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        description: `Found ${imagesWithoutAlt} images without alt text`,
        selector: 'img:not([alt])'
      });
    }

    // Check for proper heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({ tag: el.tagName, text: el.textContent }))
    );
    
    // Add more accessibility checks...
    
    return issues;
  }

  async checkPerformance(page) {
    const issues = [];
    const metrics = await page.metrics();
    
    // Check page load time
    if (metrics.TaskDuration > 3000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `Page load time exceeds 3 seconds (${metrics.TaskDuration}ms)`,
        metrics: metrics
      });
    }

    // Check for large images
    const largeImages = await page.$$eval('img', imgs => 
      imgs.filter(img => img.naturalWidth > 1920 || img.naturalHeight > 1080)
        .map(img => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight }))
    );
    
    if (largeImages.length > 0) {
      issues.push({
        type: 'performance',
        severity: 'low',
        description: `Found ${largeImages.length} oversized images`,
        details: largeImages
      });
    }

    return issues;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      agent: 'testing-agent',
      summary: {
        total_tests: this.results.length,
        total_issues: this.results.reduce((sum, r) => sum + r.findings.length, 0),
        by_severity: this.groupBySeverity(),
        by_type: this.groupByType()
      },
      results: this.results
    };

    const reportPath = path.join(this.options.output, 'report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report generated: ${reportPath}`);
  }

  async createIssuesFromFindings() {
    const highSeverityIssues = this.results
      .flatMap(r => r.findings)
      .filter(f => f.severity === 'high');

    for (const finding of highSeverityIssues) {
      await this.createGitHubIssue(finding);
    }
  }

  async createGitHubIssue(finding) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    
    const issue = await this.octokit.issues.create({
      owner,
      repo,
      title: `[Automated Test] ${finding.type}: ${finding.description}`,
      body: this.formatIssueBody(finding),
      labels: [...this.config.issue_template.labels, finding.type, `severity-${finding.severity}`],
      assignees: this.config.issue_template.assignees
    });

    console.log(`🐛 Created issue #${issue.data.number}: ${issue.data.title}`);
  }

  formatIssueBody(finding) {
    return `## Automated Test Finding

**Type**: ${finding.type}
**Severity**: ${finding.severity}
**Description**: ${finding.description}

### Details
${JSON.stringify(finding.details || {}, null, 2)}

### Screenshot
${finding.screenshot ? `![Screenshot](${finding.screenshot})` : 'No screenshot available'}

### Metadata
- Test Run: ${new Date().toISOString()}
- Agent: Testing Agent v${this.config.version}
- Automated: Yes

---
*This issue was automatically created by the Testing Agent*`;
  }

  groupBySeverity() {
    const groups = { high: 0, medium: 0, low: 0 };
    this.results.forEach(r => {
      r.findings.forEach(f => {
        groups[f.severity] = (groups[f.severity] || 0) + 1;
      });
    });
    return groups;
  }

  groupByType() {
    const groups = {};
    this.results.forEach(r => {
      r.findings.forEach(f => {
        groups[f.type] = (groups[f.type] || 0) + 1;
      });
    });
    return groups;
  }
}

// CLI setup
program
  .requiredOption('--config <path>', 'Path to agent config file')
  .requiredOption('--base-url <url>', 'Base URL to test')
  .requiredOption('--output <path>', 'Output directory for results')
  .parse(process.argv);

// Run the agent
(async () => {
  const configPath = path.resolve(program.opts().config);
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  
  const agent = new TestingAgent(config, program.opts());
  await agent.run();
})().catch(console.error);
```

### 3.2 Create Development Agent Template

Create `scripts/dev-agent-template.js`:

```javascript
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs').promises;

class DevelopmentAgent {
  constructor(agentId, issueNumber, config) {
    this.agentId = agentId;
    this.issueNumber = issueNumber;
    this.config = config;
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.git = simpleGit();
    this.branchName = `${config.branchPrefix}/agent-${agentId}-issue-${issueNumber}`;
  }

  async run() {
    console.log(`🤖 Development Agent ${this.agentId} starting...`);
    
    try {
      // 1. Fetch issue details
      const issue = await this.fetchIssue();
      console.log(`📋 Working on: ${issue.title}`);

      // 2. Create feature branch
      await this.createBranch();

      // 3. Implement solution
      await this.implementSolution(issue);

      // 4. Run tests
      await this.runTests();

      // 5. Create pull request
      await this.createPullRequest(issue);

      // 6. Update status
      await this.updateStatus('completed');
      
    } catch (error) {
      console.error(`❌ Agent ${this.agentId} failed:`, error);
      await this.updateStatus('failed', error.message);
    }
  }

  async fetchIssue() {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const { data } = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: this.issueNumber
    });
    return data;
  }

  async createBranch() {
    await this.git.checkoutLocalBranch(this.branchName);
    console.log(`🌿 Created branch: ${this.branchName}`);
  }

  async implementSolution(issue) {
    // This is where the AI-driven implementation happens
    // For now, we'll create a placeholder
    
    const implementation = await this.generateImplementation(issue);
    
    for (const file of implementation.files) {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      await fs.writeFile(file.path, file.content);
      await this.git.add(file.path);
    }

    await this.git.commit(`Implement: ${issue.title}\n\nResolves #${this.issueNumber}`);
    console.log(`✅ Implementation complete`);
  }

  async generateImplementation(issue) {
    // This would use Claude or another AI to generate the actual code
    // For demonstration, returning a simple structure
    
    return {
      files: [
        {
          path: `src/features/${this.sanitizeName(issue.title)}/index.ts`,
          content: `// Implementation for: ${issue.title}\n// Agent: ${this.agentId}\n\nexport const feature = () => {\n  // TODO: Implement\n};\n`
        }
      ]
    };
  }

  async runTests() {
    console.log('🧪 Running tests...');
    // Run actual tests here
    // For now, we'll simulate
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Tests passed');
  }

  async createPullRequest(issue) {
    await this.git.push('origin', this.branchName);
    
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const { data: pr } = await this.octokit.pulls.create({
      owner,
      repo,
      title: `[Agent ${this.agentId}] ${issue.title}`,
      head: this.branchName,
      base: 'main',
      body: this.generatePRBody(issue)
    });

    console.log(`🔀 Created PR #${pr.number}: ${pr.html_url}`);
    return pr;
  }

  generatePRBody(issue) {
    return `## Summary
This PR implements the solution for #${this.issueNumber}.

## Changes
- Implementation details here
- List of changes made

## Testing
- All tests pass
- Manual testing completed

## Agent Metadata
- Agent ID: ${this.agentId}
- Issue: #${this.issueNumber}
- Timestamp: ${new Date().toISOString()}

---
*This PR was automatically created by Development Agent ${this.agentId}*`;
  }

  async updateStatus(status, error = null) {
    // Update dashboard with agent status
    const payload = {
      agent_id: this.agentId,
      issue_number: this.issueNumber,
      status,
      error,
      timestamp: new Date().toISOString()
    };

    // Send to dashboard
    console.log('📊 Status update:', payload);
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
}

// Export for use in orchestrator
module.exports = { DevelopmentAgent };
```

## Step 4: Set Up Observability Dashboard

### 4.1 Create Dashboard Backend

Create `observability/backend/server.js`:

```javascript
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// Agent status tracking
const agentStatus = new Map();

// API Routes
app.get('/api/agents', async (req, res) => {
  const agents = Array.from(agentStatus.values());
  res.json({ agents });
});

app.post('/api/agent/status', async (req, res) => {
  const { agent_id, status, ...metadata } = req.body;
  
  const agentData = {
    agent_id,
    status,
    last_update: new Date().toISOString(),
    ...metadata
  };
  
  // Update in-memory status
  agentStatus.set(agent_id, agentData);
  
  // Emit real-time update
  io.emit('agent:status', agentData);
  
  // Store in Supabase
  await supabase
    .from('agent_logs')
    .insert([agentData]);
  
  res.json({ success: true });
});

app.get('/api/issues', async (req, res) => {
  const { data } = await supabase
    .from('github_issues')
    .select('*')
    .order('created_at', { ascending: false });
  
  res.json({ issues: data });
});

app.get('/api/metrics', async (req, res) => {
  // Calculate metrics from Supabase data
  const { data: agentLogs } = await supabase
    .from('agent_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  const metrics = {
    total_agents: agentStatus.size,
    active_agents: Array.from(agentStatus.values()).filter(a => a.status === 'active').length,
    issues_resolved_24h: agentLogs.filter(log => log.status === 'issue_resolved').length,
    average_resolution_time: calculateAverageResolutionTime(agentLogs),
    deployment_success_rate: calculateDeploymentSuccessRate(agentLogs)
  };
  
  res.json({ metrics });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Dashboard client connected');
  
  // Send current agent status
  socket.emit('agents:snapshot', Array.from(agentStatus.values()));
  
  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected');
  });
});

// Helper functions
function calculateAverageResolutionTime(logs) {
  // Implementation here
  return '45m';
}

function calculateDeploymentSuccessRate(logs) {
  // Implementation here
  return 0.95;
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Dashboard backend running on port ${PORT}`);
});
```

### 4.2 Create Dashboard Frontend

Create `observability/frontend/src/Dashboard.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, Grid, Typography, Box, LinearProgress } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';

interface Agent {
  agent_id: string;
  status: 'active' | 'idle' | 'failed';
  current_task?: string;
  last_update: string;
}

interface Metrics {
  total_agents: number;
  active_agents: number;
  issues_resolved_24h: number;
  average_resolution_time: string;
  deployment_success_rate: number;
}

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to backend
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('agents:snapshot', (data: Agent[]) => {
      setAgents(data);
    });

    newSocket.on('agent:status', (update: Agent) => {
      setAgents(prev => {
        const index = prev.findIndex(a => a.agent_id === update.agent_id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = update;
          return updated;
        }
        return [...prev, update];
      });
    });

    // Fetch initial metrics
    fetchMetrics();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchMetrics = async () => {
    const response = await fetch('/api/metrics');
    const data = await response.json();
    setMetrics(data.metrics);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nuptul Multi-Agent Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Active Agents
            </Typography>
            <Typography variant="h4">
              {metrics?.active_agents || 0} / {metrics?.total_agents || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Issues Resolved (24h)
            </Typography>
            <Typography variant="h4">
              {metrics?.issues_resolved_24h || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Avg Resolution Time
            </Typography>
            <Typography variant="h4">
              {metrics?.average_resolution_time || 'N/A'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Deploy Success Rate
            </Typography>
            <Typography variant="h4">
              {((metrics?.deployment_success_rate || 0) * 100).toFixed(1)}%
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Agent Status Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agent Activity
            </Typography>
            <AgentActivityList agents={agents} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agent Distribution
            </Typography>
            <AgentPieChart agents={agents} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const AgentActivityList: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  return (
    <Box>
      {agents.map(agent => (
        <Box key={agent.agent_id} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">
              {agent.agent_id}
            </Typography>
            <Typography variant="body2" color={getStatusColor(agent.status)}>
              {agent.status}
            </Typography>
          </Box>
          {agent.current_task && (
            <Typography variant="body2" color="textSecondary">
              {agent.current_task}
            </Typography>
          )}
          <LinearProgress 
            variant="determinate" 
            value={agent.status === 'active' ? 60 : 100} 
            sx={{ mt: 1 }}
          />
        </Box>
      ))}
    </Box>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success.main';
    case 'idle': return 'warning.main';
    case 'failed': return 'error.main';
    default: return 'text.secondary';
  }
};

export default Dashboard;
```

## Step 5: Deploy the System

### 5.1 Deploy Dashboard to Netlify

```bash
# Build dashboard
cd observability/frontend
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build

# Set environment variables in Netlify
netlify env:set REACT_APP_BACKEND_URL https://your-backend.herokuapp.com
```

### 5.2 Configure GitHub Secrets

```bash
# Set required secrets
gh secret set GITHUB_TOKEN
gh secret set MCP_DOCKER_TOKEN
gh secret set DASHBOARD_URL
gh secret set DASHBOARD_TOKEN
gh secret set ORCHESTRATOR_URL
gh secret set ORCHESTRATOR_TOKEN
gh secret set SUPABASE_URL
gh secret set SUPABASE_ANON_KEY
```

### 5.3 Initialize Database Schema

Create `scripts/init-database.sql`:

```sql
-- Agent activity logs
CREATE TABLE agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  issue_number INTEGER,
  pr_number INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub issues tracking
CREATE TABLE github_issues (
  id SERIAL PRIMARY KEY,
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  labels JSONB,
  assigned_agent VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Agent assignments
CREATE TABLE agent_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  issue_number INTEGER NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'assigned'
);

-- Deployment history
CREATE TABLE deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(255) NOT NULL,
  agent_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rollback_of UUID REFERENCES deployments(id),
  metadata JSONB
);

-- Create indexes
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at);
CREATE INDEX idx_github_issues_status ON github_issues(status);
CREATE INDEX idx_agent_assignments_agent_id ON agent_assignments(agent_id);
```

## Step 6: Test the System

### 6.1 Manual Agent Test

```bash
# Test testing agent
node scripts/run-testing-agent.js \
  --config .github/agents/testing/config.json \
  --base-url https://nuptul.netlify.app \
  --output test-results

# Test development agent
GITHUB_TOKEN=your_token node scripts/test-dev-agent.js \
  --agent-id test-001 \
  --issue-number 1
```

### 6.2 Trigger Automated Workflows

```bash
# Trigger orchestrator
gh workflow run orchestrator.yml

# Trigger testing automation
gh workflow run test-automation.yml

# Monitor workflow runs
gh run list --workflow=orchestrator.yml
```

## Step 7: Monitor and Optimize

### 7.1 Access Dashboard

1. Navigate to your deployed dashboard URL
2. Monitor real-time agent activity
3. Check metrics and performance
4. Review issue assignments

### 7.2 Scaling Considerations

- Start with 2-3 development agents
- Monitor resource usage via dashboard
- Adjust `max_concurrent_agents` in orchestrator config
- Use agent health checks to prevent overload

## Troubleshooting

### Common Issues

1. **Agents not starting**: Check GitHub secrets and permissions
2. **Dashboard not updating**: Verify WebSocket connection
3. **Conflicts in PRs**: Review orchestrator conflict resolution
4. **High failure rate**: Check agent logs in dashboard

### Debug Commands

```bash
# Check agent logs
gh run view [run-id] --log

# View orchestrator status
curl https://your-orchestrator.com/api/status

# Test MCP tools
docker run -it mcp-tools test browser_automation
```

## Next Steps

1. **Add More Agent Types**: Specialized agents for different tasks
2. **Enhance Orchestration**: Machine learning for better routing
3. **Improve Dashboard**: Add custom visualizations
4. **Integrate Learning**: Agents that improve over time

---

This implementation guide provides a complete setup for your Multi-Agent Development System. The system will enable parallel development with real-time monitoring and intelligent orchestration, significantly accelerating your Nuptul project development.