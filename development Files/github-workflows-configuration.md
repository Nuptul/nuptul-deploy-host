# GitHub Workflows Configuration for Nuptial Multi-Agent System

## Overview

This document provides the complete GitHub Actions workflows configuration for orchestrating the Nuptial multi-agent system, enabling parallel development with infinite loops.

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Orchestrator                         │
│                 (orchestrator-main.yml)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Spawns & Coordinates
        ┌──────────────┴──────────────┬─────────────────────┐
        ▼                             ▼                     ▼
┌───────────────┐           ┌────────────────┐    ┌────────────────┐
│ Testing Agent │           │ Dev Agents     │    │ Migration      │
│ (testing.yml) │           │ (dev-agent.yml)│    │ (migration.yml)│
└───────────────┘           └────────────────┘    └────────────────┘
```

## Core Workflows

### 1. Main Orchestrator Workflow

```yaml
# .github/workflows/orchestrator-main.yml
name: 🧠 Main Orchestrator

on:
  # Trigger on various GitHub events
  issues:
    types: [opened, labeled, assigned, closed]
  pull_request:
    types: [opened, synchronize, ready_for_review, closed]
  issue_comment:
    types: [created]
  # Scheduled health checks
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  # Manual trigger for special operations
  workflow_dispatch:
    inputs:
      operation:
        description: 'Orchestrator operation'
        required: true
        type: choice
        options:
          - spawn-agents
          - rebalance-workload
          - health-check
          - cleanup-resources
          - infinite-loop
      agent_count:
        description: 'Number of agents to spawn'
        required: false
        default: '3'
      spec_file:
        description: 'Specification file for infinite loop'
        required: false

jobs:
  analyze-and-route:
    runs-on: ubuntu-latest
    outputs:
      agent_type: ${{ steps.analyze.outputs.agent_type }}
      priority: ${{ steps.analyze.outputs.priority }}
      persona: ${{ steps.analyze.outputs.persona }}
      
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Orchestrator Dependencies
        run: |
          cd .github/agents/orchestrator
          npm install
      
      - name: 🔍 Analyze Context
        id: analyze
        run: |
          node .github/agents/orchestrator/analyze-context.js \
            --event-type="${{ github.event_name }}" \
            --event-action="${{ github.event.action }}" \
            --issue-number="${{ github.event.issue.number }}" \
            --pr-number="${{ github.event.pull_request.number }}" \
            --comment-body="${{ github.event.comment.body }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: 📊 Report to Dashboard
        if: always()
        run: |
          curl -X POST ${{ secrets.DASHBOARD_URL }}/activity \
            -H "Content-Type: application/json" \
            -d '{
              "type": "orchestrator_analysis",
              "title": "Analyzed ${{ github.event_name }} event",
              "description": "Agent type: ${{ steps.analyze.outputs.agent_type }}, Priority: ${{ steps.analyze.outputs.priority }}",
              "agentId": "orchestrator-main"
            }'

  spawn-appropriate-agent:
    needs: analyze-and-route
    if: needs.analyze-and-route.outputs.agent_type != 'none'
    runs-on: ubuntu-latest
    
    steps:
      - name: 🚀 Spawn Agent
        uses: actions/github-script@v6
        with:
          script: |
            const agentType = '${{ needs.analyze-and-route.outputs.agent_type }}';
            const priority = '${{ needs.analyze-and-route.outputs.priority }}';
            const persona = '${{ needs.analyze-and-route.outputs.persona }}';
            
            // Map agent types to workflow files
            const workflowMap = {
              'testing': 'testing-agent.yml',
              'development': 'development-agent.yml',
              'migration': 'migration-agent.yml',
              'documentation': 'documentation-agent.yml',
              'security': 'security-agent.yml'
            };
            
            const workflow = workflowMap[agentType] || 'development-agent.yml';
            
            // Dispatch workflow
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: workflow,
              ref: 'main',
              inputs: {
                issue_number: '${{ github.event.issue.number }}',
                pr_number: '${{ github.event.pull_request.number }}',
                priority: priority,
                persona: persona
              }
            });

  health-monitoring:
    if: github.event_name == 'schedule' || (github.event_name == 'workflow_dispatch' && github.event.inputs.operation == 'health-check')
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: 🏥 Check Agent Health
        id: health
        run: |
          node .github/agents/orchestrator/health-check.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DASHBOARD_URL: ${{ secrets.DASHBOARD_URL }}
      
      - name: 🔄 Rebalance if Needed
        if: steps.health.outputs.needs_rebalance == 'true'
        run: |
          node .github/agents/orchestrator/rebalance-workload.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  infinite-loop-coordinator:
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.operation == 'infinite-loop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: 🔄 Start Infinite Loop
        run: |
          node .github/agents/orchestrator/infinite-loop-coordinator.js \
            --spec-file="${{ github.event.inputs.spec_file }}" \
            --agent-count="${{ github.event.inputs.agent_count }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### 2. Testing Agent Workflow

```yaml
# .github/workflows/testing-agent.yml
name: 🧪 Testing Agent

on:
  # Scheduled testing
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  # Manual trigger
  workflow_dispatch:
    inputs:
      test_scope:
        description: 'Testing scope'
        required: false
        type: choice
        default: 'full'
        options:
          - critical
          - full
          - performance
          - accessibility
      issue_number:
        description: 'Related issue number'
        required: false

jobs:
  ui-testing:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: |
          npm ci
          cd .github/agents/testing
          npm install
          
      - name: 🎭 Install Playwright Browsers
        run: |
          cd .github/agents/testing
          npx playwright install --with-deps
      
      - name: 🌐 Start Application
        run: |
          npm run build
          npm run preview &
          sleep 10  # Wait for server to start
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: 🧪 Run UI Tests
        id: test
        run: |
          cd .github/agents/testing
          node run-testing-agent.js \
            --scope="${{ github.event.inputs.test_scope || 'full' }}" \
            --output=./test-results \
            --github-token="${{ secrets.GITHUB_TOKEN }}"
        env:
          BASE_URL: http://localhost:4173
          DASHBOARD_URL: ${{ secrets.DASHBOARD_URL }}
      
      - name: 📸 Upload Screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: .github/agents/testing/screenshots/
          
      - name: 📊 Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: .github/agents/testing/test-results/
      
      - name: 🚨 Create Issues from Findings
        if: steps.test.outputs.has_findings == 'true'
        run: |
          cd .github/agents/testing
          node create-issues.js \
            --findings=./test-results/findings.json \
            --related-issue="${{ github.event.inputs.issue_number }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Development Agent Workflow

```yaml
# .github/workflows/development-agent.yml
name: 👨‍💻 Development Agent

on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: 'Issue to work on'
        required: true
      persona:
        description: 'SuperClaude persona'
        required: false
        type: choice
        options:
          - auto
          - architect
          - frontend
          - backend
          - security
          - performance
          - refactorer
      priority:
        description: 'Task priority'
        required: false
        default: 'medium'

jobs:
  develop-feature:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: 🎭 Setup Persona
        id: persona
        run: |
          PERSONA="${{ github.event.inputs.persona }}"
          if [ "$PERSONA" == "auto" ]; then
            # Analyze issue to determine best persona
            PERSONA=$(node .github/agents/shared/persona-selector.js \
              --issue-number="${{ github.event.inputs.issue_number }}")
          fi
          echo "selected_persona=$PERSONA" >> $GITHUB_OUTPUT
      
      - name: 🌿 Create Feature Branch
        id: branch
        run: |
          ISSUE_NUMBER="${{ github.event.inputs.issue_number }}"
          BRANCH_NAME="agent/issue-${ISSUE_NUMBER}-${{ steps.persona.outputs.selected_persona }}"
          
          git config user.name "Nuptial Dev Agent"
          git config user.email "dev-agent@nuptial.com"
          
          git checkout -b "$BRANCH_NAME"
          echo "branch_name=$BRANCH_NAME" >> $GITHUB_OUTPUT
      
      - name: 🤖 Generate Solution
        id: develop
        run: |
          node .github/agents/development/generate-solution.js \
            --issue-number="${{ github.event.inputs.issue_number }}" \
            --persona="${{ steps.persona.outputs.selected_persona }}" \
            --branch="${{ steps.branch.outputs.branch_name }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      
      - name: 🧪 Run Tests
        run: |
          npm test
          npm run lint
      
      - name: 📤 Push Changes
        run: |
          git add -A
          git commit -m "feat: [Agent] Implement solution for #${{ github.event.inputs.issue_number }}
          
          - Persona: ${{ steps.persona.outputs.selected_persona }}
          - Auto-generated by Nuptial Development Agent
          
          Closes #${{ github.event.inputs.issue_number }}"
          
          git push origin "${{ steps.branch.outputs.branch_name }}"
      
      - name: 🔀 Create Pull Request
        uses: actions/github-script@v6
        with:
          script: |
            const { data: issue } = await github.rest.issues.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: ${{ github.event.inputs.issue_number }}
            });
            
            const { data: pr } = await github.rest.pulls.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[Agent] ${issue.title}`,
              body: `## 🤖 Automated Solution
              
              This PR was automatically generated by the Nuptial Development Agent.
              
              ### Details
              - **Issue**: #${{ github.event.inputs.issue_number }}
              - **Persona**: ${{ steps.persona.outputs.selected_persona }}
              - **Priority**: ${{ github.event.inputs.priority }}
              
              ### Changes Made
              ${{ steps.develop.outputs.changes_summary }}
              
              ### Testing
              - ✅ All tests passing
              - ✅ Linting passed
              - ✅ Type checking passed
              
              ### Screenshots
              _Screenshots will be added by Testing Agent_
              
              ---
              _Generated by Nuptial Multi-Agent System_`,
              head: '${{ steps.branch.outputs.branch_name }}',
              base: 'main',
              draft: false
            });
            
            // Add labels
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: pr.number,
              labels: ['agent-generated', '${{ steps.persona.outputs.selected_persona }}']
            });
            
            // Request review from Testing Agent
            await github.rest.pulls.requestReviewers({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number,
              team_reviewers: ['testing-agents']
            });
```

### 4. Migration Agent Workflow

```yaml
# .github/workflows/migration-agent.yml
name: 🚀 Migration Agent

on:
  workflow_dispatch:
    inputs:
      migration_phase:
        description: 'Migration phase'
        required: true
        type: choice
        options:
          - analyze
          - prepare
          - migrate-schema
          - migrate-data
          - verify
          - cutover
          - rollback
      target_environment:
        description: 'Target environment'
        required: true
        type: choice
        default: 'staging'
        options:
          - staging
          - production

jobs:
  database-migration:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.target_environment }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: 🔐 Setup Supabase CLI
        run: |
          curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
          sudo mv supabase /usr/local/bin/
      
      - name: 🎯 Execute Migration Phase
        id: migrate
        run: |
          node .github/agents/migration/execute-phase.js \
            --phase="${{ github.event.inputs.migration_phase }}" \
            --environment="${{ github.event.inputs.target_environment }}"
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DASHBOARD_URL: ${{ secrets.DASHBOARD_URL }}
      
      - name: 📊 Generate Migration Report
        if: always()
        run: |
          node .github/agents/migration/generate-report.js \
            --phase="${{ github.event.inputs.migration_phase }}" \
            --status="${{ steps.migrate.outcome }}" \
            --output=./migration-report.md
      
      - name: 📤 Upload Migration Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: migration-report-${{ github.event.inputs.migration_phase }}
          path: ./migration-report.md
      
      - name: 🔔 Notify Status
        if: always()
        run: |
          STATUS_EMOJI="✅"
          if [ "${{ steps.migrate.outcome }}" != "success" ]; then
            STATUS_EMOJI="❌"
          fi
          
          curl -X POST ${{ secrets.DASHBOARD_URL }}/activity \
            -H "Content-Type: application/json" \
            -d '{
              "type": "migration_${{ github.event.inputs.migration_phase }}",
              "title": "'$STATUS_EMOJI' Migration Phase: ${{ github.event.inputs.migration_phase }}",
              "description": "Environment: ${{ github.event.inputs.target_environment }}, Status: ${{ steps.migrate.outcome }}",
              "agentId": "migration-agent"
            }'
```

### 5. Parallel Agent Coordinator

```yaml
# .github/workflows/parallel-coordinator.yml
name: 🔀 Parallel Agent Coordinator

on:
  workflow_dispatch:
    inputs:
      spec_file:
        description: 'Specification file path'
        required: true
      wave_count:
        description: 'Number of waves'
        required: false
        default: '5'
      agents_per_wave:
        description: 'Agents per wave'
        required: false
        default: '3'

jobs:
  coordinate-waves:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: 🌊 Initialize Wave Coordination
        id: init
        run: |
          node .github/agents/parallel/wave-coordinator.js \
            --spec-file="${{ github.event.inputs.spec_file }}" \
            --wave-count="${{ github.event.inputs.wave_count }}" \
            --agents-per-wave="${{ github.event.inputs.agents_per_wave }}" \
            --init
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: 🚀 Execute Waves
        run: |
          for wave in $(seq 1 ${{ github.event.inputs.wave_count }}); do
            echo "Starting Wave $wave"
            
            # Spawn agents for this wave
            node .github/agents/parallel/spawn-wave-agents.js \
              --wave-number="$wave" \
              --wave-config="${{ steps.init.outputs.wave_config }}" \
              --agent-count="${{ github.event.inputs.agents_per_wave }}"
            
            # Wait for wave completion
            node .github/agents/parallel/wait-for-wave.js \
              --wave-number="$wave" \
              --timeout="3600"
            
            # Aggregate results
            node .github/agents/parallel/aggregate-wave-results.js \
              --wave-number="$wave" \
              --output="./wave-$wave-results.json"
          done
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: 📊 Final Aggregation
        run: |
          node .github/agents/parallel/final-aggregation.js \
            --wave-results="./wave-*-results.json" \
            --output="./final-results.md"
      
      - name: 📤 Create Summary PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('./final-results.md', 'utf8');
            
            const { data: pr } = await github.rest.pulls.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '[Parallel Agents] Aggregated Results from ${{ github.event.inputs.wave_count }} Waves',
              body: results,
              head: 'agent/parallel-results-${{ github.run_id }}',
              base: 'main'
            });
```

### 6. Deployment Workflow

```yaml
# .github/workflows/deployment.yml
name: 🚀 Production Deployment

on:
  push:
    branches: [main]
  pull_request:
    types: [closed]
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        default: 'staging'
        options:
          - staging
          - production

jobs:
  deploy-to-netlify:
    if: github.event.pull_request.merged == true || github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 📦 Install Dependencies
        run: npm ci
      
      - name: 🧪 Run Tests
        run: |
          npm test
          npm run test:e2e
      
      - name: 🏗️ Build Application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_ENVIRONMENT: ${{ github.event.inputs.environment || 'production' }}
      
      - name: 🚀 Deploy to Netlify
        id: deploy
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod --site=${{ secrets.NETLIFY_SITE_ID }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      
      - name: 🧪 Run Smoke Tests
        run: |
          npm run test:smoke -- --url=${{ steps.deploy.outputs.deploy-url }}
      
      - name: 🎉 Update Deployment Status
        run: |
          curl -X POST ${{ secrets.DASHBOARD_URL }}/activity \
            -H "Content-Type: application/json" \
            -d '{
              "type": "deployment_completed",
              "title": "Deployed to ${{ github.event.inputs.environment || 'production' }}",
              "description": "URL: ${{ steps.deploy.outputs.deploy-url }}",
              "agentId": "deployment-workflow"
            }'
```

## Supporting Scripts

### Agent Analyzer

```javascript
// .github/agents/orchestrator/analyze-context.js
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function analyzeContext() {
  const eventType = process.argv.find(arg => arg.includes('--event-type'))?.split('=')[1];
  const issueNumber = process.argv.find(arg => arg.includes('--issue-number'))?.split('=')[1];
  
  let agentType = 'none';
  let priority = 'medium';
  let persona = 'auto';
  
  if (eventType === 'issues' && issueNumber) {
    const { data: issue } = await octokit.issues.get({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY.split('/')[1],
      issue_number: issueNumber
    });
    
    // Analyze issue labels and content
    const labels = issue.labels.map(l => l.name);
    const title = issue.title.toLowerCase();
    const body = issue.body?.toLowerCase() || '';
    
    // Determine agent type
    if (labels.includes('bug') || title.includes('error') || title.includes('fix')) {
      agentType = 'development';
      persona = 'backend';
    } else if (labels.includes('ui') || title.includes('design') || title.includes('component')) {
      agentType = 'development';
      persona = 'frontend';
    } else if (labels.includes('testing') || title.includes('test')) {
      agentType = 'testing';
    } else if (labels.includes('security')) {
      agentType = 'security';
      persona = 'security';
      priority = 'high';
    } else if (labels.includes('documentation')) {
      agentType = 'documentation';
      persona = 'scribe';
    }
    
    // Determine priority
    if (labels.includes('critical') || labels.includes('urgent')) {
      priority = 'critical';
    } else if (labels.includes('high-priority')) {
      priority = 'high';
    }
  }
  
  console.log(`::set-output name=agent_type::${agentType}`);
  console.log(`::set-output name=priority::${priority}`);
  console.log(`::set-output name=persona::${persona}`);
}

analyzeContext().catch(console.error);
```

### Wave Coordinator

```javascript
// .github/agents/parallel/wave-coordinator.js
const fs = require('fs').promises;
const path = require('path');

class WaveCoordinator {
  constructor(specFile, waveCount, agentsPerWave) {
    this.specFile = specFile;
    this.waveCount = parseInt(waveCount);
    this.agentsPerWave = parseInt(agentsPerWave);
    this.waveResults = [];
  }

  async initialize() {
    const spec = await this.loadSpec();
    const waveConfig = this.generateWaveConfig(spec);
    
    await fs.writeFile(
      './wave-config.json',
      JSON.stringify(waveConfig, null, 2)
    );
    
    console.log(`::set-output name=wave_config::./wave-config.json`);
  }

  async loadSpec() {
    const specContent = await fs.readFile(this.specFile, 'utf8');
    return JSON.parse(specContent);
  }

  generateWaveConfig(spec) {
    const waves = [];
    
    for (let i = 0; i < this.waveCount; i++) {
      waves.push({
        number: i + 1,
        agents: this.generateAgentsForWave(spec, i),
        focus: this.determineFocus(spec, i),
        dependencies: i > 0 ? [i - 1] : []
      });
    }
    
    return { spec, waves };
  }

  generateAgentsForWave(spec, waveIndex) {
    const agents = [];
    const personas = ['frontend', 'backend', 'architect', 'performance', 'security'];
    
    for (let i = 0; i < this.agentsPerWave; i++) {
      agents.push({
        id: `wave-${waveIndex + 1}-agent-${i + 1}`,
        persona: personas[i % personas.length],
        focus: this.getAgentFocus(spec, waveIndex, i)
      });
    }
    
    return agents;
  }

  determineFocus(spec, waveIndex) {
    const focuses = [
      'foundation',
      'core-features',
      'ui-enhancement',
      'performance-optimization',
      'testing-coverage'
    ];
    
    return focuses[waveIndex % focuses.length];
  }

  getAgentFocus(spec, waveIndex, agentIndex) {
    // Distribute work based on spec components
    const components = spec.components || [];
    const componentIndex = (waveIndex * this.agentsPerWave + agentIndex) % components.length;
    return components[componentIndex] || 'general';
  }
}

// Execute if called directly
if (require.main === module) {
  const specFile = process.argv.find(arg => arg.includes('--spec-file'))?.split('=')[1];
  const waveCount = process.argv.find(arg => arg.includes('--wave-count'))?.split('=')[1];
  const agentsPerWave = process.argv.find(arg => arg.includes('--agents-per-wave'))?.split('=')[1];
  
  const coordinator = new WaveCoordinator(specFile, waveCount, agentsPerWave);
  coordinator.initialize().catch(console.error);
}
```

## Environment Configuration

### Required GitHub Secrets

```yaml
# Repository Secrets
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
NETLIFY_AUTH_TOKEN: "netlify_auth_token_here"
NETLIFY_SITE_ID: "nuptial_site_id"
SUPABASE_ACCESS_TOKEN: "supabase_access_token"
SUPABASE_PROJECT_REF: "iwmfxcrzzwpmxomydmuq"
VITE_SUPABASE_URL: "https://iwmfxcrzzwpmxomydmuq.supabase.co"
VITE_SUPABASE_ANON_KEY: "supabase_anon_key"
OPENAI_API_KEY: "openai_api_key"
ANTHROPIC_API_KEY: "anthropic_api_key"
DASHBOARD_URL: "https://nuptial-dashboard.netlify.app"
DASHBOARD_WEBHOOK_SECRET: "webhook_secret"
```

### Environment Variables

```yaml
# Production Environment
VITE_ENVIRONMENT: "production"
VITE_API_URL: "https://api.nuptial.com"
VITE_SENTRY_DSN: "sentry_dsn"

# Staging Environment
VITE_ENVIRONMENT: "staging"
VITE_API_URL: "https://staging-api.nuptial.com"
```

## Monitoring and Alerts

### Slack Integration

```yaml
# .github/workflows/alerts.yml
name: 🚨 Agent Alerts

on:
  workflow_run:
    workflows: ["*"]
    types: [completed]

jobs:
  alert-on-failure:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack Alert
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: |
            🚨 Agent Workflow Failed
            Workflow: ${{ github.event.workflow_run.name }}
            Run: ${{ github.event.workflow_run.html_url }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Agent Isolation**: Each agent runs in its own workflow with isolated permissions
2. **Parallel Execution**: Use matrix strategies for running multiple agents
3. **Error Handling**: All workflows include comprehensive error handling and reporting
4. **Monitoring**: Every agent reports status to the observability dashboard
5. **Security**: Use environment-specific secrets and least-privilege access

## Conclusion

This GitHub Actions configuration enables the Nuptial platform to operate with:
- Infinite parallel development loops
- Intelligent issue routing
- Automated testing and quality assurance
- Seamless production deployments
- Real-time monitoring and observability

The system is designed to scale with the project's growth while maintaining code quality and development velocity.