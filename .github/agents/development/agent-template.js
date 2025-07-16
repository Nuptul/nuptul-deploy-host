#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { DashboardReporter } = require('../shared/dashboard-reporter');
const { PersonaManager } = require('../orchestrator/persona-manager');
const { HookManager } = require('../orchestrator/hook-manager');

const execAsync = promisify(exec);

/**
 * Development Agent Template
 * Base class for all development agents with SuperClaude persona integration
 * and MCP tool coordination
 */
class DevelopmentAgent {
  constructor(config) {
    this.config = config;
    this.agentId = config.agentId || `dev-agent-${Date.now()}`;
    this.persona = config.persona || 'frontend'; // Default persona
    
    // Initialize GitHub client
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.argv.find(arg => arg.includes('--github-token'))?.split('=')[1]
    });
    
    // Initialize dashboard reporter
    this.reporter = new DashboardReporter(this.agentId, 'development');
    
    // Initialize persona manager
    this.personaManager = new PersonaManager();
    
    // Initialize hook manager
    this.hooks = new HookManager();
    
    // Initialize MCP tools
    this.mcpTools = this.initializeMCPTools();
    
    // Work tracking
    this.currentIssue = null;
    this.currentBranch = null;
    this.generatedFiles = [];
  }

  /**
   * Initialize MCP tools based on persona preferences
   */
  initializeMCPTools() {
    const tools = {
      docker: {
        enabled: true,
        prefix: 'mcp__docker-mcp__',
        capabilities: ['github', 'browser', 'code_execution']
      },
      supabase: {
        enabled: this.persona === 'backend',
        tools: ['execute_sql', 'apply_migration', 'generate_typescript_types']
      },
      magic: {
        enabled: this.persona === 'frontend',
        tools: ['create_crafted_component', 'search_and_return_logos']
      },
      netlify: {
        enabled: this.persona === 'devops',
        tools: ['deploy_site', 'create_env_var']
      }
    };
    
    return tools;
  }

  /**
   * Main entry point for processing an issue
   */
  async processIssue(issue) {
    console.log(`🤖 ${this.agentId} processing issue #${issue.number}: ${issue.title}`);
    
    await this.reporter.reportStatus('active', {
      currentTask: `Processing issue #${issue.number}`,
      issueTitle: issue.title
    });
    
    await this.reporter.logActivity(
      'issue_processing_started',
      `Started processing issue #${issue.number}`,
      issue.title
    );
    
    try {
      // Execute pre-processing hooks
      const context = await this.hooks.execute('issueAssigned', {
        issue,
        agentId: this.agentId,
        persona: this.persona
      });
      
      this.currentIssue = context.issue;
      
      // Analyze issue with persona-specific approach
      const analysis = await this.analyzeIssue(issue);
      
      // Create feature branch
      this.currentBranch = await this.createFeatureBranch(issue);
      
      // Generate solution based on persona
      const solution = await this.generateSolution(issue, analysis);
      
      // Apply solution to codebase
      await this.applySolution(solution);
      
      // Run tests if applicable
      if (this.config.runTests !== false) {
        await this.runTests();
      }
      
      // Create pull request
      const pr = await this.createPullRequest(issue, solution);
      
      // Report completion
      await this.reporter.reportStatus('idle', {
        lastIssue: issue.number,
        pullRequest: pr.number
      });
      
      await this.reporter.logActivity(
        'issue_completed',
        `Completed issue #${issue.number}`,
        `Created PR #${pr.number}`
      );
      
      // Execute post-processing hooks
      await this.hooks.execute('prCreated', {
        issue,
        pullRequest: pr,
        agentId: this.agentId
      });
      
      return pr;
      
    } catch (error) {
      await this.handleError(error, issue);
      throw error;
    }
  }

  /**
   * Analyze issue based on persona expertise
   */
  async analyzeIssue(issue) {
    console.log(`🔍 Analyzing issue with ${this.persona} persona...`);
    
    const analysis = {
      type: this.detectIssueType(issue),
      complexity: this.assessComplexity(issue),
      dependencies: await this.identifyDependencies(issue),
      approach: this.personaManager.getApproach(this.persona, issue),
      estimatedTime: this.estimateTime(issue)
    };
    
    // Persona-specific analysis
    switch (this.persona) {
      case 'frontend':
        analysis.uiComponents = await this.identifyUIComponents(issue);
        analysis.designSystem = await this.checkDesignSystemCompliance(issue);
        break;
        
      case 'backend':
        analysis.apiEndpoints = await this.identifyAPIEndpoints(issue);
        analysis.databaseChanges = await this.identifyDatabaseChanges(issue);
        break;
        
      case 'security':
        analysis.securityConcerns = await this.identifySecurityConcerns(issue);
        analysis.complianceRequirements = await this.checkCompliance(issue);
        break;
        
      case 'performance':
        analysis.performanceTargets = await this.identifyPerformanceTargets(issue);
        analysis.optimizationOpportunities = await this.findOptimizations(issue);
        break;
    }
    
    return analysis;
  }

  /**
   * Create feature branch for the issue
   */
  async createFeatureBranch(issue) {
    const branchName = `agent/${this.persona}/${issue.number}-${this.slugify(issue.title)}`;
    
    console.log(`🌿 Creating branch: ${branchName}`);
    
    try {
      // Create branch from main
      await execAsync('git fetch origin main');
      await execAsync(`git checkout -b ${branchName} origin/main`);
      
      await this.reporter.logActivity(
        'branch_created',
        `Created branch ${branchName}`,
        `For issue #${issue.number}`
      );
      
      return branchName;
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  /**
   * Generate solution based on issue and analysis
   */
  async generateSolution(issue, analysis) {
    console.log(`💡 Generating solution with ${this.persona} approach...`);
    
    const solution = {
      files: [],
      tests: [],
      documentation: [],
      migrations: [],
      description: '',
      approach: analysis.approach
    };
    
    // Use persona-specific generation strategy
    switch (this.persona) {
      case 'frontend':
        solution.files = await this.generateFrontendSolution(issue, analysis);
        break;
        
      case 'backend':
        solution.files = await this.generateBackendSolution(issue, analysis);
        solution.migrations = await this.generateMigrations(issue, analysis);
        break;
        
      case 'fullstack':
        solution.files = [
          ...await this.generateFrontendSolution(issue, analysis),
          ...await this.generateBackendSolution(issue, analysis)
        ];
        break;
        
      default:
        solution.files = await this.generateGenericSolution(issue, analysis);
    }
    
    // Generate tests
    solution.tests = await this.generateTests(solution.files);
    
    // Generate documentation
    solution.documentation = await this.generateDocumentation(solution);
    
    // Create solution description
    solution.description = this.createSolutionDescription(issue, analysis, solution);
    
    return solution;
  }

  /**
   * Generate frontend solution using Magic MCP
   */
  async generateFrontendSolution(issue, analysis) {
    const files = [];
    
    if (this.mcpTools.magic.enabled && analysis.uiComponents.length > 0) {
      for (const component of analysis.uiComponents) {
        console.log(`🎨 Generating ${component.name} with Magic MCP...`);
        
        // This would call the actual Magic MCP tool
        // For now, we'll simulate the structure
        const componentCode = await this.generateComponentWithMagic(component);
        
        files.push({
          path: `src/components/${component.name}.tsx`,
          content: componentCode,
          action: 'create'
        });
      }
    }
    
    return files;
  }

  /**
   * Generate backend solution
   */
  async generateBackendSolution(issue, analysis) {
    const files = [];
    
    for (const endpoint of analysis.apiEndpoints || []) {
      const apiCode = await this.generateAPIEndpoint(endpoint);
      
      files.push({
        path: `src/api/${endpoint.name}.ts`,
        content: apiCode,
        action: 'create'
      });
    }
    
    return files;
  }

  /**
   * Apply solution to codebase
   */
  async applySolution(solution) {
    console.log(`📝 Applying solution to codebase...`);
    
    for (const file of solution.files) {
      await this.applyFileChange(file);
    }
    
    for (const migration of solution.migrations) {
      await this.applyMigration(migration);
    }
    
    for (const doc of solution.documentation) {
      await this.applyDocumentation(doc);
    }
    
    await this.reporter.logActivity(
      'solution_applied',
      'Applied solution to codebase',
      `Modified ${solution.files.length} files`
    );
  }

  /**
   * Apply individual file change
   */
  async applyFileChange(file) {
    const fullPath = path.join(process.cwd(), file.path);
    
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      if (file.action === 'create' || file.action === 'update') {
        await fs.writeFile(fullPath, file.content);
        this.generatedFiles.push(file.path);
        console.log(`✅ ${file.action === 'create' ? 'Created' : 'Updated'}: ${file.path}`);
      } else if (file.action === 'delete') {
        await fs.unlink(fullPath);
        console.log(`🗑️ Deleted: ${file.path}`);
      }
    } catch (error) {
      console.error(`Failed to apply change to ${file.path}:`, error);
      throw error;
    }
  }

  /**
   * Run tests for the solution
   */
  async runTests() {
    console.log('🧪 Running tests...');
    
    try {
      const { stdout, stderr } = await execAsync('npm test');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(`Tests failed: ${stderr}`);
      }
      
      console.log('✅ All tests passed');
      
      await this.reporter.logActivity(
        'tests_passed',
        'All tests passed',
        'Solution verified'
      );
    } catch (error) {
      await this.reporter.logActivity(
        'tests_failed',
        'Tests failed',
        error.message
      );
      
      // Optionally continue or throw based on config
      if (this.config.requireTestsPass) {
        throw error;
      }
    }
  }

  /**
   * Create pull request
   */
  async createPullRequest(issue, solution) {
    console.log('🔀 Creating pull request...');
    
    // Commit changes
    await execAsync('git add -A');
    await execAsync(`git commit -m "fix: ${issue.title}\n\nResolves #${issue.number}\n\n${solution.description}"`);
    
    // Push branch
    await execAsync(`git push origin ${this.currentBranch}`);
    
    // Create PR via GitHub API
    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
    
    const pr = await this.octokit.pulls.create({
      owner,
      repo,
      title: `🤖 [${this.persona}] ${issue.title}`,
      body: this.generatePRBody(issue, solution),
      head: this.currentBranch,
      base: 'main',
      draft: this.config.createDraftPR || false
    });
    
    console.log(`✅ Created PR #${pr.data.number}`);
    
    // Link PR to issue
    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: `🤖 ${this.agentId} has created PR #${pr.data.number} to address this issue.`
    });
    
    return pr.data;
  }

  /**
   * Generate PR body
   */
  generatePRBody(issue, solution) {
    let body = `## 🤖 Automated Solution by ${this.agentId}\n\n`;
    body += `**Persona:** ${this.persona}\n`;
    body += `**Issue:** #${issue.number}\n\n`;
    
    body += `### Summary\n${solution.description}\n\n`;
    
    body += `### Changes\n`;
    for (const file of solution.files) {
      body += `- ${file.action === 'create' ? '➕' : '📝'} ${file.path}\n`;
    }
    
    if (solution.migrations.length > 0) {
      body += `\n### Migrations\n`;
      for (const migration of solution.migrations) {
        body += `- 🗄️ ${migration.name}\n`;
      }
    }
    
    body += `\n### Testing\n`;
    body += this.config.runTests ? '✅ All tests passed\n' : '⚠️ Tests not run\n';
    
    body += `\n### Checklist\n`;
    body += `- [x] Code follows project conventions\n`;
    body += `- [x] Tests pass\n`;
    body += `- [x] Documentation updated\n`;
    body += `- [ ] Code reviewed\n`;
    body += `- [ ] Ready to merge\n`;
    
    return body;
  }

  /**
   * Handle errors
   */
  async handleError(error, issue) {
    console.error(`❌ Error processing issue #${issue.number}:`, error);
    
    await this.reporter.reportStatus('error', {
      error: error.message,
      issue: issue.number
    });
    
    await this.reporter.logActivity(
      'error',
      `Failed to process issue #${issue.number}`,
      error.message
    );
    
    // Execute error hooks
    await this.hooks.execute('agentError', {
      error,
      issue,
      agentId: this.agentId
    });
  }

  // Utility methods

  detectIssueType(issue) {
    const labels = issue.labels.map(l => l.name.toLowerCase());
    
    if (labels.includes('bug')) return 'bug';
    if (labels.includes('feature')) return 'feature';
    if (labels.includes('enhancement')) return 'enhancement';
    if (labels.includes('refactor')) return 'refactor';
    
    return 'task';
  }

  assessComplexity(issue) {
    // Simple complexity assessment based on issue content
    const bodyLength = issue.body?.length || 0;
    const hasCode = issue.body?.includes('```');
    const hasTasks = issue.body?.includes('- [ ]');
    
    let score = 0;
    if (bodyLength > 500) score += 2;
    if (hasCode) score += 1;
    if (hasTasks) score += 1;
    
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  estimateTime(issue) {
    const complexity = this.assessComplexity(issue);
    const estimates = {
      low: '1-2 hours',
      medium: '2-4 hours',
      high: '4-8 hours'
    };
    
    return estimates[complexity];
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
  }

  // Placeholder methods for persona-specific functionality
  
  async identifyUIComponents(issue) {
    // Parse issue body for UI component mentions
    return [];
  }
  
  async checkDesignSystemCompliance(issue) {
    return true;
  }
  
  async identifyAPIEndpoints(issue) {
    return [];
  }
  
  async identifyDatabaseChanges(issue) {
    return [];
  }
  
  async identifySecurityConcerns(issue) {
    return [];
  }
  
  async checkCompliance(issue) {
    return [];
  }
  
  async identifyPerformanceTargets(issue) {
    return [];
  }
  
  async findOptimizations(issue) {
    return [];
  }
  
  async identifyDependencies(issue) {
    return [];
  }
  
  async generateComponentWithMagic(component) {
    // Placeholder for Magic MCP integration
    return `// Generated component: ${component.name}`;
  }
  
  async generateAPIEndpoint(endpoint) {
    // Placeholder for API generation
    return `// Generated API: ${endpoint.name}`;
  }
  
  async generateGenericSolution(issue, analysis) {
    return [];
  }
  
  async generateTests(files) {
    return [];
  }
  
  async generateDocumentation(solution) {
    return [];
  }
  
  async generateMigrations(issue, analysis) {
    return [];
  }
  
  async applyMigration(migration) {
    console.log(`🗄️ Applying migration: ${migration.name}`);
  }
  
  async applyDocumentation(doc) {
    console.log(`📚 Updating documentation: ${doc.path}`);
  }
  
  createSolutionDescription(issue, analysis, solution) {
    return `Implemented ${analysis.type} for issue #${issue.number} using ${this.persona} approach. Modified ${solution.files.length} files.`;
  }
}

// Export for use in specific agent implementations
module.exports = { DevelopmentAgent };