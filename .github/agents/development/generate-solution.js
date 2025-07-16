#!/usr/bin/env node

const { DevelopmentAgent } = require('./agent-template');
const { Octokit } = require('@octokit/rest');

/**
 * Generate Solution Script
 * This script is called by the orchestrator to spawn development agents
 * and process issues with appropriate personas
 */

// Configuration for different agent types
const AGENT_CONFIGS = {
  frontend: {
    persona: 'frontend',
    runTests: true,
    createDraftPR: false,
    capabilities: ['ui', 'components', 'styling', 'accessibility'],
    mcpPreferences: {
      magic: true,
      supabase: false,
      netlify: false
    }
  },
  backend: {
    persona: 'backend',
    runTests: true,
    createDraftPR: false,
    capabilities: ['api', 'database', 'services', 'authentication'],
    mcpPreferences: {
      magic: false,
      supabase: true,
      netlify: false
    }
  },
  fullstack: {
    persona: 'fullstack',
    runTests: true,
    createDraftPR: false,
    capabilities: ['ui', 'api', 'database', 'integration'],
    mcpPreferences: {
      magic: true,
      supabase: true,
      netlify: false
    }
  },
  security: {
    persona: 'security',
    runTests: true,
    createDraftPR: true,
    capabilities: ['authentication', 'authorization', 'vulnerability', 'compliance'],
    mcpPreferences: {
      magic: false,
      supabase: true,
      netlify: false
    }
  },
  performance: {
    persona: 'performance',
    runTests: true,
    createDraftPR: false,
    capabilities: ['optimization', 'caching', 'monitoring', 'profiling'],
    mcpPreferences: {
      magic: false,
      supabase: true,
      netlify: false
    }
  },
  qa: {
    persona: 'qa',
    runTests: true,
    createDraftPR: false,
    capabilities: ['testing', 'validation', 'coverage', 'quality'],
    mcpPreferences: {
      magic: false,
      supabase: false,
      netlify: false
    }
  },
  devops: {
    persona: 'devops',
    runTests: false,
    createDraftPR: true,
    capabilities: ['deployment', 'infrastructure', 'ci/cd', 'monitoring'],
    mcpPreferences: {
      magic: false,
      supabase: true,
      netlify: true
    }
  },
  refactorer: {
    persona: 'refactorer',
    runTests: true,
    createDraftPR: true,
    capabilities: ['cleanup', 'optimization', 'patterns', 'debt'],
    mcpPreferences: {
      magic: false,
      supabase: false,
      netlify: false
    }
  },
  scribe: {
    persona: 'scribe',
    runTests: false,
    createDraftPR: false,
    capabilities: ['documentation', 'guides', 'api-docs', 'changelog'],
    mcpPreferences: {
      magic: false,
      supabase: false,
      netlify: false
    }
  }
};

class SolutionGenerator {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.argv.find(arg => arg.includes('--github-token'))?.split('=')[1]
    });
    
    this.activeAgents = new Map();
  }

  /**
   * Main entry point called by orchestrator
   */
  async generateSolution(issueNumber, agentType = 'frontend') {
    console.log(`🚀 Spawning ${agentType} agent for issue #${issueNumber}`);
    
    try {
      // Get issue details
      const issue = await this.getIssue(issueNumber);
      
      // Select appropriate agent configuration
      const config = this.selectAgentConfig(issue, agentType);
      
      // Create and initialize agent
      const agent = new DevelopmentAgent(config);
      
      // Store agent reference
      this.activeAgents.set(agent.agentId, agent);
      
      // Process the issue
      const result = await agent.processIssue(issue);
      
      // Clean up
      this.activeAgents.delete(agent.agentId);
      
      return {
        success: true,
        agentId: agent.agentId,
        pullRequest: result,
        executionTime: Date.now() - agent.startTime
      };
      
    } catch (error) {
      console.error(`❌ Failed to generate solution for issue #${issueNumber}:`, error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Get issue from GitHub
   */
  async getIssue(issueNumber) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
    
    const { data: issue } = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber
    });
    
    return issue;
  }

  /**
   * Select agent configuration based on issue analysis
   */
  selectAgentConfig(issue, requestedType) {
    const baseConfig = AGENT_CONFIGS[requestedType] || AGENT_CONFIGS.frontend;
    
    // Customize config based on issue labels
    const labels = issue.labels.map(l => l.name.toLowerCase());
    const config = { ...baseConfig };
    
    // Override settings based on labels
    if (labels.includes('urgent')) {
      config.createDraftPR = false; // Skip draft for urgent issues
    }
    
    if (labels.includes('no-tests')) {
      config.runTests = false;
    }
    
    if (labels.includes('security')) {
      config.createDraftPR = true; // Always draft for security issues
    }
    
    // Add issue-specific context
    config.issueContext = {
      number: issue.number,
      title: issue.title,
      labels: labels,
      priority: this.calculatePriority(issue),
      complexity: this.assessComplexity(issue)
    };
    
    return config;
  }

  /**
   * Calculate issue priority
   */
  calculatePriority(issue) {
    const labels = issue.labels.map(l => l.name.toLowerCase());
    
    if (labels.includes('critical')) return 1;
    if (labels.includes('urgent')) return 2;
    if (labels.includes('high')) return 3;
    if (labels.includes('medium')) return 5;
    if (labels.includes('low')) return 8;
    
    return 5; // Default medium priority
  }

  /**
   * Assess issue complexity
   */
  assessComplexity(issue) {
    let score = 0;
    
    // Check body length
    const bodyLength = issue.body?.length || 0;
    if (bodyLength > 1000) score += 3;
    else if (bodyLength > 500) score += 2;
    else if (bodyLength > 200) score += 1;
    
    // Check for code blocks
    if (issue.body?.includes('```')) score += 2;
    
    // Check for tasks
    const taskCount = (issue.body?.match(/- \[ \]/g) || []).length;
    score += Math.min(taskCount, 5);
    
    // Check labels
    const labels = issue.labels.map(l => l.name.toLowerCase());
    if (labels.includes('complex')) score += 3;
    if (labels.includes('breaking-change')) score += 2;
    if (labels.includes('refactor')) score += 2;
    
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Batch process multiple issues
   */
  async batchProcess(issues, maxConcurrent = 3) {
    console.log(`📦 Batch processing ${issues.length} issues with max ${maxConcurrent} concurrent agents`);
    
    const results = [];
    const chunks = [];
    
    // Split issues into chunks
    for (let i = 0; i < issues.length; i += maxConcurrent) {
      chunks.push(issues.slice(i, i + maxConcurrent));
    }
    
    // Process each chunk
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(({ issueNumber, agentType }) => 
        this.generateSolution(issueNumber, agentType)
      );
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * Get active agents status
   */
  getActiveAgents() {
    return Array.from(this.activeAgents.entries()).map(([id, agent]) => ({
      id,
      persona: agent.persona,
      status: agent.status,
      currentIssue: agent.currentIssue?.number
    }));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: generate-solution.js <issue-number> [agent-type]');
    console.error('Agent types:', Object.keys(AGENT_CONFIGS).join(', '));
    process.exit(1);
  }
  
  const issueNumber = parseInt(args[0]);
  const agentType = args[1] || 'frontend';
  
  if (isNaN(issueNumber)) {
    console.error('Invalid issue number:', args[0]);
    process.exit(1);
  }
  
  if (!AGENT_CONFIGS[agentType]) {
    console.error('Invalid agent type:', agentType);
    console.error('Available types:', Object.keys(AGENT_CONFIGS).join(', '));
    process.exit(1);
  }
  
  const generator = new SolutionGenerator();
  
  try {
    const result = await generator.generateSolution(issueNumber, agentType);
    
    if (result.success) {
      console.log('✅ Solution generated successfully!');
      console.log(`   Agent: ${result.agentId}`);
      console.log(`   PR: #${result.pullRequest.number}`);
      console.log(`   Time: ${(result.executionTime / 1000).toFixed(2)}s`);
    } else {
      console.error('❌ Failed to generate solution:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Export for use by orchestrator
module.exports = { SolutionGenerator, AGENT_CONFIGS };

// Run if called directly
if (require.main === module) {
  main();
}