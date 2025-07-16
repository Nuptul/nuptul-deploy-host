#!/usr/bin/env node

/**
 * Issue Analysis Agent
 * 
 * Analyzes GitHub issues to determine the appropriate agent type and priority level
 * for routing in the multi-agent system.
 */

const { Octokit } = require('@octokit/rest');

class IssueAnalyzer {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.config = config;
    this.analysis = {
      agent_type: null,
      priority: 'medium',
      confidence: 0,
      reasoning: [],
      labels: [],
      estimated_effort: 'unknown'
    };
  }

  async analyzeIssue(issueNumber, title, body, labels = []) {
    console.log(`Analyzing issue #${issueNumber}: ${title}`);
    
    try {
      // Combine title and body for analysis
      const content = `${title} ${body}`.toLowerCase();
      const issueLabels = labels.map(label => label.name ? label.name.toLowerCase() : label.toLowerCase());
      
      // Analyze content patterns
      this.analyzeContentPatterns(content);
      this.analyzeLabelPatterns(issueLabels);
      this.analyzePriority(content, issueLabels);
      this.estimateEffort(content);
      
      // Output results for GitHub Actions
      this.outputResults();
      
      return this.analysis;
      
    } catch (error) {
      console.error('Issue analysis failed:', error);
      // Default to fullstack agent for unknown issues
      this.analysis.agent_type = 'fullstack';
      this.analysis.priority = 'medium';
      this.analysis.reasoning.push('Analysis failed, defaulting to fullstack agent');
      this.outputResults();
      return this.analysis;
    }
  }

  analyzeContentPatterns(content) {
    const patterns = {
      frontend: [
        'ui', 'ux', 'component', 'react', 'vue', 'angular', 'css', 'html', 'javascript',
        'responsive', 'design', 'interface', 'button', 'form', 'modal', 'navigation',
        'styling', 'theme', 'layout', 'mobile', 'desktop', 'browser', 'client-side'
      ],
      backend: [
        'api', 'server', 'database', 'sql', 'postgresql', 'supabase', 'endpoint',
        'authentication', 'authorization', 'cors', 'middleware', 'routes', 'controller',
        'model', 'schema', 'migration', 'query', 'performance', 'caching', 'server-side'
      ],
      security: [
        'security', 'vulnerability', 'auth', 'authentication', 'authorization', 'permission',
        'encrypt', 'decrypt', 'token', 'jwt', 'oauth', 'password', 'hash', 'ssl', 'tls',
        'xss', 'csrf', 'injection', 'sanitize', 'validate', 'firewall', 'audit'
      ],
      performance: [
        'performance', 'slow', 'speed', 'optimization', 'memory', 'cpu', 'load time',
        'latency', 'throttle', 'cache', 'bundle', 'minify', 'compress', 'lazy load',
        'core web vitals', 'lighthouse', 'profiling', 'benchmark'
      ],
      qa: [
        'test', 'testing', 'spec', 'e2e', 'unit test', 'integration test', 'cypress',
        'playwright', 'jest', 'vitest', 'coverage', 'bug', 'broken', 'error', 'fail',
        'assertion', 'mock', 'stub', 'quality assurance'
      ],
      devops: [
        'deploy', 'deployment', 'ci/cd', 'github actions', 'workflow', 'pipeline',
        'build', 'docker', 'container', 'netlify', 'hosting', 'environment', 'config',
        'secret', 'env var', 'infrastructure', 'monitoring', 'logging'
      ],
      refactorer: [
        'refactor', 'cleanup', 'code quality', 'technical debt', 'duplicate code',
        'smell', 'maintainability', 'readability', 'structure', 'organization',
        'lint', 'format', 'convention', 'best practice'
      ],
      scribe: [
        'documentation', 'docs', 'readme', 'guide', 'tutorial', 'example', 'comment',
        'jsdoc', 'api doc', 'changelog', 'wiki', 'help', 'instruction', 'specification'
      ]
    };

    let maxScore = 0;
    let bestMatch = 'fullstack';
    
    Object.entries(patterns).forEach(([agentType, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
          this.analysis.reasoning.push(`Found "${keyword}" (${agentType})`);
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = agentType;
      }
    });

    this.analysis.agent_type = bestMatch;
    this.analysis.confidence = Math.min(maxScore / 3, 1.0); // Normalize confidence
    
    if (maxScore === 0) {
      this.analysis.agent_type = 'fullstack';
      this.analysis.reasoning.push('No specific patterns found, using fullstack agent');
    }
  }

  analyzeLabelPatterns(labels) {
    const labelToAgent = {
      'bug': 'qa',
      'enhancement': 'fullstack',
      'feature': 'fullstack',
      'frontend': 'frontend',
      'backend': 'backend',
      'ui': 'frontend',
      'api': 'backend',
      'security': 'security',
      'performance': 'performance',
      'testing': 'qa',
      'documentation': 'scribe',
      'refactor': 'refactorer',
      'devops': 'devops',
      'deployment': 'devops'
    };

    let labelScore = {};
    
    labels.forEach(label => {
      const agentType = labelToAgent[label];
      if (agentType) {
        labelScore[agentType] = (labelScore[agentType] || 0) + 2; // Labels have higher weight
        this.analysis.reasoning.push(`Label "${label}" suggests ${agentType} agent`);
      }
    });

    // If labels strongly suggest a different agent, use it
    const strongestLabel = Object.entries(labelScore).reduce((a, b) => 
      labelScore[a[0]] > labelScore[b[0]] ? a : b, ['', 0]);
    
    if (strongestLabel[1] >= 2) {
      this.analysis.agent_type = strongestLabel[0];
      this.analysis.confidence = Math.min(this.analysis.confidence + 0.3, 1.0);
    }
  }

  analyzePriority(content, labels) {
    const priorityIndicators = {
      critical: ['critical', 'urgent', 'emergency', 'broken', 'down', 'crash', 'security breach'],
      high: ['high priority', 'important', 'blocking', 'blocker', 'asap', 'regression'],
      medium: ['medium', 'normal', 'standard'],
      low: ['low priority', 'nice to have', 'enhancement', 'minor', 'cosmetic', 'documentation']
    };

    // Check labels first
    const priorityLabels = ['critical', 'high', 'medium', 'low', 'urgent', 'important'];
    const foundPriorityLabel = labels.find(label => priorityLabels.includes(label));
    
    if (foundPriorityLabel) {
      if (['critical', 'urgent'].includes(foundPriorityLabel)) {
        this.analysis.priority = 'critical';
      } else if (['high', 'important'].includes(foundPriorityLabel)) {
        this.analysis.priority = 'high';
      } else if (foundPriorityLabel === 'low') {
        this.analysis.priority = 'low';
      }
      this.analysis.reasoning.push(`Priority set by label: ${foundPriorityLabel}`);
      return;
    }

    // Check content for priority indicators
    Object.entries(priorityIndicators).forEach(([priority, indicators]) => {
      indicators.forEach(indicator => {
        if (content.includes(indicator)) {
          this.analysis.priority = priority;
          this.analysis.reasoning.push(`Priority "${priority}" due to: ${indicator}`);
        }
      });
    });
  }

  estimateEffort(content) {
    const effortIndicators = {
      small: ['typo', 'text change', 'color', 'small fix', 'minor'],
      medium: ['feature', 'component', 'page', 'endpoint', 'test'],
      large: ['refactor', 'redesign', 'migration', 'architecture', 'major'],
      xl: ['complete rewrite', 'new system', 'major overhaul', 'breaking change']
    };

    let effortScore = { small: 0, medium: 0, large: 0, xl: 0 };
    
    Object.entries(effortIndicators).forEach(([effort, indicators]) => {
      indicators.forEach(indicator => {
        if (content.includes(indicator)) {
          effortScore[effort]++;
        }
      });
    });

    const maxEffort = Object.entries(effortScore).reduce((a, b) => 
      effortScore[a[0]] > effortScore[b[0]] ? a : b, ['medium', 0]);
    
    this.analysis.estimated_effort = maxEffort[0];
    if (maxEffort[1] > 0) {
      this.analysis.reasoning.push(`Estimated effort: ${maxEffort[0]}`);
    }
  }

  outputResults() {
    // Output for GitHub Actions
    console.log(`::set-output name=agent_type::${this.analysis.agent_type}`);
    console.log(`::set-output name=priority::${this.analysis.priority}`);
    console.log(`::set-output name=confidence::${this.analysis.confidence}`);
    console.log(`::set-output name=effort::${this.analysis.estimated_effort}`);
    
    // Summary output
    console.log('\\n--- Analysis Results ---');
    console.log(`Agent Type: ${this.analysis.agent_type}`);
    console.log(`Priority: ${this.analysis.priority}`);
    console.log(`Confidence: ${(this.analysis.confidence * 100).toFixed(1)}%`);
    console.log(`Estimated Effort: ${this.analysis.estimated_effort}`);
    console.log('\\nReasoning:');
    this.analysis.reasoning.forEach(reason => console.log(`  • ${reason}`));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const config = {};
  
  let issueNumber, title, body, labels = [];
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--issue-number=')) {
      issueNumber = arg.split('=')[1];
    } else if (arg.startsWith('--issue-title=')) {
      title = arg.split('=')[1];
    } else if (arg.startsWith('--issue-body=')) {
      body = arg.split('=')[1];
    } else if (arg.startsWith('--issue-labels=')) {
      try {
        labels = JSON.parse(arg.split('=')[1]);
      } catch (e) {
        labels = [];
      }
    }
  });

  if (!issueNumber || !title) {
    console.error('Missing required arguments: --issue-number and --issue-title');
    process.exit(1);
  }

  const analyzer = new IssueAnalyzer(config);
  await analyzer.analyzeIssue(issueNumber, title, body || '', labels);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = IssueAnalyzer;