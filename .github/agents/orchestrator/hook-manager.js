/**
 * HookManager - Manages hooks for agent lifecycle events
 * Inspired by Claude Code Hooks and Dan Disler's observability patterns
 */
class HookManager {
  constructor() {
    this.hooks = {
      preToolUse: [],
      postToolUse: [],
      userPromptSubmit: [],
      notification: [],
      stop: [],
      agentStart: [],
      agentComplete: [],
      agentError: [],
      issueAssigned: [],
      prCreated: [],
      workflowTriggered: []
    };
    
    this.dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:8080';
    this.initialized = false;
    this.metrics = {
      hookExecutions: 0,
      hookFailures: 0,
      averageExecutionTime: 0
    };
  }

  /**
   * Initialize hook manager and register default hooks
   */
  async initialize() {
    if (this.initialized) return;
    
    // Register default observability hooks
    this.register('agentStart', this.createObservabilityHook('agent_started'));
    this.register('agentComplete', this.createObservabilityHook('agent_completed'));
    this.register('agentError', this.createObservabilityHook('agent_error'));
    this.register('issueAssigned', this.createObservabilityHook('issue_assigned'));
    this.register('prCreated', this.createObservabilityHook('pr_created'));
    
    // Register performance monitoring hooks
    this.register('preToolUse', this.createPerformanceHook());
    this.register('postToolUse', this.createPostToolHook());
    
    // Register notification hooks
    this.register('notification', this.createNotificationHook());
    
    this.initialized = true;
  }

  /**
   * Register a hook for a specific event
   * @param {string} event - Event name
   * @param {Function} handler - Hook handler function
   * @param {Object} options - Hook options
   */
  register(event, handler, options = {}) {
    if (!this.hooks[event]) {
      throw new Error(`Unknown hook event: ${event}`);
    }
    
    const hook = {
      handler,
      priority: options.priority || 0,
      name: options.name || handler.name || 'anonymous',
      async: options.async !== false,
      timeout: options.timeout || 5000
    };
    
    // Insert hook based on priority (higher priority first)
    const insertIndex = this.hooks[event].findIndex(h => h.priority < hook.priority);
    if (insertIndex === -1) {
      this.hooks[event].push(hook);
    } else {
      this.hooks[event].splice(insertIndex, 0, hook);
    }
    
    console.log(`✅ Registered hook "${hook.name}" for event "${event}"`);
  }

  /**
   * Execute hooks for a specific event
   * @param {string} event - Event name
   * @param {Object} context - Event context
   * @returns {Object} Modified context after hook execution
   */
  async execute(event, context = {}) {
    if (!this.hooks[event]) {
      throw new Error(`Unknown hook event: ${event}`);
    }
    
    const startTime = Date.now();
    let modifiedContext = { ...context };
    const executionResults = [];
    
    for (const hook of this.hooks[event]) {
      try {
        const hookStart = Date.now();
        
        if (hook.async) {
          modifiedContext = await this.executeWithTimeout(
            hook.handler(modifiedContext),
            hook.timeout,
            hook.name
          );
        } else {
          modifiedContext = hook.handler(modifiedContext);
        }
        
        const executionTime = Date.now() - hookStart;
        executionResults.push({
          hook: hook.name,
          success: true,
          executionTime
        });
        
      } catch (error) {
        console.error(`❌ Hook "${hook.name}" failed:`, error);
        this.metrics.hookFailures++;
        
        executionResults.push({
          hook: hook.name,
          success: false,
          error: error.message
        });
        
        // Decide whether to continue or abort based on event type
        if (this.isCriticalEvent(event)) {
          throw error;
        }
      }
    }
    
    // Update metrics
    const totalExecutionTime = Date.now() - startTime;
    this.updateMetrics(totalExecutionTime);
    
    // Log execution summary
    console.log(`🎣 Executed ${executionResults.length} hooks for "${event}" in ${totalExecutionTime}ms`);
    
    return modifiedContext;
  }

  /**
   * Execute hook with timeout
   * @param {Promise} promise - Hook execution promise
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} hookName - Hook name for logging
   */
  async executeWithTimeout(promise, timeout, hookName) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Hook "${hookName}" timed out after ${timeout}ms`)), timeout);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Create observability hook that reports to dashboard
   * @param {string} activityType - Activity type for dashboard
   */
  createObservabilityHook(activityType) {
    return async (context) => {
      try {
        const activity = {
          type: activityType,
          title: this.generateActivityTitle(activityType, context),
          description: this.generateActivityDescription(activityType, context),
          agentId: context.agentId || 'orchestrator',
          metadata: {
            ...context.metadata,
            timestamp: new Date().toISOString()
          }
        };
        
        // Report to dashboard
        await fetch(`${this.dashboardUrl}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activity)
        });
        
      } catch (error) {
        console.error('Failed to report to dashboard:', error);
      }
      
      return context;
    };
  }

  /**
   * Create performance monitoring hook
   */
  createPerformanceHook() {
    return (context) => {
      context.performanceStart = Date.now();
      context.performanceMarks = [];
      
      // Add performance marking function
      context.mark = (name) => {
        context.performanceMarks.push({
          name,
          timestamp: Date.now() - context.performanceStart
        });
      };
      
      return context;
    };
  }

  /**
   * Create post-tool hook for performance reporting
   */
  createPostToolHook() {
    return async (context) => {
      if (context.performanceStart) {
        const duration = Date.now() - context.performanceStart;
        
        // Report performance metrics
        try {
          await fetch(`${this.dashboardUrl}/metrics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId: context.agentId || 'orchestrator',
              metric: 'tool_execution_time',
              value: duration,
              tool: context.tool,
              marks: context.performanceMarks
            })
          });
        } catch (error) {
          console.error('Failed to report metrics:', error);
        }
      }
      
      return context;
    };
  }

  /**
   * Create notification hook
   */
  createNotificationHook() {
    return async (context) => {
      const { notification, priority = 'info' } = context;
      
      console.log(`📢 [${priority.toUpperCase()}] ${notification.title}`);
      if (notification.body) {
        console.log(`   ${notification.body}`);
      }
      
      // Store important notifications
      if (priority === 'high' || priority === 'critical') {
        try {
          await fetch(`${this.dashboardUrl}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...notification,
              priority,
              timestamp: new Date().toISOString(),
              agentId: context.agentId || 'orchestrator'
            })
          });
        } catch (error) {
          console.error('Failed to store notification:', error);
        }
      }
      
      return context;
    };
  }

  /**
   * Generate activity title based on type and context
   */
  generateActivityTitle(activityType, context) {
    const titles = {
      agent_started: `Agent ${context.agentId} started`,
      agent_completed: `Agent ${context.agentId} completed task`,
      agent_error: `Agent ${context.agentId} encountered error`,
      issue_assigned: `Issue #${context.issueNumber} assigned to ${context.agentId}`,
      pr_created: `PR #${context.prNumber} created by ${context.agentId}`
    };
    
    return titles[activityType] || activityType;
  }

  /**
   * Generate activity description based on type and context
   */
  generateActivityDescription(activityType, context) {
    if (activityType === 'agent_error' && context.error) {
      return `Error: ${context.error.message || context.error}`;
    }
    
    if (context.description) {
      return context.description;
    }
    
    return JSON.stringify(context.metadata || {}, null, 2);
  }

  /**
   * Check if event is critical
   */
  isCriticalEvent(event) {
    const criticalEvents = ['stop', 'agentError'];
    return criticalEvents.includes(event);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(executionTime) {
    this.metrics.hookExecutions++;
    
    // Update rolling average
    const currentAvg = this.metrics.averageExecutionTime;
    const totalExecutions = this.metrics.hookExecutions;
    this.metrics.averageExecutionTime = 
      (currentAvg * (totalExecutions - 1) + executionTime) / totalExecutions;
  }

  /**
   * Get hook metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.hookExecutions > 0 
        ? 1 - (this.metrics.hookFailures / this.metrics.hookExecutions)
        : 1,
      registeredHooks: Object.entries(this.hooks).reduce((total, [event, hooks]) => {
        return total + hooks.length;
      }, 0)
    };
  }

  /**
   * Clear all hooks for an event
   */
  clearHooks(event) {
    if (this.hooks[event]) {
      this.hooks[event] = [];
      console.log(`🧹 Cleared all hooks for event "${event}"`);
    }
  }

  /**
   * List all registered hooks
   */
  listHooks() {
    const hookList = {};
    for (const [event, hooks] of Object.entries(this.hooks)) {
      if (hooks.length > 0) {
        hookList[event] = hooks.map(h => ({
          name: h.name,
          priority: h.priority,
          async: h.async,
          timeout: h.timeout
        }));
      }
    }
    return hookList;
  }
}

module.exports = { HookManager };