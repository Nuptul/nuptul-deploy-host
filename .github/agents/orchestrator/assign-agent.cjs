#!/usr/bin/env node

/**
 * Agent Assignment Manager
 * 
 * Assigns GitHub issues to appropriate development agents based on analysis results
 * and current agent workload. Manages the agent pool and load balancing.
 */

const { Octokit } = require('@octokit/rest');

class AgentAssignmentManager {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.config = config;
    this.agentPool = this.parseAgentPool();
    this.assignmentLog = [];
  }

  parseAgentPool() {
    try {
      const poolConfig = process.env.AGENT_POOL || '{}';
      const pool = JSON.parse(poolConfig);
      
      // Default agent pool if not configured
      return {
        frontend: 2,
        backend: 2,
        fullstack: 1,
        security: 1,
        performance: 1,
        qa: 1,
        devops: 1,
        refactorer: 1,
        scribe: 1,
        ...pool
      };
    } catch (error) {
      console.warn('Failed to parse AGENT_POOL, using defaults');
      return {
        frontend: 2,
        backend: 2,
        fullstack: 1,
        security: 1,
        performance: 1,
        qa: 1,
        devops: 1,
        refactorer: 1,
        scribe: 1
      };
    }
  }

  async assignAgent(issueNumber, agentType, priority) {
    console.log(`Assigning issue #${issueNumber} to ${agentType} agent (priority: ${priority})`);
    
    try {
      // Get current agent workload
      const workload = await this.getAgentWorkload();
      
      // Find available agent
      const assignedAgent = await this.findAvailableAgent(agentType, workload);
      
      if (!assignedAgent) {
        console.warn(`No available ${agentType} agents, using fallback strategy`);
        const fallbackAgent = await this.findFallbackAgent(workload);
        return await this.performAssignment(issueNumber, fallbackAgent, priority, true);
      }
      
      return await this.performAssignment(issueNumber, assignedAgent, priority, false);
      
    } catch (error) {
      console.error('Agent assignment failed:', error);
      // Emergency fallback - assign to any available agent
      return await this.emergencyAssignment(issueNumber, priority);
    }
  }

  async getAgentWorkload() {
    try {
      // Get all open issues assigned to agents
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        state: 'open',
        labels: 'agent-assigned',
        per_page: 100
      });

      const workload = {};
      
      // Initialize workload counters
      Object.keys(this.agentPool).forEach(agentType => {
        workload[agentType] = 0;
      });

      // Count current assignments
      issues.forEach(issue => {
        const agentLabel = issue.labels.find(label => 
          label.name.startsWith('agent:') || label.name.startsWith('assigned:')
        );
        
        if (agentLabel) {
          const agentType = agentLabel.name.split(':')[1];
          if (workload[agentType] !== undefined) {
            workload[agentType]++;
          }
        }
      });

      console.log('Current agent workload:', workload);
      return workload;
      
    } catch (error) {
      console.error('Failed to get agent workload:', error);
      // Return empty workload on error
      const emptyWorkload = {};
      Object.keys(this.agentPool).forEach(agentType => {
        emptyWorkload[agentType] = 0;
      });
      return emptyWorkload;
    }
  }

  async findAvailableAgent(preferredAgentType, workload) {
    const maxCapacity = this.agentPool[preferredAgentType] || 1;
    const currentLoad = workload[preferredAgentType] || 0;
    
    if (currentLoad < maxCapacity) {
      console.log(`${preferredAgentType} agent available (${currentLoad}/${maxCapacity})`);
      return {
        type: preferredAgentType,
        id: `${preferredAgentType}-${currentLoad + 1}`,
        workload: currentLoad
      };
    }
    
    console.log(`${preferredAgentType} agents at capacity (${currentLoad}/${maxCapacity})`);
    return null;
  }

  async findFallbackAgent(workload) {
    // Try fallback order: fullstack -> frontend -> backend -> others
    const fallbackOrder = ['fullstack', 'frontend', 'backend', 'qa', 'devops', 'security', 'performance', 'refactorer', 'scribe'];
    
    for (const agentType of fallbackOrder) {
      const maxCapacity = this.agentPool[agentType] || 1;
      const currentLoad = workload[agentType] || 0;
      
      if (currentLoad < maxCapacity) {
        console.log(`Using fallback agent: ${agentType} (${currentLoad}/${maxCapacity})`);
        return {
          type: agentType,
          id: `${agentType}-${currentLoad + 1}`,
          workload: currentLoad,
          isFallback: true
        };
      }
    }
    
    // If all agents are at capacity, assign to least loaded
    const leastLoaded = Object.entries(workload).reduce((a, b) => 
      workload[a[0]] < workload[b[0]] ? a : b);
    
    console.log(`All agents at capacity, using least loaded: ${leastLoaded[0]}`);
    return {
      type: leastLoaded[0],
      id: `${leastLoaded[0]}-overload`,
      workload: leastLoaded[1],
      isOverload: true
    };
  }

  async performAssignment(issueNumber, agent, priority, isFallback) {
    try {
      const labels = [
        `agent:${agent.type}`,
        `agent-assigned`,
        `priority:${priority}`,
        `agent-id:${agent.id}`
      ];
      
      if (isFallback) {
        labels.push('fallback-assignment');
      }
      
      if (agent.isOverload) {
        labels.push('overload-assignment');
      }

      // Add labels to issue
      await this.octokit.rest.issues.addLabels({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        issue_number: issueNumber,
        labels: labels
      });

      // Add assignment comment
      const comment = this.generateAssignmentComment(agent, priority, isFallback);
      await this.octokit.rest.issues.createComment({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        issue_number: issueNumber,
        body: comment
      });

      // Log assignment
      this.logAssignment(issueNumber, agent, priority, isFallback);
      
      console.log(`✅ Issue #${issueNumber} assigned to ${agent.type} agent (${agent.id})`);
      
      return {
        success: true,
        agent: agent,
        priority: priority,
        isFallback: isFallback
      };
      
    } catch (error) {
      console.error(`Failed to assign issue #${issueNumber}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateAssignmentComment(agent, priority, isFallback) {
    let comment = `🤖 **Agent Assignment**\\n\\n`;
    comment += `**Agent Type:** ${agent.type}\\n`;
    comment += `**Agent ID:** ${agent.id}\\n`;
    comment += `**Priority:** ${priority}\\n`;
    comment += `**Workload:** ${agent.workload + 1}/${this.agentPool[agent.type] || 1}\\n\\n`;
    
    if (isFallback) {
      comment += `⚠️ **Fallback Assignment:** Preferred agent type was unavailable.\\n\\n`;
    }
    
    if (agent.isOverload) {
      comment += `🔴 **Overload Assignment:** All agents at capacity, expect delays.\\n\\n`;
    }
    
    comment += `📋 **Next Steps:**\\n`;
    comment += `1. Agent will analyze the issue requirements\\n`;
    comment += `2. Create a development branch\\n`;
    comment += `3. Implement the solution\\n`;
    comment += `4. Create a pull request for review\\n\\n`;
    
    comment += `🔍 **Track Progress:** Monitor the agent dashboard for real-time updates.\\n`;
    comment += `⏱️ **Expected Response:** ${this.getExpectedResponseTime(priority)}\\n\\n`;
    
    comment += `---\\n`;
    comment += `*This assignment was made by the Nuptul Multi-Agent Orchestrator*`;
    
    return comment;
  }

  getExpectedResponseTime(priority) {
    const responseTime = {
      critical: '< 30 minutes',
      high: '< 2 hours',
      medium: '< 8 hours',
      low: '< 24 hours'
    };
    
    return responseTime[priority] || '< 8 hours';
  }

  logAssignment(issueNumber, agent, priority, isFallback) {
    const assignment = {
      timestamp: new Date().toISOString(),
      issueNumber: issueNumber,
      agentType: agent.type,
      agentId: agent.id,
      priority: priority,
      workload: agent.workload + 1,
      capacity: this.agentPool[agent.type],
      isFallback: isFallback,
      isOverload: agent.isOverload || false
    };
    
    this.assignmentLog.push(assignment);
    console.log('Assignment logged:', JSON.stringify(assignment, null, 2));
  }

  async emergencyAssignment(issueNumber, priority) {
    try {
      console.log(`🚨 Emergency assignment for issue #${issueNumber}`);
      
      // Assign to fullstack agent regardless of capacity
      const emergencyAgent = {
        type: 'fullstack',
        id: 'emergency-handler',
        workload: 999,
        isOverload: true,
        isEmergency: true
      };
      
      const result = await this.performAssignment(issueNumber, emergencyAgent, priority, true);
      
      // Add emergency label
      await this.octokit.rest.issues.addLabels({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        issue_number: issueNumber,
        labels: ['emergency-assignment', 'needs-manual-review']
      });
      
      return result;
      
    } catch (error) {
      console.error('Emergency assignment failed:', error);
      return {
        success: false,
        error: 'Emergency assignment failed'
      };
    }
  }

  outputMetrics() {
    console.log('\\n--- Assignment Metrics ---');
    console.log(`Total assignments: ${this.assignmentLog.length}`);
    
    if (this.assignmentLog.length > 0) {
      const agentCounts = {};
      let fallbackCount = 0;
      let overloadCount = 0;
      
      this.assignmentLog.forEach(assignment => {
        agentCounts[assignment.agentType] = (agentCounts[assignment.agentType] || 0) + 1;
        if (assignment.isFallback) fallbackCount++;
        if (assignment.isOverload) overloadCount++;
      });
      
      console.log('Agent distribution:', agentCounts);
      console.log(`Fallback assignments: ${fallbackCount}`);
      console.log(`Overload assignments: ${overloadCount}`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  let issueNumber, agentType, priority;
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--issue-number=')) {
      issueNumber = arg.split('=')[1];
    } else if (arg.startsWith('--agent-type=')) {
      agentType = arg.split('=')[1];
    } else if (arg.startsWith('--priority=')) {
      priority = arg.split('=')[1];
    }
  });

  if (!issueNumber || !agentType || !priority) {
    console.error('Missing required arguments: --issue-number, --agent-type, --priority');
    process.exit(1);
  }

  const manager = new AgentAssignmentManager();
  const result = await manager.assignAgent(issueNumber, agentType, priority);
  
  manager.outputMetrics();
  
  if (!result.success) {
    console.error('Assignment failed:', result.error);
    process.exit(1);
  }
  
  console.log('Assignment completed successfully');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Assignment failed:', error);
    process.exit(1);
  });
}

module.exports = AgentAssignmentManager;