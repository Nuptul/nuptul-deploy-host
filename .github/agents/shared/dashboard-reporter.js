#!/usr/bin/env node

const fetch = require('node-fetch');

/**
 * Dashboard Reporter - Agent Communication with Observability Dashboard
 * Provides unified reporting interface for all agents to communicate with
 * the real-time observability dashboard via WebSocket and REST API
 */
class DashboardReporter {
  constructor(agentId, agentType) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:8080';
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Report agent status to dashboard
   */
  async reportStatus(status, metadata = {}) {
    const payload = {
      agentId: this.agentId,
      status,
      metadata: {
        ...metadata,
        type: this.agentType,
        timestamp: new Date().toISOString()
      }
    };

    return await this.sendRequest('/agent/status', payload, 'POST');
  }

  /**
   * Log activity to dashboard feed
   */
  async logActivity(type, title, description) {
    const payload = {
      agentId: this.agentId,
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    };

    return await this.sendRequest('/activity', payload, 'POST');
  }

  /**
   * Report metrics to dashboard
   */
  async reportMetric(name, value, unit = null) {
    const payload = {
      agentId: this.agentId,
      metric: name,
      value,
      unit,
      timestamp: new Date().toISOString()
    };

    return await this.sendRequest('/metrics', payload, 'POST');
  }

  /**
   * Report error to dashboard
   */
  async reportError(error, context = {}) {
    const payload = {
      agentId: this.agentId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    };

    return await this.sendRequest('/errors', payload, 'POST');
  }

  /**
   * Register agent with dashboard
   */
  async registerAgent(capabilities = []) {
    const payload = {
      agentId: this.agentId,
      type: this.agentType,
      capabilities,
      registeredAt: new Date().toISOString()
    };

    return await this.sendRequest('/agent/register', payload, 'POST');
  }

  /**
   * Heartbeat to keep agent alive in dashboard
   */
  async heartbeat(metadata = {}) {
    const payload = {
      agentId: this.agentId,
      metadata: {
        ...metadata,
        type: this.agentType
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendRequest('/agent/heartbeat', payload, 'POST');
  }

  /**
   * Send request with retry logic
   */
  async sendRequest(endpoint, payload, method = 'POST') {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.dashboardUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `Agent-${this.agentId}`
          },
          body: JSON.stringify(payload),
          timeout: 5000
        });

        if (response.ok) {
          return await response.json().catch(() => ({ success: true }));
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (attempt === this.retryAttempts) {
          console.error(`Dashboard reporting failed after ${this.retryAttempts} attempts:`, error.message);
          return { success: false, error: error.message };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  /**
   * Start periodic heartbeat
   */
  startHeartbeat(intervalMs = 30000) {
    this.heartbeatInterval = setInterval(async () => {
      await this.heartbeat({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      });
    }, intervalMs);

    // Register cleanup
    process.on('beforeExit', () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    });
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Report agent shutdown
   */
  async reportShutdown(reason = 'Normal shutdown') {
    await this.reportStatus('offline', {
      reason,
      shutdownAt: new Date().toISOString()
    });

    await this.logActivity(
      'agent_shutdown',
      'Agent Shutdown',
      `Agent ${this.agentId} shutting down: ${reason}`
    );

    this.stopHeartbeat();
  }

  /**
   * Batch report multiple activities
   */
  async batchReport(activities) {
    const payload = {
      agentId: this.agentId,
      activities: activities.map(activity => ({
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString()
      }))
    };

    return await this.sendRequest('/activity/batch', payload, 'POST');
  }

  /**
   * Report progress for long-running tasks
   */
  async reportProgress(taskId, progress, total, message = '') {
    const payload = {
      agentId: this.agentId,
      taskId,
      progress,
      total,
      percentage: Math.round((progress / total) * 100),
      message,
      timestamp: new Date().toISOString()
    };

    return await this.sendRequest('/progress', payload, 'POST');
  }

  /**
   * Report task completion
   */
  async reportTaskComplete(taskId, result, duration = null) {
    const payload = {
      agentId: this.agentId,
      taskId,
      result,
      duration,
      completedAt: new Date().toISOString()
    };

    await this.sendRequest('/task/complete', payload, 'POST');
    
    await this.logActivity(
      'task_completed',
      'Task Completed',
      `Task ${taskId} completed${duration ? ` in ${duration}ms` : ''}`
    );
  }

  /**
   * Get agent health status
   */
  async getHealthStatus() {
    try {
      const response = await fetch(`${this.dashboardUrl}/agent/${this.agentId}/health`, {
        method: 'GET',
        timeout: 3000
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { healthy: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Create a scoped reporter for specific tasks
   */
  createTaskReporter(taskId) {
    return {
      progress: (current, total, message) => 
        this.reportProgress(taskId, current, total, message),
      
      complete: (result, duration) => 
        this.reportTaskComplete(taskId, result, duration),
      
      activity: (type, title, description) => 
        this.logActivity(`${taskId}_${type}`, title, description),
      
      error: (error, context) => 
        this.reportError(error, { taskId, ...context })
    };
  }
}

module.exports = { DashboardReporter };