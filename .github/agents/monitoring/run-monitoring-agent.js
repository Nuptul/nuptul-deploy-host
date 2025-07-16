#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');
const { DashboardReporter } = require('../shared/dashboard-reporter');

/**
 * Monitoring Agent for Nuptial Multi-Agent System
 * Collects metrics, monitors agent health, and provides observability
 * Based on claude-code-hooks-multi-agent-observability patterns
 */
class MonitoringAgent {
  constructor(config) {
    this.config = config;
    this.agentId = config.agentId || `monitoring-agent-${Date.now()}`;
    
    // Initialize GitHub client
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.argv.find(arg => arg.includes('--github-token'))?.split('=')[1]
    });
    
    // Initialize dashboard reporter
    this.reporter = new DashboardReporter(this.agentId, 'monitoring');
    
    // Monitoring state
    this.agentRegistry = new Map();
    this.metrics = {
      system: {
        activeAgents: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgResponseTime: 0,
        errorRate: 0
      },
      agents: new Map(),
      activities: [],
      alerts: []
    };
    
    // WebSocket connections for real-time updates
    this.wsConnections = new Set();
    
    // Health check intervals
    this.healthCheckInterval = null;
    this.metricsCollectionInterval = null;
  }

  /**
   * Start monitoring operations
   */
  async startMonitoring() {
    console.log(`📊 Starting monitoring agent: ${this.agentId}`);
    
    await this.reporter.reportStatus('active', {
      currentTask: 'Initializing monitoring systems',
      capabilities: ['agent_health', 'metrics_collection', 'alert_generation']
    });
    
    await this.reporter.logActivity(
      'monitoring_started',
      'Monitoring Agent Started',
      'Initializing comprehensive system monitoring'
    );
    
    try {
      // Initialize monitoring systems
      await this.initializeMonitoring();
      
      // Start periodic tasks
      this.startPeriodicTasks();
      
      // Set up WebSocket server for real-time updates
      await this.setupWebSocketServer();
      
      // Start monitoring GitHub webhooks
      await this.monitorGitHubActivity();
      
      console.log('✅ Monitoring agent fully operational');
      
      await this.reporter.reportStatus('active', {
        currentTask: 'Active monitoring',
        systemsOnline: ['health_checks', 'metrics', 'websockets', 'github_monitoring']
      });
      
    } catch (error) {
      await this.handleError(error);
      throw error;
    }
  }

  /**
   * Initialize monitoring systems
   */
  async initializeMonitoring() {
    console.log('🔧 Initializing monitoring systems...');
    
    // Discover existing agents
    await this.discoverAgents();
    
    // Load historical metrics
    await this.loadHistoricalMetrics();
    
    // Initialize alert rules
    await this.initializeAlertRules();
    
    // Set up metric collection
    await this.setupMetricCollection();
    
    console.log('✅ Monitoring systems initialized');
  }

  /**
   * Discover and register existing agents
   */
  async discoverAgents() {
    console.log('🔍 Discovering active agents...');
    
    try {
      // Check GitHub Actions for running workflows
      const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
      
      const { data: workflows } = await this.octokit.actions.listWorkflowRuns({
        owner,
        repo,
        status: 'in_progress',
        per_page: 100
      });
      
      for (const workflow of workflows.workflow_runs) {
        if (workflow.name.includes('agent')) {
          const agentInfo = {
            id: `workflow-${workflow.id}`,
            type: this.extractAgentType(workflow.name),
            status: 'active',
            workflow_id: workflow.id,
            started_at: workflow.created_at,
            last_seen: new Date().toISOString()
          };
          
          this.agentRegistry.set(agentInfo.id, agentInfo);
          this.metrics.agents.set(agentInfo.id, {
            tasks_completed: 0,
            tasks_failed: 0,
            avg_response_time: 0,
            last_activity: new Date()
          });
        }
      }
      
      console.log(`📋 Discovered ${this.agentRegistry.size} active agents`);
      this.updateSystemMetrics();
      
    } catch (error) {
      console.error('❌ Agent discovery failed:', error);
    }
  }

  /**
   * Set up periodic monitoring tasks
   */
  startPeriodicTasks() {
    console.log('⏰ Starting periodic monitoring tasks...');
    
    // Health checks every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000);
    
    // Metrics collection every 60 seconds
    this.metricsCollectionInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 60000);
    
    // Cleanup old data every 5 minutes
    setInterval(async () => {
      await this.cleanupOldData();
    }, 300000);
  }

  /**
   * Perform health checks on all registered agents
   */
  async performHealthChecks() {
    console.log('🏥 Performing health checks...');
    
    for (const [agentId, agentInfo] of this.agentRegistry) {
      try {
        const health = await this.checkAgentHealth(agentInfo);
        
        if (!health.healthy) {
          await this.handleUnhealthyAgent(agentId, agentInfo, health);
        } else {
          // Update last seen
          agentInfo.last_seen = new Date().toISOString();
          agentInfo.status = 'active';
        }
        
      } catch (error) {
        console.error(`❌ Health check failed for ${agentId}:`, error);
        await this.handleUnhealthyAgent(agentId, agentInfo, {
          healthy: false,
          error: error.message
        });
      }
    }
    
    this.updateSystemMetrics();
  }

  /**
   * Check individual agent health
   */
  async checkAgentHealth(agentInfo) {
    const now = new Date();
    const lastSeen = new Date(agentInfo.last_seen);
    const timeSinceLastSeen = now - lastSeen;
    
    // If it's a workflow-based agent, check GitHub API
    if (agentInfo.workflow_id) {
      try {
        const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
        
        const { data: workflowRun } = await this.octokit.actions.getWorkflowRun({
          owner,
          repo,
          run_id: agentInfo.workflow_id
        });
        
        return {
          healthy: workflowRun.status === 'in_progress',
          status: workflowRun.status,
          conclusion: workflowRun.conclusion,
          last_update: workflowRun.updated_at
        };
        
      } catch (error) {
        return {
          healthy: false,
          error: error.message
        };
      }
    }
    
    // For other agents, check last seen time
    const maxInactiveTime = 5 * 60 * 1000; // 5 minutes
    return {
      healthy: timeSinceLastSeen < maxInactiveTime,
      timeSinceLastSeen,
      status: timeSinceLastSeen < maxInactiveTime ? 'active' : 'inactive'
    };
  }

  /**
   * Handle unhealthy agents
   */
  async handleUnhealthyAgent(agentId, agentInfo, health) {
    console.log(`⚠️ Agent ${agentId} is unhealthy:`, health);
    
    agentInfo.status = 'unhealthy';
    agentInfo.health_issue = health.error || 'Health check failed';
    
    // Generate alert
    const alert = {
      id: `alert-${Date.now()}`,
      type: 'agent_health',
      severity: 'high',
      agent_id: agentId,
      message: `Agent ${agentId} health check failed`,
      details: health,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.alerts.push(alert);
    
    // Report to dashboard
    await this.reporter.logActivity(
      'agent_health_alert',
      `Agent Health Alert: ${agentId}`,
      `Agent health check failed: ${health.error || 'Unknown error'}`
    );
    
    // Consider agent revival if configured
    if (this.config.auto_revival && agentInfo.type !== 'monitoring') {
      await this.attemptAgentRevival(agentId, agentInfo);
    }
  }

  /**
   * Collect system and agent metrics
   */
  async collectMetrics() {
    console.log('📊 Collecting system metrics...');
    
    try {
      // Update system metrics
      this.updateSystemMetrics();
      
      // Collect GitHub metrics
      await this.collectGitHubMetrics();
      
      // Collect performance metrics
      await this.collectPerformanceMetrics();
      
      // Report metrics to dashboard
      await this.reporter.reportMetric('active_agents', this.metrics.system.activeAgents);
      await this.reporter.reportMetric('total_tasks', this.metrics.system.totalTasks);
      await this.reporter.reportMetric('error_rate', this.metrics.system.errorRate);
      
      // Broadcast metrics via WebSocket
      this.broadcastMetrics();
      
    } catch (error) {
      console.error('❌ Metrics collection failed:', error);
    }
  }

  /**
   * Collect GitHub-specific metrics
   */
  async collectGitHubMetrics() {
    try {
      const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
      
      // Get recent workflow runs
      const { data: workflows } = await this.octokit.actions.listWorkflowRuns({
        owner,
        repo,
        per_page: 100
      });
      
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentRuns = workflows.workflow_runs.filter(
        run => new Date(run.created_at) > last24h
      );
      
      this.metrics.system.totalTasks = recentRuns.length;
      this.metrics.system.completedTasks = recentRuns.filter(
        run => run.conclusion === 'success'
      ).length;
      this.metrics.system.failedTasks = recentRuns.filter(
        run => run.conclusion === 'failure'
      ).length;
      
      // Calculate error rate
      if (this.metrics.system.totalTasks > 0) {
        this.metrics.system.errorRate = 
          this.metrics.system.failedTasks / this.metrics.system.totalTasks;
      }
      
      // Get recent issues and PRs
      const { data: issues } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: 100,
        since: last24h.toISOString()
      });
      
      const { data: pulls } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100
      });
      
      // Update activity log
      this.updateActivityLog('github_metrics_collected', {
        workflow_runs: recentRuns.length,
        issues: issues.length,
        pull_requests: pulls.length
      });
      
    } catch (error) {
      console.error('❌ GitHub metrics collection failed:', error);
    }
  }

  /**
   * Set up WebSocket server for real-time updates
   */
  async setupWebSocketServer() {
    const port = this.config.websocket_port || 8081;
    
    try {
      this.wss = new WebSocket.Server({ port });
      
      this.wss.on('connection', (ws) => {
        console.log('📡 New WebSocket connection established');
        this.wsConnections.add(ws);
        
        // Send initial state
        ws.send(JSON.stringify({
          type: 'initial_state',
          data: {
            agents: Array.from(this.agentRegistry.values()),
            metrics: this.metrics.system,
            alerts: this.metrics.alerts.slice(-10)
          }
        }));
        
        ws.on('close', () => {
          this.wsConnections.delete(ws);
          console.log('📡 WebSocket connection closed');
        });
        
        ws.on('error', (error) => {
          console.error('📡 WebSocket error:', error);
          this.wsConnections.delete(ws);
        });
      });
      
      console.log(`📡 WebSocket server listening on port ${port}`);
      
    } catch (error) {
      console.error('❌ Failed to setup WebSocket server:', error);
    }
  }

  /**
   * Broadcast metrics to connected WebSocket clients
   */
  broadcastMetrics() {
    if (this.wsConnections.size === 0) return;
    
    const message = JSON.stringify({
      type: 'metrics_update',
      data: {
        agents: Array.from(this.agentRegistry.values()),
        metrics: this.metrics.system,
        timestamp: new Date().toISOString()
      }
    });
    
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Update system-level metrics
   */
  updateSystemMetrics() {
    this.metrics.system.activeAgents = Array.from(this.agentRegistry.values())
      .filter(agent => agent.status === 'active').length;
    
    // Calculate average response time from agent metrics
    const agentMetrics = Array.from(this.metrics.agents.values());
    if (agentMetrics.length > 0) {
      this.metrics.system.avgResponseTime = 
        agentMetrics.reduce((sum, metric) => sum + metric.avg_response_time, 0) / 
        agentMetrics.length;
    }
  }

  /**
   * Update activity log
   */
  updateActivityLog(type, data) {
    const activity = {
      id: `activity-${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      agent_id: this.agentId
    };
    
    this.metrics.activities.push(activity);
    
    // Keep only last 1000 activities
    if (this.metrics.activities.length > 1000) {
      this.metrics.activities = this.metrics.activities.slice(-1000);
    }
    
    // Broadcast activity via WebSocket
    if (this.wsConnections.size > 0) {
      const message = JSON.stringify({
        type: 'new_activity',
        data: activity
      });
      
      this.wsConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  /**
   * Monitor GitHub activity via webhooks/polling
   */
  async monitorGitHubActivity() {
    console.log('🔍 Setting up GitHub activity monitoring...');
    
    // Poll for new events every 30 seconds
    setInterval(async () => {
      await this.checkGitHubEvents();
    }, 30000);
  }

  /**
   * Check for new GitHub events
   */
  async checkGitHubEvents() {
    try {
      const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
      
      // Get recent events
      const { data: events } = await this.octokit.activity.listRepoEvents({
        owner,
        repo,
        per_page: 50
      });
      
      const since = new Date(Date.now() - 60000); // Last minute
      const recentEvents = events.filter(
        event => new Date(event.created_at) > since
      );
      
      for (const event of recentEvents) {
        this.processGitHubEvent(event);
      }
      
    } catch (error) {
      console.error('❌ GitHub events check failed:', error);
    }
  }

  /**
   * Process individual GitHub events
   */
  processGitHubEvent(event) {
    const eventTypes = {
      'IssuesEvent': 'issue_activity',
      'PullRequestEvent': 'pr_activity',
      'WorkflowRunEvent': 'workflow_activity',
      'PushEvent': 'code_push'
    };
    
    const activityType = eventTypes[event.type] || 'github_activity';
    
    this.updateActivityLog(activityType, {
      event_type: event.type,
      actor: event.actor.login,
      action: event.payload.action,
      created_at: event.created_at
    });
  }

  /**
   * Initialize alert rules
   */
  async initializeAlertRules() {
    this.alertRules = [
      {
        name: 'high_error_rate',
        condition: () => this.metrics.system.errorRate > 0.1,
        severity: 'high',
        message: 'Error rate exceeds 10%'
      },
      {
        name: 'no_active_agents',
        condition: () => this.metrics.system.activeAgents === 0,
        severity: 'critical',
        message: 'No agents are currently active'
      },
      {
        name: 'slow_response_time',
        condition: () => this.metrics.system.avgResponseTime > 5000,
        severity: 'medium',
        message: 'Average response time exceeds 5 seconds'
      }
    ];
    
    // Check alert rules every minute
    setInterval(() => {
      this.checkAlertRules();
    }, 60000);
  }

  /**
   * Check and trigger alerts
   */
  checkAlertRules() {
    for (const rule of this.alertRules) {
      if (rule.condition()) {
        this.triggerAlert(rule);
      }
    }
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(rule) {
    const alert = {
      id: `alert-${Date.now()}`,
      rule: rule.name,
      severity: rule.severity,
      message: rule.message,
      timestamp: new Date().toISOString(),
      metrics_snapshot: { ...this.metrics.system }
    };
    
    this.metrics.alerts.push(alert);
    
    console.log(`🚨 Alert triggered: ${rule.message}`);
    
    await this.reporter.logActivity(
      'alert_triggered',
      `Alert: ${rule.message}`,
      `Severity: ${rule.severity}`
    );
  }

  /**
   * Clean up old data
   */
  async cleanupOldData() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Clean old activities
    this.metrics.activities = this.metrics.activities.filter(
      activity => new Date(activity.timestamp) > oneDayAgo
    );
    
    // Clean old alerts
    this.metrics.alerts = this.metrics.alerts.filter(
      alert => new Date(alert.timestamp) > oneDayAgo
    );
    
    // Remove inactive agents
    for (const [agentId, agentInfo] of this.agentRegistry) {
      if (new Date(agentInfo.last_seen) < oneDayAgo && agentInfo.status !== 'active') {
        this.agentRegistry.delete(agentId);
        this.metrics.agents.delete(agentId);
      }
    }
  }

  /**
   * Extract agent type from workflow name
   */
  extractAgentType(workflowName) {
    const types = ['testing', 'development', 'migration', 'monitoring', 'orchestrator'];
    for (const type of types) {
      if (workflowName.toLowerCase().includes(type)) {
        return type;
      }
    }
    return 'unknown';
  }

  /**
   * Load historical metrics
   */
  async loadHistoricalMetrics() {
    try {
      const metricsPath = './monitoring-data/historical-metrics.json';
      const data = await fs.readFile(metricsPath, 'utf8');
      const historical = JSON.parse(data);
      
      // Merge with current metrics
      Object.assign(this.metrics.system, historical.system || {});
      
    } catch (error) {
      // File doesn't exist or is invalid - start fresh
      console.log('📊 Starting with fresh metrics');
    }
  }

  /**
   * Save metrics to disk
   */
  async saveMetrics() {
    try {
      await fs.mkdir('./monitoring-data', { recursive: true });
      
      const data = {
        system: this.metrics.system,
        agents: Object.fromEntries(this.metrics.agents),
        last_updated: new Date().toISOString()
      };
      
      await fs.writeFile(
        './monitoring-data/historical-metrics.json',
        JSON.stringify(data, null, 2)
      );
      
    } catch (error) {
      console.error('❌ Failed to save metrics:', error);
    }
  }

  /**
   * Handle monitoring errors
   */
  async handleError(error) {
    console.error(`❌ Monitoring agent error:`, error);
    
    await this.reporter.reportStatus('error', {
      error: error.message,
      stack: error.stack
    });
    
    await this.reporter.logActivity(
      'monitoring_error',
      'Monitoring Agent Error',
      error.message
    );
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down monitoring agent...');
    
    // Clear intervals
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.metricsCollectionInterval) clearInterval(this.metricsCollectionInterval);
    
    // Save metrics
    await this.saveMetrics();
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }
    
    // Report shutdown
    await this.reporter.reportStatus('offline', {
      reason: 'Graceful shutdown'
    });
    
    console.log('✅ Monitoring agent shutdown complete');
  }
}

// Load configuration
async function loadConfig() {
  const configPath = process.env.MONITORING_AGENT_CONFIG || 
                     path.join(__dirname, 'config.json');
  
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // Return default config if file not found
    return {
      agentId: `monitoring-agent-${Date.now()}`,
      websocket_port: 8081,
      auto_revival: true,
      metrics_retention_days: 7,
      alert_thresholds: {
        error_rate: 0.1,
        response_time: 5000,
        agent_inactive_minutes: 5
      }
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args.find(arg => arg.includes('--command'))?.split('=')[1] || 'start';
  
  try {
    const config = await loadConfig();
    const agent = new MonitoringAgent(config);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await agent.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await agent.shutdown();
      process.exit(0);
    });
    
    switch (command) {
      case 'start':
        await agent.startMonitoring();
        break;
      case 'metrics':
        await agent.collectMetrics();
        console.log('📊 Metrics collection completed');
        break;
      case 'health':
        await agent.performHealthChecks();
        console.log('🏥 Health checks completed');
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    // Keep the process running for continuous monitoring
    if (command === 'start') {
      console.log('🔄 Monitoring agent running continuously...');
      // Process will stay alive due to intervals
    }
    
  } catch (error) {
    console.error('💥 Monitoring agent failed:', error);
    process.exit(1);
  }
}

// Export for use by orchestrator
module.exports = { MonitoringAgent };

// Run if called directly
if (require.main === module) {
  main();
}