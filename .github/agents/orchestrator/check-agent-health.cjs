#!/usr/bin/env node

/**
 * Agent Health Monitor
 * 
 * Monitors the health and performance of all active agents in the multi-agent system.
 * Provides real-time status updates, performance metrics, and failure detection.
 */

const { Octokit } = require('@octokit/rest');

class AgentHealthMonitor {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.config = config;
    this.healthData = {
      agents: {},
      system: {
        status: 'healthy',
        uptime: Date.now(),
        last_check: null,
        total_agents: 0,
        active_agents: 0,
        failed_agents: 0
      },
      metrics: {
        response_times: {},
        success_rates: {},
        workload_distribution: {},
        error_counts: {}
      }
    };
    
    this.thresholds = {
      response_time_warning: 30000, // 30 seconds
      response_time_critical: 120000, // 2 minutes
      failure_rate_warning: 0.1, // 10%
      failure_rate_critical: 0.25, // 25%
      max_idle_time: 1800000, // 30 minutes
      max_workload: 10 // Maximum issues per agent
    };
  }

  async checkSystemHealth() {
    console.log('🏥 Starting Agent Health Check');
    console.log('==============================\n');

    try {
      await this.gatherAgentData();
      await this.analyzePerformanceMetrics();
      await this.checkResourceUtilization();
      await this.detectFailures();
      await this.generateHealthReport();
      
      return this.healthData;
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.healthData.system.status = 'critical';
      await this.reportSystemFailure(error);
      return this.healthData;
    }
  }

  async gatherAgentData() {
    console.log('📊 Gathering agent data...');
    
    try {
      // Get all open issues assigned to agents
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        state: 'open',
        labels: 'agent-assigned',
        per_page: 100
      });

      // Get recent workflow runs for agent activity
      const { data: workflowRuns } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        per_page: 50
      });

      this.processIssueData(issues);
      this.processWorkflowData(workflowRuns.workflow_runs);
      
      console.log(`✅ Processed ${issues.length} assigned issues and ${workflowRuns.workflow_runs.length} workflow runs`);
      
    } catch (error) {
      console.error('Failed to gather agent data:', error);
      throw error;
    }
  }

  processIssueData(issues) {
    const agentTypes = {};
    
    issues.forEach(issue => {
      const agentLabel = issue.labels.find(label => 
        label.name.startsWith('agent:') || label.name.startsWith('assigned:')
      );
      
      if (agentLabel) {
        const agentType = agentLabel.name.split(':')[1];
        const agentIdLabel = issue.labels.find(label => label.name.startsWith('agent-id:'));
        const agentId = agentIdLabel ? agentIdLabel.name.split(':')[1] : `${agentType}-unknown`;
        
        if (!agentTypes[agentType]) {
          agentTypes[agentType] = {
            type: agentType,
            instances: {},
            total_workload: 0,
            avg_age: 0,
            status: 'active'
          };
        }
        
        if (!agentTypes[agentType].instances[agentId]) {
          agentTypes[agentType].instances[agentId] = {
            id: agentId,
            workload: 0,
            oldest_issue: null,
            newest_issue: null,
            issues: [],
            status: 'active',
            last_activity: null
          };
        }
        
        const issueAge = Date.now() - new Date(issue.created_at).getTime();
        agentTypes[agentType].instances[agentId].workload++;
        agentTypes[agentType].instances[agentId].issues.push({
          number: issue.number,
          title: issue.title,
          age: issueAge,
          priority: this.extractPriority(issue.labels),
          created_at: issue.created_at,
          updated_at: issue.updated_at
        });
        
        agentTypes[agentType].total_workload++;
        
        // Track oldest and newest issues
        if (!agentTypes[agentType].instances[agentId].oldest_issue || 
            issueAge > agentTypes[agentType].instances[agentId].oldest_issue.age) {
          agentTypes[agentType].instances[agentId].oldest_issue = {
            number: issue.number,
            age: issueAge
          };
        }
        
        if (!agentTypes[agentType].instances[agentId].newest_issue || 
            issueAge < agentTypes[agentType].instances[agentId].newest_issue.age) {
          agentTypes[agentType].instances[agentId].newest_issue = {
            number: issue.number,
            age: issueAge
          };
        }
      }
    });

    this.healthData.agents = agentTypes;
    this.healthData.system.total_agents = Object.keys(agentTypes).length;
  }

  processWorkflowData(workflowRuns) {
    const agentActivity = {};
    
    workflowRuns.forEach(run => {
      // Look for agent-related workflows
      if (run.name && (run.name.includes('agent') || run.name.includes('orchestrator'))) {
        const runTime = new Date(run.run_started_at || run.created_at).getTime();
        const completionTime = run.updated_at ? new Date(run.updated_at).getTime() : null;
        const duration = completionTime ? completionTime - runTime : null;
        
        if (!agentActivity[run.name]) {
          agentActivity[run.name] = {
            runs: [],
            success_rate: 0,
            avg_duration: 0,
            last_run: null
          };
        }
        
        agentActivity[run.name].runs.push({
          id: run.id,
          status: run.status,
          conclusion: run.conclusion,
          duration: duration,
          started_at: run.run_started_at || run.created_at,
          updated_at: run.updated_at
        });
        
        if (!agentActivity[run.name].last_run || runTime > new Date(agentActivity[run.name].last_run).getTime()) {
          agentActivity[run.name].last_run = run.run_started_at || run.created_at;
        }
      }
    });

    // Calculate success rates and average durations
    Object.values(agentActivity).forEach(activity => {
      const completedRuns = activity.runs.filter(run => run.conclusion);
      const successfulRuns = completedRuns.filter(run => run.conclusion === 'success');
      
      activity.success_rate = completedRuns.length > 0 ? 
        successfulRuns.length / completedRuns.length : 0;
      
      const durationsWithValues = activity.runs.filter(run => run.duration);
      activity.avg_duration = durationsWithValues.length > 0 ?
        durationsWithValues.reduce((sum, run) => sum + run.duration, 0) / durationsWithValues.length : 0;
    });

    this.healthData.metrics.workflow_activity = agentActivity;
  }

  extractPriority(labels) {
    const priorityLabel = labels.find(label => label.name.startsWith('priority:'));
    return priorityLabel ? priorityLabel.name.split(':')[1] : 'medium';
  }

  async analyzePerformanceMetrics() {
    console.log('📈 Analyzing performance metrics...');
    
    Object.entries(this.healthData.agents).forEach(([agentType, agentData]) => {
      // Calculate workload distribution
      const instances = Object.values(agentData.instances);
      const workloads = instances.map(instance => instance.workload);
      const avgWorkload = workloads.reduce((sum, load) => sum + load, 0) / workloads.length;
      
      this.healthData.metrics.workload_distribution[agentType] = {
        average: avgWorkload,
        min: Math.min(...workloads),
        max: Math.max(...workloads),
        total: agentData.total_workload,
        instances: instances.length
      };

      // Check for overloaded agents
      instances.forEach(instance => {
        if (instance.workload > this.thresholds.max_workload) {
          instance.status = 'overloaded';
          console.warn(`⚠️  Agent ${instance.id} is overloaded (${instance.workload} issues)`);
        }
        
        // Check for stale issues
        if (instance.oldest_issue && instance.oldest_issue.age > this.thresholds.max_idle_time) {
          instance.status = 'stale';
          console.warn(`⚠️  Agent ${instance.id} has stale issue #${instance.oldest_issue.number}`);
        }
      });
    });

    console.log('✅ Performance metrics analyzed');
  }

  async checkResourceUtilization() {
    console.log('💾 Checking resource utilization...');
    
    let activeAgents = 0;
    let overloadedAgents = 0;
    let staleAgents = 0;
    let totalWorkload = 0;

    Object.values(this.healthData.agents).forEach(agentData => {
      Object.values(agentData.instances).forEach(instance => {
        activeAgents++;
        totalWorkload += instance.workload;
        
        if (instance.status === 'overloaded') {
          overloadedAgents++;
        }
        
        if (instance.status === 'stale') {
          staleAgents++;
        }
      });
    });

    this.healthData.system.active_agents = activeAgents;
    this.healthData.system.failed_agents = overloadedAgents + staleAgents;
    
    this.healthData.metrics.resource_utilization = {
      total_workload: totalWorkload,
      avg_workload_per_agent: activeAgents > 0 ? totalWorkload / activeAgents : 0,
      overloaded_agents: overloadedAgents,
      stale_agents: staleAgents,
      utilization_rate: activeAgents > 0 ? totalWorkload / (activeAgents * this.thresholds.max_workload) : 0
    };

    console.log(`✅ Resource utilization: ${activeAgents} active agents, ${totalWorkload} total workload`);
  }

  async detectFailures() {
    console.log('🔍 Detecting failures and anomalies...');
    
    const failures = [];
    const warnings = [];
    
    // Check workflow success rates
    Object.entries(this.healthData.metrics.workflow_activity || {}).forEach(([workflowName, activity]) => {
      if (activity.success_rate < this.thresholds.failure_rate_critical) {
        failures.push({
          type: 'workflow_failure',
          workflow: workflowName,
          success_rate: activity.success_rate,
          severity: 'critical'
        });
      } else if (activity.success_rate < this.thresholds.failure_rate_warning) {
        warnings.push({
          type: 'workflow_degradation',
          workflow: workflowName,
          success_rate: activity.success_rate,
          severity: 'warning'
        });
      }
      
      // Check response times
      if (activity.avg_duration > this.thresholds.response_time_critical) {
        failures.push({
          type: 'slow_response',
          workflow: workflowName,
          avg_duration: activity.avg_duration,
          severity: 'critical'
        });
      } else if (activity.avg_duration > this.thresholds.response_time_warning) {
        warnings.push({
          type: 'slow_response',
          workflow: workflowName,
          avg_duration: activity.avg_duration,
          severity: 'warning'
        });
      }
    });

    // Check agent health
    Object.entries(this.healthData.agents).forEach(([agentType, agentData]) => {
      Object.values(agentData.instances).forEach(instance => {
        if (instance.status === 'overloaded') {
          warnings.push({
            type: 'agent_overload',
            agent_type: agentType,
            agent_id: instance.id,
            workload: instance.workload,
            severity: 'warning'
          });
        }
        
        if (instance.status === 'stale') {
          failures.push({
            type: 'agent_stale',
            agent_type: agentType,
            agent_id: instance.id,
            oldest_issue_age: instance.oldest_issue?.age,
            severity: 'critical'
          });
        }
      });
    });

    this.healthData.system.failures = failures;
    this.healthData.system.warnings = warnings;
    
    // Determine overall system status
    if (failures.length > 0) {
      this.healthData.system.status = 'critical';
    } else if (warnings.length > 0) {
      this.healthData.system.status = 'warning';
    } else {
      this.healthData.system.status = 'healthy';
    }

    console.log(`✅ Detected ${failures.length} failures and ${warnings.length} warnings`);
  }

  async generateHealthReport() {
    console.log('\n📋 Health Report');
    console.log('================\n');
    
    const status = this.healthData.system.status;
    const statusEmoji = {
      healthy: '✅',
      warning: '⚠️',
      critical: '❌'
    };

    console.log(`${statusEmoji[status]} System Status: ${status.toUpperCase()}`);
    console.log(`🤖 Active Agents: ${this.healthData.system.active_agents}`);
    console.log(`⚡ Total Workload: ${this.healthData.metrics.resource_utilization?.total_workload || 0}`);
    console.log(`🔄 Agent Types: ${this.healthData.system.total_agents}`);
    
    if (this.healthData.system.failures?.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.healthData.system.failures.forEach(failure => {
        console.log(`  • ${failure.type}: ${this.formatFailureMessage(failure)}`);
      });
    }
    
    if (this.healthData.system.warnings?.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.healthData.system.warnings.forEach(warning => {
        console.log(`  • ${warning.type}: ${this.formatFailureMessage(warning)}`);
      });
    }

    // Agent breakdown
    console.log('\n🤖 Agent Breakdown:');
    Object.entries(this.healthData.agents).forEach(([agentType, agentData]) => {
      const instances = Object.values(agentData.instances);
      const avgWorkload = instances.length > 0 ? 
        instances.reduce((sum, inst) => sum + inst.workload, 0) / instances.length : 0;
      
      console.log(`  ${agentType}: ${instances.length} instances, ${agentData.total_workload} total workload (avg: ${avgWorkload.toFixed(1)})`);
    });

    // Output GitHub Actions results
    this.outputGitHubActions();
  }

  formatFailureMessage(failure) {
    switch (failure.type) {
      case 'workflow_failure':
        return `${failure.workflow} (${(failure.success_rate * 100).toFixed(1)}% success rate)`;
      case 'slow_response':
        return `${failure.workflow} (${(failure.avg_duration / 1000).toFixed(1)}s avg duration)`;
      case 'agent_overload':
        return `${failure.agent_id} (${failure.workload} issues)`;
      case 'agent_stale':
        return `${failure.agent_id} (${Math.round(failure.oldest_issue_age / 60000)}min stale)`;
      default:
        return JSON.stringify(failure);
    }
  }

  outputGitHubActions() {
    // Set outputs for GitHub Actions
    console.log(`::set-output name=status::${this.healthData.system.status}`);
    console.log(`::set-output name=active_agents::${this.healthData.system.active_agents}`);
    console.log(`::set-output name=failed_agents::${this.healthData.system.failed_agents}`);
    console.log(`::set-output name=total_workload::${this.healthData.metrics.resource_utilization?.total_workload || 0}`);
    console.log(`::set-output name=failure_count::${this.healthData.system.failures?.length || 0}`);
    console.log(`::set-output name=warning_count::${this.healthData.system.warnings?.length || 0}`);
  }

  async reportSystemFailure(error) {
    try {
      // Create a GitHub issue for system failure
      await this.octokit.rest.issues.create({
        owner: process.env.GITHUB_REPOSITORY.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY.split('/')[1],
        title: '🚨 Agent Health Monitor System Failure',
        body: `**System Status:** Critical Failure\n\n**Error:** ${error.message}\n\n**Stack Trace:**\n\`\`\`\n${error.stack}\n\`\`\`\n\n**Timestamp:** ${new Date().toISOString()}\n\n---\n*This issue was automatically created by the Agent Health Monitor*`,
        labels: ['critical', 'system-failure', 'health-monitor', 'automated']
      });
      
      console.log('🚨 System failure reported to GitHub Issues');
      
    } catch (reportError) {
      console.error('Failed to report system failure:', reportError);
    }
  }

  async triggerRecoveryActions() {
    console.log('🔧 Triggering recovery actions...');
    
    const failures = this.healthData.system.failures || [];
    const recoveryActions = [];
    
    failures.forEach(failure => {
      switch (failure.type) {
        case 'agent_overload':
          recoveryActions.push({
            action: 'rebalance_workload',
            agent_type: failure.agent_type,
            agent_id: failure.agent_id
          });
          break;
        case 'agent_stale':
          recoveryActions.push({
            action: 'escalate_stale_issues',
            agent_type: failure.agent_type,
            agent_id: failure.agent_id
          });
          break;
        case 'workflow_failure':
          recoveryActions.push({
            action: 'restart_workflow',
            workflow: failure.workflow
          });
          break;
      }
    });

    // Log recovery actions (implementation would depend on specific needs)
    console.log(`✅ Scheduled ${recoveryActions.length} recovery actions`);
    recoveryActions.forEach(action => {
      console.log(`  • ${action.action}: ${JSON.stringify(action)}`);
    });
    
    return recoveryActions;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const config = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg === '--trigger-recovery') {
      config.triggerRecovery = true;
    } else if (arg === '--detailed') {
      config.detailed = true;
    }
  });

  const monitor = new AgentHealthMonitor(config);
  const healthData = await monitor.checkSystemHealth();
  
  // Trigger recovery actions if requested and failures detected
  if (config.triggerRecovery && healthData.system.failures?.length > 0) {
    await monitor.triggerRecoveryActions();
  }
  
  // Set exit code based on system status
  const exitCode = healthData.system.status === 'critical' ? 1 : 0;
  console.log(`\nHealth check completed with status: ${healthData.system.status}`);
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = AgentHealthMonitor;