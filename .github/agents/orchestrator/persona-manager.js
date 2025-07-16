/**
 * PersonaManager - Manages SuperClaude personas for task assignment
 * Integrates with the SuperClaude framework's 11 specialized personas
 */
class PersonaManager {
  constructor() {
    this.personas = {
      architect: {
        name: 'architect',
        priority: ['architecture', 'design', 'scalability', 'system-wide'],
        keywords: ['architecture', 'design', 'structure', 'system', 'scalability', 'patterns'],
        issueTypes: ['architecture', 'design', 'refactoring', 'migration'],
        confidence: 0.9
      },
      frontend: {
        name: 'frontend',
        priority: ['ui', 'ux', 'component', 'accessibility', 'responsive'],
        keywords: ['ui', 'ux', 'component', 'react', 'css', 'frontend', 'design', 'responsive'],
        issueTypes: ['ui', 'component', 'styling', 'accessibility'],
        confidence: 0.85
      },
      backend: {
        name: 'backend',
        priority: ['api', 'database', 'server', 'performance', 'reliability'],
        keywords: ['api', 'database', 'server', 'backend', 'supabase', 'endpoint', 'service'],
        issueTypes: ['api', 'database', 'backend', 'integration'],
        confidence: 0.85
      },
      analyzer: {
        name: 'analyzer',
        priority: ['analysis', 'investigation', 'debugging', 'root-cause'],
        keywords: ['analyze', 'investigate', 'debug', 'error', 'issue', 'problem', 'root cause'],
        issueTypes: ['bug', 'investigation', 'analysis', 'debugging'],
        confidence: 0.8
      },
      security: {
        name: 'security',
        priority: ['security', 'vulnerability', 'authentication', 'authorization'],
        keywords: ['security', 'vulnerability', 'auth', 'encryption', 'threat', 'attack', 'safe'],
        issueTypes: ['security', 'vulnerability', 'authentication'],
        confidence: 0.95
      },
      mentor: {
        name: 'mentor',
        priority: ['documentation', 'learning', 'explanation', 'guidance'],
        keywords: ['document', 'explain', 'guide', 'learn', 'understand', 'tutorial', 'help'],
        issueTypes: ['documentation', 'question', 'guidance'],
        confidence: 0.75
      },
      refactorer: {
        name: 'refactorer',
        priority: ['refactoring', 'cleanup', 'optimization', 'code-quality'],
        keywords: ['refactor', 'cleanup', 'optimize', 'improve', 'simplify', 'quality', 'debt'],
        issueTypes: ['refactoring', 'cleanup', 'technical-debt'],
        confidence: 0.8
      },
      performance: {
        name: 'performance',
        priority: ['performance', 'optimization', 'speed', 'efficiency'],
        keywords: ['performance', 'speed', 'optimize', 'slow', 'fast', 'efficiency', 'bottleneck'],
        issueTypes: ['performance', 'optimization', 'bottleneck'],
        confidence: 0.85
      },
      qa: {
        name: 'qa',
        priority: ['testing', 'quality', 'validation', 'verification'],
        keywords: ['test', 'qa', 'quality', 'validation', 'e2e', 'unit', 'integration', 'coverage'],
        issueTypes: ['testing', 'qa', 'validation'],
        confidence: 0.8
      },
      devops: {
        name: 'devops',
        priority: ['deployment', 'infrastructure', 'ci/cd', 'automation'],
        keywords: ['deploy', 'infrastructure', 'ci', 'cd', 'automation', 'workflow', 'pipeline'],
        issueTypes: ['deployment', 'infrastructure', 'automation'],
        confidence: 0.85
      },
      scribe: {
        name: 'scribe',
        priority: ['documentation', 'writing', 'communication', 'localization'],
        keywords: ['write', 'document', 'readme', 'changelog', 'release', 'notes', 'guide'],
        issueTypes: ['documentation', 'writing', 'communication'],
        confidence: 0.8
      }
    };

    // Issue type to persona mapping for quick lookup
    this.issueTypeMap = this.buildIssueTypeMap();
  }

  /**
   * Build reverse mapping of issue types to personas
   */
  buildIssueTypeMap() {
    const map = {};
    for (const [personaName, config] of Object.entries(this.personas)) {
      for (const issueType of config.issueTypes) {
        if (!map[issueType]) {
          map[issueType] = [];
        }
        map[issueType].push(personaName);
      }
    }
    return map;
  }

  /**
   * Select the best persona for a given task
   * @param {Object} task - Task object with title, body, labels, etc.
   * @returns {Object} Selected persona and confidence score
   */
  selectPersonaForTask(task) {
    const scores = {};
    
    // Initialize scores
    for (const personaName of Object.keys(this.personas)) {
      scores[personaName] = 0;
    }

    // Analyze task content
    const analysis = this.analyzeTask(task);
    
    // Score based on keywords
    for (const [personaName, config] of Object.entries(this.personas)) {
      for (const keyword of config.keywords) {
        if (analysis.normalizedTitle.includes(keyword)) {
          scores[personaName] += 3; // Title matches are more important
        }
        if (analysis.normalizedBody.includes(keyword)) {
          scores[personaName] += 1;
        }
      }
    }

    // Score based on labels
    if (task.labels) {
      for (const label of task.labels) {
        const labelName = typeof label === 'string' ? label : label.name;
        const normalizedLabel = labelName.toLowerCase();
        
        // Direct issue type mapping
        if (this.issueTypeMap[normalizedLabel]) {
          for (const personaName of this.issueTypeMap[normalizedLabel]) {
            scores[personaName] += 5; // Label matches are very important
          }
        }
        
        // Keyword matching in labels
        for (const [personaName, config] of Object.entries(this.personas)) {
          for (const keyword of config.keywords) {
            if (normalizedLabel.includes(keyword)) {
              scores[personaName] += 2;
            }
          }
        }
      }
    }

    // Find the best match
    let bestPersona = 'architect'; // Default fallback
    let highestScore = 0;
    
    for (const [personaName, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestPersona = personaName;
      }
    }

    // Calculate confidence based on score
    const maxPossibleScore = 20; // Approximate max score
    const confidence = Math.min(highestScore / maxPossibleScore, 1) * this.personas[bestPersona].confidence;

    return {
      persona: bestPersona,
      confidence: confidence,
      score: highestScore,
      scores: scores // For debugging
    };
  }

  /**
   * Analyze task content
   * @param {Object} task
   * @returns {Object} Analyzed content
   */
  analyzeTask(task) {
    return {
      normalizedTitle: (task.title || '').toLowerCase(),
      normalizedBody: (task.body || '').toLowerCase(),
      hasCode: (task.body || '').includes('```'),
      lineCount: (task.body || '').split('\n').length,
      complexity: this.estimateComplexity(task)
    };
  }

  /**
   * Estimate task complexity
   * @param {Object} task
   * @returns {string} Complexity level
   */
  estimateComplexity(task) {
    const body = task.body || '';
    const lineCount = body.split('\n').length;
    const hasMultipleSections = body.includes('##') || body.includes('###');
    const hasCode = body.includes('```');
    const labelCount = task.labels ? task.labels.length : 0;
    
    if (lineCount > 50 || labelCount > 3 || (hasMultipleSections && hasCode)) {
      return 'high';
    } else if (lineCount > 20 || labelCount > 1 || hasCode) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get persona capabilities
   * @param {string} personaName
   * @returns {Object} Persona capabilities
   */
  getPersonaCapabilities(personaName) {
    return this.personas[personaName] || null;
  }

  /**
   * Get all personas suitable for a specific issue type
   * @param {string} issueType
   * @returns {Array} List of suitable personas
   */
  getPersonasForIssueType(issueType) {
    return this.issueTypeMap[issueType.toLowerCase()] || ['architect'];
  }

  /**
   * Get persona workload recommendation
   * @param {string} personaName
   * @param {string} complexity
   * @returns {Object} Workload recommendation
   */
  getWorkloadRecommendation(personaName, complexity) {
    const baseRecommendations = {
      low: { maxConcurrent: 5, estimatedTime: 30 },
      medium: { maxConcurrent: 3, estimatedTime: 120 },
      high: { maxConcurrent: 1, estimatedTime: 480 }
    };

    // Adjust based on persona
    const adjustments = {
      architect: { timeMultiplier: 1.5, concurrentReduction: 1 },
      security: { timeMultiplier: 2, concurrentReduction: 2 },
      qa: { timeMultiplier: 1.3, concurrentReduction: 0 },
      performance: { timeMultiplier: 1.8, concurrentReduction: 1 }
    };

    const base = baseRecommendations[complexity];
    const adjustment = adjustments[personaName] || { timeMultiplier: 1, concurrentReduction: 0 };

    return {
      maxConcurrent: Math.max(1, base.maxConcurrent - adjustment.concurrentReduction),
      estimatedTime: Math.round(base.estimatedTime * adjustment.timeMultiplier)
    };
  }

  /**
   * Get collaborative personas for complex tasks
   * @param {string} primaryPersona
   * @returns {Array} List of collaborative personas
   */
  getCollaborativePersonas(primaryPersona) {
    const collaborations = {
      architect: ['backend', 'performance', 'security'],
      frontend: ['qa', 'performance', 'backend'],
      backend: ['architect', 'security', 'performance'],
      security: ['backend', 'devops', 'architect'],
      performance: ['backend', 'frontend', 'architect'],
      qa: ['frontend', 'backend', 'performance'],
      devops: ['security', 'backend', 'architect'],
      analyzer: ['architect', 'backend', 'performance'],
      refactorer: ['architect', 'qa', 'performance'],
      mentor: ['scribe', 'architect'],
      scribe: ['mentor', 'architect']
    };

    return collaborations[primaryPersona] || [];
  }
}

module.exports = { PersonaManager };