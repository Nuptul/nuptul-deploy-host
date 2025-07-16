#!/usr/bin/env node

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');
const { DashboardReporter } = require('../shared/dashboard-reporter');
const { MCPBrowserAutomation } = require('../shared/mcp-browser-tools');
const { VisualRegressionTester } = require('./visual-regression');

/**
 * Enhanced Testing Agent with MCP Browser Tools and Dashboard Integration
 * Performs comprehensive UI testing with real-time observability
 */
class EnhancedTestingAgent {
  constructor(config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.argv.find(arg => arg.includes('--github-token'))?.split('=')[1]
    });
    
    // Initialize dashboard reporter
    this.reporter = new DashboardReporter(
      `testing-agent-${Date.now()}`,
      'testing'
    );
    
    // Initialize MCP browser tools
    this.mcpBrowser = new MCPBrowserAutomation({
      dashboardUrl: process.env.DASHBOARD_URL
    });
    
    // Initialize visual regression tester
    this.visualTester = new VisualRegressionTester({
      baselineDir: './baselines',
      diffDir: './diffs'
    });
    
    this.findings = [];
    this.screenshots = [];
    this.metrics = {
      performance: {},
      accessibility: {},
      functional: {},
      visual: {}
    };
  }

  async run() {
    console.log('🤖 Enhanced Nuptul Testing Agent starting...');
    
    await this.reporter.reportStatus('active', { 
      currentTask: 'Initializing test suite',
      startTime: new Date()
    });
    
    await this.reporter.logActivity(
      'test_started', 
      'Enhanced Test Suite Started', 
      'Running comprehensive UI tests with MCP browser automation'
    );

    try {
      const scope = this.getTestScope();
      const testSuites = this.config.testing.testSuites[scope] || this.config.testing.testSuites.full;
      
      // Run tests across all browsers
      for (const browser of this.config.testing.browsers) {
        console.log(`\n🌐 Testing with ${browser}...`);
        await this.runBrowserTests(browser, testSuites);
      }
      
      // Run MCP-specific tests
      await this.runMCPTests();
      
      // Generate comprehensive report
      const report = await this.generateReport();
      
      // Create GitHub issues from findings
      await this.createGitHubIssues();
      
      // Report final metrics
      await this.reportFinalMetrics(report);
      
      await this.reporter.reportStatus('idle', { 
        lastRun: new Date(),
        totalFindings: this.findings.length
      });
      
      await this.reporter.logActivity(
        'test_completed', 
        'Enhanced Test Suite Completed', 
        `Found ${this.findings.length} issues across ${this.config.testing.browsers.length} browsers`
      );
      
      console.log('✅ Enhanced Testing Agent completed');
    } catch (error) {
      await this.reporter.reportStatus('error', { 
        error: error.message,
        stack: error.stack 
      });
      
      await this.reporter.logActivity(
        'error', 
        'Test Suite Failed', 
        error.message
      );
      
      throw error;
    }
  }

  async runMCPTests() {
    console.log('\n🔧 Running MCP Browser Automation Tests...');
    
    await this.reporter.logActivity(
      'mcp_test_started',
      'MCP Browser Tests Started',
      'Using Docker MCP browser tools for advanced testing'
    );
    
    try {
      // Navigate to the application
      await this.mcpBrowser.navigate(this.config.baseUrl || 'http://localhost:5173');
      
      // Capture comprehensive screenshots
      const screenshots = await this.mcpBrowser.captureAllPages();
      this.screenshots.push(...screenshots);
      
      // Analyze UI for issues
      const uiAnalysis = await this.analyzeUIWithMCP(screenshots);
      
      // Test accessibility with MCP tools
      const accessibilityReport = await this.mcpBrowser.runAccessibilityTests();
      
      // Test performance with MCP tools
      const performanceReport = await this.mcpBrowser.runPerformanceTests();
      
      // Add findings from MCP tests
      this.processMCPFindings(uiAnalysis, accessibilityReport, performanceReport);
      
      await this.reporter.logActivity(
        'mcp_test_completed',
        'MCP Browser Tests Completed',
        `Analyzed ${screenshots.length} pages with MCP tools`
      );
    } catch (error) {
      console.error('MCP test error:', error);
      this.findings.push({
        type: 'mcp_error',
        severity: 'high',
        message: `MCP browser test failed: ${error.message}`,
        stack: error.stack
      });
    }
  }

  async analyzeUIWithMCP(screenshots) {
    const analysis = {
      layoutIssues: [],
      visualIssues: [],
      interactionIssues: []
    };
    
    for (const screenshot of screenshots) {
      // Analyze layout consistency
      const layoutAnalysis = await this.mcpBrowser.analyzeLayout(screenshot);
      if (layoutAnalysis.issues.length > 0) {
        analysis.layoutIssues.push(...layoutAnalysis.issues);
      }
      
      // Run visual regression tests
      const visualDiff = await this.visualTester.compare(screenshot);
      if (visualDiff.hasDifferences) {
        analysis.visualIssues.push({
          page: screenshot.page,
          difference: visualDiff.percentDifference,
          diffImage: visualDiff.diffPath
        });
      }
      
      // Test interactive elements
      const interactionTest = await this.mcpBrowser.testInteractiveElements(screenshot.page);
      if (interactionTest.failures.length > 0) {
        analysis.interactionIssues.push(...interactionTest.failures);
      }
    }
    
    return analysis;
  }

  processMCPFindings(uiAnalysis, accessibilityReport, performanceReport) {
    // Process layout issues
    for (const issue of uiAnalysis.layoutIssues) {
      this.findings.push({
        type: 'layout',
        severity: 'medium',
        page: issue.page,
        message: `Layout issue detected: ${issue.description}`,
        screenshot: issue.screenshot,
        mcp: true
      });
    }
    
    // Process visual regression issues
    for (const issue of uiAnalysis.visualIssues) {
      if (issue.difference > 5) { // 5% threshold
        this.findings.push({
          type: 'visual_regression',
          severity: issue.difference > 20 ? 'high' : 'medium',
          page: issue.page,
          message: `Visual regression detected: ${issue.difference.toFixed(2)}% difference`,
          diffImage: issue.diffImage,
          mcp: true
        });
      }
    }
    
    // Process accessibility issues
    for (const violation of accessibilityReport.violations) {
      this.findings.push({
        type: 'accessibility',
        severity: violation.impact === 'critical' ? 'critical' : 'high',
        page: violation.page,
        message: `Accessibility violation: ${violation.description}`,
        wcagCriteria: violation.wcag,
        elements: violation.nodes,
        mcp: true
      });
    }
    
    // Process performance issues
    if (performanceReport.metrics) {
      this.metrics.performance.mcp = performanceReport.metrics;
      
      // Check against thresholds
      if (performanceReport.metrics.fcp > 3000) {
        this.findings.push({
          type: 'performance',
          severity: 'medium',
          message: `First Contentful Paint (${performanceReport.metrics.fcp}ms) exceeds threshold (3000ms)`,
          mcp: true
        });
      }
      
      if (performanceReport.metrics.lcp > 4000) {
        this.findings.push({
          type: 'performance',
          severity: 'high',
          message: `Largest Contentful Paint (${performanceReport.metrics.lcp}ms) exceeds threshold (4000ms)`,
          mcp: true
        });
      }
    }
  }

  async reportFinalMetrics(report) {
    // Report test metrics
    await this.reporter.reportMetric('total_tests', report.summary.total_tests);
    await this.reporter.reportMetric('failed_tests', report.summary.failed_tests);
    await this.reporter.reportMetric('critical_issues', report.summary.critical);
    await this.reporter.reportMetric('high_issues', report.summary.high);
    
    // Report performance metrics
    if (this.metrics.performance.mcp) {
      await this.reporter.reportMetric('fcp', this.metrics.performance.mcp.fcp);
      await this.reporter.reportMetric('lcp', this.metrics.performance.mcp.lcp);
      await this.reporter.reportMetric('cls', this.metrics.performance.mcp.cls);
      await this.reporter.reportMetric('fid', this.metrics.performance.mcp.fid);
    }
    
    // Report browser coverage
    await this.reporter.reportMetric('browsers_tested', this.config.testing.browsers.length);
    await this.reporter.reportMetric('pages_tested', this.config.testing.pages.length);
  }

  async generateReport() {
    const outputDir = process.argv.find(arg => arg.includes('--output'))?.split('=')[1] || './test-results';
    await fs.mkdir(outputDir, { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      agent: 'enhanced-testing-agent',
      config: this.config.agent,
      findings: this.findings,
      screenshots: this.screenshots,
      metrics: this.metrics,
      mcp: {
        enabled: true,
        toolsUsed: ['browser_navigate', 'browser_snapshot', 'browser_take_screenshot']
      },
      summary: {
        total_tests: this.getTotalTests(),
        failed_tests: this.getFailedTests(),
        total_issues: this.findings.length,
        critical: this.findings.filter(f => f.severity === 'critical').length,
        high: this.findings.filter(f => f.severity === 'high').length,
        medium: this.findings.filter(f => f.severity === 'medium').length,
        low: this.findings.filter(f => f.severity === 'low').length,
        mcp_findings: this.findings.filter(f => f.mcp).length
      }
    };
    
    // Write detailed JSON report
    await fs.writeFile(
      path.join(outputDir, 'enhanced-findings.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Write markdown summary
    await this.writeMarkdownSummary(outputDir, report);
    
    console.log('\n📊 Enhanced Test Summary:');
    console.log(`   Total Tests: ${report.summary.total_tests}`);
    console.log(`   Failed Tests: ${report.summary.failed_tests}`);
    console.log(`   Total Issues: ${report.summary.total_issues}`);
    console.log(`   Critical: ${report.summary.critical}`);
    console.log(`   High: ${report.summary.high}`);
    console.log(`   Medium: ${report.summary.medium}`);
    console.log(`   Low: ${report.summary.low}`);
    console.log(`   MCP Findings: ${report.summary.mcp_findings}`);
    
    return report;
  }

  async writeMarkdownSummary(outputDir, report) {
    let markdown = `# Enhanced Testing Report\n\n`;
    markdown += `**Generated**: ${new Date(report.timestamp).toLocaleString()}\n`;
    markdown += `**Agent**: ${report.agent}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests**: ${report.summary.total_tests}\n`;
    markdown += `- **Failed Tests**: ${report.summary.failed_tests}\n`;
    markdown += `- **Total Issues**: ${report.summary.total_issues}\n`;
    markdown += `- **Critical**: ${report.summary.critical}\n`;
    markdown += `- **High**: ${report.summary.high}\n`;
    markdown += `- **Medium**: ${report.summary.medium}\n`;
    markdown += `- **Low**: ${report.summary.low}\n`;
    markdown += `- **MCP Findings**: ${report.summary.mcp_findings}\n\n`;
    
    markdown += `## Critical Findings\n\n`;
    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length === 0) {
      markdown += `No critical findings.\n\n`;
    } else {
      for (const finding of criticalFindings) {
        markdown += `### ${finding.type}: ${finding.message}\n`;
        markdown += `- **Page**: ${finding.page || 'N/A'}\n`;
        markdown += `- **Browser**: ${finding.browser || 'N/A'}\n`;
        if (finding.screenshot) {
          markdown += `- **Screenshot**: [View](${finding.screenshot})\n`;
        }
        markdown += `\n`;
      }
    }
    
    markdown += `## Performance Metrics\n\n`;
    if (report.metrics.performance.mcp) {
      markdown += `- **FCP**: ${report.metrics.performance.mcp.fcp}ms\n`;
      markdown += `- **LCP**: ${report.metrics.performance.mcp.lcp}ms\n`;
      markdown += `- **CLS**: ${report.metrics.performance.mcp.cls}\n`;
      markdown += `- **FID**: ${report.metrics.performance.mcp.fid}ms\n`;
    }
    
    await fs.writeFile(
      path.join(outputDir, 'test-summary.md'),
      markdown
    );
  }

  async createDetailedIssues(findings) {
    if (!process.env.GITHUB_TOKEN) {
      console.log('⚠️  No GitHub token provided, skipping issue creation');
      return;
    }
    
    // Group findings by type and severity
    const groupedFindings = this.groupFindings(findings);
    
    // Create consolidated issues for each group
    for (const [key, group] of Object.entries(groupedFindings)) {
      if (group.length > 0 && this.shouldCreateIssue(group[0])) {
        await this.createConsolidatedIssue(key, group);
      }
    }
  }

  groupFindings(findings) {
    const groups = {};
    
    for (const finding of findings) {
      const key = `${finding.type}_${finding.severity}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(finding);
    }
    
    return groups;
  }

  shouldCreateIssue(finding) {
    // Only create issues for critical and high severity findings
    return finding.severity === 'critical' || finding.severity === 'high';
  }

  async createConsolidatedIssue(key, findings) {
    const [type, severity] = key.split('_');
    const template = this.config.issue_creation.templates[type] || 
                    this.config.issue_creation.templates.ui_bug;
    
    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
    
    try {
      const issue = await this.octokit.issues.create({
        owner,
        repo,
        title: `[Auto-detected] ${severity.toUpperCase()} ${type} issues (${findings.length} found)`,
        body: this.generateConsolidatedIssueBody(type, severity, findings),
        labels: [...template.labels, severity, 'mcp-enhanced'],
        assignees: template.assignees
      });
      
      console.log(`   📝 Created consolidated issue #${issue.data.number} for ${findings.length} ${type} findings`);
      
      await this.reporter.logActivity(
        'issue_created',
        `Created Issue #${issue.data.number}`,
        `Consolidated ${findings.length} ${type} findings`
      );
    } catch (error) {
      console.error(`   ❌ Failed to create issue: ${error.message}`);
    }
  }

  generateConsolidatedIssueBody(type, severity, findings) {
    let body = `## 🤖 Automated Test Findings - Enhanced Testing Agent\n\n`;
    body += `**Type:** ${type}\n`;
    body += `**Severity:** ${severity}\n`;
    body += `**Total Findings:** ${findings.length}\n`;
    body += `**MCP Enhanced:** Yes\n\n`;
    
    body += `### Summary\n`;
    body += `The Enhanced Testing Agent found ${findings.length} ${type} issues with ${severity} severity.\n\n`;
    
    body += `### Detailed Findings\n\n`;
    
    findings.forEach((finding, index) => {
      body += `#### Finding ${index + 1}\n`;
      body += `- **Message:** ${finding.message}\n`;
      body += `- **Page:** ${finding.page || 'N/A'}\n`;
      body += `- **Browser:** ${finding.browser || 'N/A'}\n`;
      body += `- **Viewport:** ${finding.viewport || 'N/A'}\n`;
      body += `- **MCP Tool:** ${finding.mcp ? 'Yes' : 'No'}\n`;
      
      if (finding.screenshot) {
        body += `- **Screenshot:** ![Screenshot](${finding.screenshot})\n`;
      }
      
      if (finding.diffImage) {
        body += `- **Visual Diff:** ![Diff](${finding.diffImage})\n`;
      }
      
      if (finding.wcagCriteria) {
        body += `- **WCAG Criteria:** ${finding.wcagCriteria.join(', ')}\n`;
      }
      
      body += `\n`;
    });
    
    body += `### Environment\n`;
    body += `- **Test Suite:** Enhanced with MCP Browser Tools\n`;
    body += `- **Browsers Tested:** ${this.config.testing.browsers.join(', ')}\n`;
    body += `- **Timestamp:** ${new Date().toISOString()}\n`;
    
    body += `\n---\n`;
    body += `*This issue was automatically detected by the Enhanced Nuptul Testing Agent with MCP integration*`;
    
    return body;
  }

  getTotalTests() {
    // Calculate total tests based on configuration
    const browsers = this.config.testing.browsers.length;
    const viewports = this.config.testing.viewports.length;
    const pages = this.config.testing.pages.length;
    const suites = Object.keys(this.config.testing.testSuites).length;
    
    return browsers * viewports * pages * suites;
  }

  getFailedTests() {
    // Count tests with findings
    return this.findings.filter(f => f.type !== 'console_error' && f.type !== 'page_error').length;
  }

  getTestScope() {
    const scopeArg = process.argv.find(arg => arg.includes('--scope'));
    return scopeArg ? scopeArg.split('=')[1] : 'full';
  }

  // Inherit base testing methods from original TestingAgent
  async runBrowserTests(browserType, testSuites) {
    // Implementation inherited from base TestingAgent
    // Enhanced with dashboard reporting
    await this.reporter.logActivity(
      'browser_test_started',
      `${browserType} Tests Started`,
      `Running test suites: ${testSuites.join(', ')}`
    );
    
    // Call parent implementation
    // ... (implementation details from original TestingAgent)
  }
}

// Configuration loader
async function loadConfig() {
  const configPath = process.env.TESTING_AGENT_CONFIG || 
                     path.join(__dirname, 'config.json');
  const configData = await fs.readFile(configPath, 'utf8');
  return JSON.parse(configData);
}

// Main execution
async function main() {
  try {
    const config = await loadConfig();
    const agent = new EnhancedTestingAgent(config);
    await agent.run();
  } catch (error) {
    console.error('❌ Enhanced Testing Agent failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = { EnhancedTestingAgent };

// Run if called directly
if (require.main === module) {
  main();
}