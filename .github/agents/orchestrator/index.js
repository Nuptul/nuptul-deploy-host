const { Octokit } = require('@octokit/rest');
const { PriorityQueue } = require('./priority-queue');
const { PersonaManager } = require('./persona-manager');
const { HookManager } = require('./hook-manager');

class NuptialOrchestrator {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.agents = new Map();
    this.workQueue = new PriorityQueue();
    this.personas = new PersonaManager();
    this.hooks = new HookManager();
    this.repository = {
      owner: process.env.GITHUB_REPOSITORY_OWNER || 'nuptul',
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || 'nuptul-deploy-host'
    };
  }

  async initialize() {
    console.log('🧠 Nuptial Orchestrator initializing...');
    await this.hooks.initialize();
    await this.personas.loadPersonas();
    await this.discoverExistingAgents();
    console.log('✅ Orchestrator ready');
  }

  async routeIssue(issue) {
    console.log(`📋 Routing issue #${issue.number}: ${issue.title}`);
    
    // Analyze issue content
    const analysis = await this.analyzeIssue(issue);
    
    // Select appropriate persona
    const persona = this.personas.selectForTask(analysis);
    console.log(`🎭 Selected persona: ${persona.name}`);
    
    // Find or spawn available agent
    const agent = await this.findOrSpawnAgent(analysis.type, persona);
    
    // Assign work
    await this.assignWork(agent, issue, persona);
  }

  async analyzeIssue(issue) {
    const labels = issue.labels.map(l => l.name);
    const title = issue.title.toLowerCase();
    const body = issue.body?.toLowerCase() || '';
    const combinedText = `${title} ${body}`;
    
    // Determine issue type
    let type = 'development';
    let priority = 'medium';
    let complexity = 0.5;
    
    // Type detection
    if (labels.includes('bug') || combinedText.includes('error') || combinedText.includes('fix')) {
      type = 'development';
      complexity = 0.6;
    } else if (labels.includes('testing') || combinedText.includes('test')) {
      type = 'testing';
      complexity = 0.4;
    } else if (labels.includes('security') || combinedText.includes('vulnerability')) {
      type = 'security';
      priority = 'high';
      complexity = 0.8;
    } else if (labels.includes('documentation') || combinedText.includes('docs')) {
      type = 'documentation';
      complexity = 0.3;
    } else if (labels.includes('migration') || combinedText.includes('database')) {
      type = 'migration';
      complexity = 0.7;
    } else if (combinedText.includes('ui') || combinedText.includes('design') || combinedText.includes('component')) {
      type = 'development';
      complexity = 0.5;
    }
    
    // Priority detection
    if (labels.includes('critical') || labels.includes('urgent')) {
      priority = 'critical';
    } else if (labels.includes('high-priority')) {
      priority = 'high';
    } else if (labels.includes('low-priority')) {
      priority = 'low';
    }
    
    return {
      type,
      priority,
      complexity,
      labels,
      requiresSpecialist: complexity > 0.7,
      estimatedTime: Math.ceil(complexity * 8) // hours
    };
  }

  async findOrSpawnAgent(type, persona) {
    // Check for available agents
    const availableAgent = Array.from(this.agents.values()).find(
      agent => agent.type === type && 
               agent.status === 'idle' && 
               agent.persona === persona.name
    );
    
    if (availableAgent) {
      console.log(`✅ Found available ${type} agent: ${availableAgent.id}`);
      return availableAgent;
    }
    
    // Spawn new agent if needed
    console.log(`🚀 Spawning new ${type} agent with ${persona.name} persona`);
    return await this.spawnAgent(type, { persona: persona.name });
  }

  async spawnAgent(type, config) {
    const workflowMap = {
      'testing': 'testing-agent.yml',
      'development': 'development-agent.yml',
      'migration': 'migration-agent.yml',
      'documentation': 'documentation-agent.yml',
      'security': 'security-agent.yml',
      'monitoring': 'monitoring-agent.yml'
    };
    
    const workflowFile = workflowMap[type] || 'development-agent.yml';
    const agentId = `${type}-agent-${Date.now()}`;
    
    try {
      // Trigger workflow
      await this.octokit.actions.createWorkflowDispatch({
        owner: this.repository.owner,
        repo: this.repository.repo,
        workflow_id: workflowFile,
        ref: 'main',
        inputs: {
          agent_id: agentId,
          ...config
        }
      });
      
      // Register agent
      const agent = {
        id: agentId,
        type,
        status: 'spawning',
        persona: config.persona,
        spawnedAt: new Date(),
        config
      };
      
      this.agents.set(agentId, agent);
      await this.hooks.trigger('agentSpawned', agent);
      
      return agent;
    } catch (error) {
      console.error(`❌ Failed to spawn agent: ${error.message}`);
      throw error;
    }
  }

  async assignWork(agent, issue, persona) {
    console.log(`📌 Assigning issue #${issue.number} to agent ${agent.id}`);
    
    // Update agent status
    agent.status = 'active';
    agent.currentIssue = issue.number;
    agent.assignedAt = new Date();
    
    // Add assignment comment
    await this.octokit.issues.createComment({
      owner: this.repository.owner,
      repo: this.repository.repo,
      issue_number: issue.number,
      body: `🤖 **Agent Assignment**\n\n` +
            `This issue has been assigned to \`${agent.id}\` with the **${persona.name}** persona.\n\n` +
            `**Analysis:**\n` +
            `- Type: ${agent.type}\n` +
            `- Priority: ${issue.priority || 'medium'}\n` +
            `- Estimated Time: ${issue.estimatedTime || 'TBD'} hours\n\n` +
            `The agent will begin working on this issue shortly.`
    });
    
    // Trigger hook
    await this.hooks.trigger('workAssigned', { agent, issue, persona });
  }

  async discoverExistingAgents() {
    // Query GitHub Actions for running agents
    try {
      const { data: runs } = await this.octokit.actions.listWorkflowRunsForRepo({
        owner: this.repository.owner,
        repo: this.repository.repo,
        status: 'in_progress'
      });
      
      for (const run of runs.workflow_runs) {
        if (run.name.includes('Agent')) {
          const agentId = run.name.match(/agent-[\d]+/)?.[0];
          if (agentId && !this.agents.has(agentId)) {
            this.agents.set(agentId, {
              id: agentId,
              type: run.name.toLowerCase().includes('test') ? 'testing' : 'development',
              status: 'active',
              workflowRunId: run.id
            });
          }
        }
      }
      
      console.log(`📊 Discovered ${this.agents.size} existing agents`);
    } catch (error) {
      console.error('Failed to discover agents:', error);
    }
  }

  async healthCheck() {
    const healthReport = {
      timestamp: new Date(),
      totalAgents: this.agents.size,
      activeAgents: 0,
      idleAgents: 0,
      queuedTasks: this.workQueue.size(),
      agentDetails: []
    };
    
    for (const [id, agent] of this.agents) {
      if (agent.status === 'active') healthReport.activeAgents++;
      if (agent.status === 'idle') healthReport.idleAgents++;
      
      healthReport.agentDetails.push({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        persona: agent.persona,
        uptime: Date.now() - agent.spawnedAt.getTime()
      });
    }
    
    return healthReport;
  }

  async rebalanceWorkload() {
    console.log('🔄 Rebalancing workload...');
    
    // Get all open issues
    const { data: issues } = await this.octokit.issues.listForRepo({
      owner: this.repository.owner,
      repo: this.repository.repo,
      state: 'open',
      labels: 'agent-ready'
    });
    
    // Find unassigned issues
    const unassignedIssues = issues.filter(issue => 
      !issue.assignee && !issue.labels.some(l => l.name === 'agent-assigned')
    );
    
    // Route unassigned issues
    for (const issue of unassignedIssues) {
      await this.routeIssue(issue);
    }
    
    console.log(`✅ Rebalanced ${unassignedIssues.length} issues`);
  }
}

module.exports = { NuptialOrchestrator };