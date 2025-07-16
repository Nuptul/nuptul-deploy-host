# Nuptial Observability Dashboard Implementation

## Overview

This guide implements a real-time observability dashboard for the Nuptial multi-agent system, inspired by Dan Disler's claude-code-hooks-multi-agent-observability project.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Testing  │  │   Dev    │  │ Migration│  │Orchestr. │   │
│  │  Agent   │  │  Agents  │  │  Agent   │  │  Agent   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
                    WebSocket Events
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  WebSocket Server (Node.js)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Event Handler│  │State Manager│  │  Metrics    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    WebSocket Connection
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                React Dashboard (Browser)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Agent Grid  │  │Activity Feed│  │   Charts    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. WebSocket Server

#### 1.1 Server Setup
```javascript
// dashboard/server/index.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

class ObservabilityServer {
  constructor() {
    this.clients = new Map();
    this.agentStates = new Map();
    this.activityLog = [];
    this.metrics = {
      totalIssues: 0,
      resolvedIssues: 0,
      activeAgents: 0,
      avgResponseTime: 0,
      errorRate: 0
    };
    
    this.setupWebSocket();
    this.setupWebhooks();
    this.startMetricsCollection();
  }

  setupWebSocket() {
    wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      console.log(`New dashboard client connected: ${clientId}`);
      
      this.clients.set(clientId, ws);
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'initial_state',
        data: {
          agents: Array.from(this.agentStates.values()),
          activities: this.activityLog.slice(-100),
          metrics: this.metrics
        }
      }));
      
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Dashboard client disconnected: ${clientId}`);
      });
      
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
  }

  setupWebhooks() {
    // GitHub webhook endpoint
    app.post('/webhook/github', (req, res) => {
      const event = req.headers['x-github-event'];
      const payload = req.body;
      
      this.handleGitHubEvent(event, payload);
      res.status(200).send('OK');
    });
    
    // Agent status endpoint
    app.post('/agent/status', (req, res) => {
      const { agentId, status, metadata } = req.body;
      this.updateAgentStatus(agentId, status, metadata);
      res.status(200).send('OK');
    });
    
    // Activity log endpoint
    app.post('/activity', (req, res) => {
      const activity = req.body;
      this.logActivity(activity);
      res.status(200).send('OK');
    });
  }

  handleGitHubEvent(event, payload) {
    switch (event) {
      case 'issues':
        this.handleIssueEvent(payload);
        break;
      case 'pull_request':
        this.handlePullRequestEvent(payload);
        break;
      case 'workflow_run':
        this.handleWorkflowEvent(payload);
        break;
    }
  }

  updateAgentStatus(agentId, status, metadata = {}) {
    const agent = this.agentStates.get(agentId) || {
      id: agentId,
      firstSeen: new Date()
    };
    
    agent.status = status;
    agent.lastSeen = new Date();
    agent.metadata = { ...agent.metadata, ...metadata };
    
    this.agentStates.set(agentId, agent);
    
    this.broadcast({
      type: 'agent_update',
      data: agent
    });
    
    this.updateMetrics();
  }

  logActivity(activity) {
    const timestampedActivity = {
      ...activity,
      timestamp: new Date().toISOString(),
      id: this.generateActivityId()
    };
    
    this.activityLog.push(timestampedActivity);
    
    // Keep only last 1000 activities
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }
    
    this.broadcast({
      type: 'new_activity',
      data: timestampedActivity
    });
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  updateMetrics() {
    this.metrics.activeAgents = Array.from(this.agentStates.values())
      .filter(agent => agent.status === 'active').length;
    
    this.broadcast({
      type: 'metrics_update',
      data: this.metrics
    });
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  async collectMetrics() {
    // Collect GitHub metrics
    try {
      const { data: issues } = await github.issues.listForRepo({
        owner: 'nuptul',
        repo: 'nuptul-deploy-host',
        state: 'all'
      });
      
      this.metrics.totalIssues = issues.length;
      this.metrics.resolvedIssues = issues.filter(i => i.state === 'closed').length;
      
      this.updateMetrics();
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateActivityId() {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize server
const observabilityServer = new ObservabilityServer();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Observability server running on port ${PORT}`);
});
```

#### 1.2 Agent Communication Module
```javascript
// dashboard/server/agent-communicator.js
class AgentCommunicator {
  constructor(server) {
    this.server = server;
    this.agentEndpoints = new Map();
  }

  registerAgent(agentId, config) {
    this.agentEndpoints.set(agentId, config);
    
    this.server.updateAgentStatus(agentId, 'registered', {
      type: config.type,
      capabilities: config.capabilities
    });
  }

  async pingAgent(agentId) {
    const config = this.agentEndpoints.get(agentId);
    if (!config) return false;
    
    try {
      const response = await fetch(`${config.endpoint}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      const health = await response.json();
      this.server.updateAgentStatus(agentId, 'active', { health });
      return true;
    } catch (error) {
      this.server.updateAgentStatus(agentId, 'offline', { error: error.message });
      return false;
    }
  }

  async broadcastToAgents(message) {
    const results = [];
    
    for (const [agentId, config] of this.agentEndpoints) {
      try {
        const response = await fetch(`${config.endpoint}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        results.push({ agentId, success: response.ok });
      } catch (error) {
        results.push({ agentId, success: false, error: error.message });
      }
    }
    
    return results;
  }
}
```

### 2. React Dashboard Frontend

#### 2.1 Main Dashboard Component
```jsx
// dashboard/src/App.jsx
import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Dashboard } from './components/Dashboard';
import './styles/glass-morphism.css';

function App() {
  return (
    <WebSocketProvider url={import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}>
      <div className="app min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <Dashboard />
      </div>
    </WebSocketProvider>
  );
}

export default App;
```

#### 2.2 WebSocket Hook
```jsx
// dashboard/src/hooks/useWebSocket.js
import { useContext, useEffect, useState, useCallback } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

export function useWebSocket() {
  const ws = useContext(WebSocketContext);
  const [agents, setAgents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'initial_state':
          setAgents(message.data.agents);
          setActivities(message.data.activities);
          setMetrics(message.data.metrics);
          break;
          
        case 'agent_update':
          setAgents(prev => {
            const index = prev.findIndex(a => a.id === message.data.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = message.data;
              return updated;
            }
            return [...prev, message.data];
          });
          break;
          
        case 'new_activity':
          setActivities(prev => [...prev, message.data].slice(-100));
          break;
          
        case 'metrics_update':
          setMetrics(message.data);
          break;
      }
    };

    const handleOpen = () => setConnectionStatus('connected');
    const handleClose = () => setConnectionStatus('disconnected');
    const handleError = () => setConnectionStatus('error');

    ws.addEventListener('message', handleMessage);
    ws.addEventListener('open', handleOpen);
    ws.addEventListener('close', handleClose);
    ws.addEventListener('error', handleError);

    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('error', handleError);
    };
  }, [ws]);

  const sendMessage = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  return {
    agents,
    activities,
    metrics,
    connectionStatus,
    sendMessage
  };
}
```

#### 2.3 Agent Grid Component
```jsx
// dashboard/src/components/AgentGrid.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { AgentCard } from './AgentCard';

export function AgentGrid({ agents }) {
  const agentTypes = ['testing', 'development', 'migration', 'monitoring', 'orchestrator'];
  
  const getAgentsByType = (type) => {
    return agents.filter(agent => agent.metadata?.type === type);
  };

  return (
    <div className="agent-grid">
      <h2 className="text-2xl font-bold text-white mb-6">Active Agents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentTypes.map(type => (
          <div key={type} className="agent-type-section">
            <h3 className="text-lg font-semibold text-white/80 mb-3 capitalize">
              {type} Agents
            </h3>
            <div className="space-y-2">
              {getAgentsByType(type).map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {getAgentsByType(type).length === 0 && (
                <div className="glass-panel p-4 text-white/50 text-center">
                  No active {type} agents
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 2.4 Agent Card Component
```jsx
// dashboard/src/components/AgentCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export function AgentCard({ agent }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'idle': return '🟡';
      case 'offline': return '🔴';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-4 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-white">{agent.id}</h4>
        <span className="text-2xl">{getStatusIcon(agent.status)}</span>
      </div>
      
      <div className="text-sm text-white/70 space-y-1">
        <div>Status: <span className={`font-medium ${getStatusColor(agent.status)} px-2 py-1 rounded`}>
          {agent.status}
        </span></div>
        <div>Last Seen: {new Date(agent.lastSeen).toLocaleTimeString()}</div>
        {agent.metadata?.currentTask && (
          <div>Task: {agent.metadata.currentTask}</div>
        )}
        {agent.metadata?.health && (
          <div className="mt-2">
            <div className="text-xs">CPU: {agent.metadata.health.cpu}%</div>
            <div className="text-xs">Memory: {agent.metadata.health.memory}%</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

#### 2.5 Activity Feed Component
```jsx
// dashboard/src/components/ActivityFeed.jsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActivityFeed({ activities }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities]);

  const getActivityIcon = (type) => {
    const icons = {
      issue_created: '📝',
      issue_assigned: '👤',
      pr_created: '🔀',
      pr_merged: '✅',
      test_started: '🧪',
      test_completed: '✔️',
      deployment_started: '🚀',
      deployment_completed: '🎉',
      error: '❌',
      warning: '⚠️'
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    if (type.includes('error')) return 'text-red-400';
    if (type.includes('warning')) return 'text-yellow-400';
    if (type.includes('completed') || type.includes('merged')) return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="activity-feed">
      <h2 className="text-2xl font-bold text-white mb-6">Activity Feed</h2>
      
      <div ref={feedRef} className="glass-panel p-4 h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="activity-item border-l-2 border-white/20 pl-4 pb-4 mb-4 last:mb-0"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <div className={`font-medium ${getActivityColor(activity.type)}`}>
                    {activity.title}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {activity.description}
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    {new Date(activity.timestamp).toLocaleString()}
                    {activity.agentId && ` • ${activity.agentId}`}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

#### 2.6 Metrics Dashboard
```jsx
// dashboard/src/components/MetricsDashboard.jsx
import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

export function MetricsDashboard({ metrics }) {
  const issueCompletionRate = metrics.totalIssues > 0 
    ? (metrics.resolvedIssues / metrics.totalIssues * 100).toFixed(1)
    : 0;

  return (
    <div className="metrics-dashboard">
      <h2 className="text-2xl font-bold text-white mb-6">System Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          title="Active Agents"
          value={metrics.activeAgents || 0}
          icon="🤖"
          color="blue"
        />
        <MetricCard
          title="Total Issues"
          value={metrics.totalIssues || 0}
          icon="📋"
          color="purple"
        />
        <MetricCard
          title="Resolved Issues"
          value={metrics.resolvedIssues || 0}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Completion Rate"
          value={`${issueCompletionRate}%`}
          icon="📊"
          color="yellow"
        />
      </div>

      <div className="glass-panel p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
        <Line
          data={{
            labels: generateTimeLabels(),
            datasets: [{
              label: 'Response Time (ms)',
              data: generateMockData(12, 100, 500),
              borderColor: 'rgb(147, 51, 234)',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              tension: 0.4
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-panel p-4 bg-gradient-to-br ${colorClasses[color]} text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-80">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function generateTimeLabels() {
  const labels = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    labels.push(date.toLocaleTimeString([], { hour: '2-digit' }));
  }
  return labels;
}

function generateMockData(count, min, max) {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
```

### 3. Agent Integration

#### 3.1 Agent Hook Integration
```javascript
// .github/agents/shared/dashboard-reporter.js
class DashboardReporter {
  constructor(agentId, agentType) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:8080';
  }

  async reportStatus(status, metadata = {}) {
    try {
      await fetch(`${this.dashboardUrl}/agent/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          status,
          metadata: {
            ...metadata,
            type: this.agentType
          }
        })
      });
    } catch (error) {
      console.error('Failed to report status:', error);
    }
  }

  async logActivity(type, title, description) {
    try {
      await fetch(`${this.dashboardUrl}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          type,
          title,
          description
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async reportMetric(name, value) {
    try {
      await fetch(`${this.dashboardUrl}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          metric: name,
          value,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to report metric:', error);
    }
  }
}

module.exports = { DashboardReporter };
```

#### 3.2 Testing Agent Integration
```javascript
// Update testing agent to report to dashboard
const { DashboardReporter } = require('../shared/dashboard-reporter');

class EnhancedTestingAgent extends TestingAgent {
  constructor(config) {
    super(config);
    this.reporter = new DashboardReporter('testing-agent-001', 'testing');
  }

  async run() {
    await this.reporter.reportStatus('active', { currentTask: 'Starting test suite' });
    await this.reporter.logActivity('test_started', 'Test Suite Started', 'Running comprehensive UI tests');

    try {
      const results = await super.run();
      
      await this.reporter.reportMetric('tests_completed', results.totalTests);
      await this.reporter.reportMetric('tests_failed', results.failedTests);
      await this.reporter.reportStatus('idle', { lastRun: new Date() });
      
      await this.reporter.logActivity('test_completed', 'Test Suite Completed', 
        `Completed ${results.totalTests} tests with ${results.failedTests} failures`);
    } catch (error) {
      await this.reporter.reportStatus('error', { error: error.message });
      await this.reporter.logActivity('error', 'Test Suite Failed', error.message);
      throw error;
    }
  }
}
```

### 4. Deployment Configuration

#### 4.1 Docker Compose Setup
```yaml
# dashboard/docker-compose.yml
version: '3.8'

services:
  dashboard-server:
    build: ./server
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - PORT=8080
    volumes:
      - ./server:/app
      - /app/node_modules

  dashboard-frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - VITE_WS_URL=ws://localhost:8080
    depends_on:
      - dashboard-server
```

#### 4.2 GitHub Action for Dashboard
```yaml
# .github/workflows/dashboard-deployment.yml
name: Deploy Observability Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'dashboard/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Netlify
        run: |
          cd dashboard
          npm install
          npm run build
          netlify deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.DASHBOARD_SITE_ID }}
```

## Conclusion

This observability dashboard provides real-time visibility into the Nuptial multi-agent system with:
- Live agent status monitoring
- Activity feed with all system events
- Performance metrics and trends
- WebSocket-based real-time updates
- Glass morphism UI matching Nuptial's design

The dashboard enables effective monitoring and management of the infinite agent loops, ensuring optimal performance and quick issue resolution.