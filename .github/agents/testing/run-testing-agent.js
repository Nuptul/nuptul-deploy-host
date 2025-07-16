#!/usr/bin/env node

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');

class TestingAgent {
  constructor(config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.argv.find(arg => arg.includes('--github-token'))?.split('=')[1]
    });
    this.findings = [];
    this.screenshots = [];
    this.metrics = {
      performance: {},
      accessibility: {},
      functional: {}
    };
  }

  async run() {
    console.log('🤖 Nuptul Testing Agent starting...');
    
    const scope = this.getTestScope();
    const testSuites = this.config.testing.testSuites[scope] || this.config.testing.testSuites.full;
    
    for (const browser of this.config.testing.browsers) {
      console.log(`\n🌐 Testing with ${browser}...`);
      await this.runBrowserTests(browser, testSuites);
    }
    
    await this.generateReport();
    await this.createGitHubIssues();
    
    console.log('✅ Testing Agent completed');
  }

  getTestScope() {
    const scopeArg = process.argv.find(arg => arg.includes('--scope'));
    return scopeArg ? scopeArg.split('=')[1] : 'full';
  }

  async runBrowserTests(browserType, testSuites) {
    const browser = await this.launchBrowser(browserType);
    
    try {
      for (const viewport of this.config.testing.viewports) {
        console.log(`  📱 Testing ${viewport.name} viewport...`);
        const context = await browser.newContext({
          viewport,
          locale: 'en-US',
          timezoneId: 'America/New_York'
        });
        
        const page = await context.newPage();
        
        // Set up console and error monitoring
        page.on('console', msg => this.handleConsoleMessage(msg));
        page.on('pageerror', error => this.handlePageError(error));
        
        for (const pageConfig of this.config.testing.pages) {
          await this.testPage(page, pageConfig, browserType, viewport.name, testSuites);
        }
        
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }

  async launchBrowser(browserType) {
    const browsers = { chromium, firefox, webkit };
    return await browsers[browserType].launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async testPage(page, pageConfig, browser, viewport, testSuites) {
    console.log(`    📄 Testing ${pageConfig.name} page...`);
    
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
      await page.goto(`${baseUrl}${pageConfig.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Take screenshot
      const screenshotPath = await this.captureScreenshot(page, pageConfig.name, browser, viewport);
      
      // Run test suites
      if (testSuites.includes('navigation')) {
        await this.testNavigation(page, pageConfig);
      }
      
      if (testSuites.includes('accessibility')) {
        await this.testAccessibility(page, pageConfig);
      }
      
      if (testSuites.includes('performance')) {
        await this.testPerformance(page, pageConfig);
      }
      
      if (testSuites.includes('functional')) {
        await this.testFunctionality(page, pageConfig);
      }
      
    } catch (error) {
      this.findings.push({
        type: 'error',
        severity: 'critical',
        page: pageConfig.name,
        browser,
        viewport,
        message: error.message,
        stack: error.stack
      });
    }
  }

  async captureScreenshot(page, pageName, browser, viewport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${pageName}-${browser}-${viewport}-${timestamp}.png`;
    const filepath = path.join('./screenshots', filename);
    
    await fs.mkdir('./screenshots', { recursive: true });
    await page.screenshot({ path: filepath, fullPage: true });
    
    this.screenshots.push({
      page: pageName,
      browser,
      viewport,
      path: filepath
    });
    
    return filepath;
  }

  async testNavigation(page, pageConfig) {
    // Test all navigation links
    const links = await page.$$('a[href]');
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        try {
          await Promise.race([
            link.click(),
            page.waitForTimeout(5000)
          ]);
          await page.goBack();
        } catch (error) {
          this.findings.push({
            type: 'navigation',
            severity: 'high',
            page: pageConfig.name,
            message: `Navigation link failed: ${href}`,
            error: error.message
          });
        }
      }
    }
  }

  async testAccessibility(page, pageConfig) {
    // Basic accessibility tests
    try {
      // Check for alt text on images
      const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
      if (imagesWithoutAlt > 0) {
        this.findings.push({
          type: 'accessibility',
          severity: 'high',
          page: pageConfig.name,
          message: `${imagesWithoutAlt} images found without alt text`
        });
      }
      
      // Check for form labels
      const inputsWithoutLabels = await page.$$eval(
        'input:not([type="hidden"]):not([type="submit"]):not([aria-label]):not([aria-labelledby])',
        inputs => inputs.filter(input => !input.labels || input.labels.length === 0).length
      );
      
      if (inputsWithoutLabels > 0) {
        this.findings.push({
          type: 'accessibility',
          severity: 'high',
          page: pageConfig.name,
          message: `${inputsWithoutLabels} form inputs found without labels`
        });
      }
      
      // Check color contrast (simplified)
      // In a real implementation, you'd use axe-core or similar
      
    } catch (error) {
      console.error('Accessibility test error:', error);
    }
  }

  async testPerformance(page, pageConfig) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };
    });
    
    this.metrics.performance[pageConfig.name] = metrics;
    
    // Check against thresholds
    if (metrics.loadTime > this.config.thresholds.performance.page_load_time) {
      this.findings.push({
        type: 'performance',
        severity: 'medium',
        page: pageConfig.name,
        message: `Page load time (${metrics.loadTime}ms) exceeds threshold (${this.config.thresholds.performance.page_load_time}ms)`
      });
    }
  }

  async testFunctionality(page, pageConfig) {
    // Page-specific functional tests
    switch (pageConfig.name) {
      case 'RSVP':
        await this.testRSVPFlow(page);
        break;
      case 'Messages':
        await this.testMessaging(page);
        break;
      case 'Gallery':
        await this.testGalleryUpload(page);
        break;
      // Add more page-specific tests
    }
  }

  async testRSVPFlow(page) {
    try {
      // Test RSVP form submission
      const form = await page.$('form[data-testid="rsvp-form"]');
      if (!form) {
        this.findings.push({
          type: 'functional',
          severity: 'critical',
          page: 'RSVP',
          message: 'RSVP form not found'
        });
        return;
      }
      
      // Fill and submit form (simplified)
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.selectOption('select[name="attending"]', 'yes');
      
      // Check if submit works
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        const isDisabled = await submitButton.isDisabled();
        if (isDisabled) {
          this.findings.push({
            type: 'functional',
            severity: 'high',
            page: 'RSVP',
            message: 'RSVP submit button is disabled'
          });
        }
      }
    } catch (error) {
      this.findings.push({
        type: 'functional',
        severity: 'critical',
        page: 'RSVP',
        message: `RSVP flow test failed: ${error.message}`
      });
    }
  }

  async testMessaging(page) {
    // Test instant messaging functionality
    try {
      const messageButton = await page.$('[data-testid="open-messenger"]');
      if (!messageButton) {
        this.findings.push({
          type: 'functional',
          severity: 'high',
          page: 'Messages',
          message: 'Messenger button not found'
        });
      }
    } catch (error) {
      console.error('Messaging test error:', error);
    }
  }

  async testGalleryUpload(page) {
    // Test gallery upload functionality
    try {
      const uploadButton = await page.$('[data-testid="upload-photo"]');
      if (!uploadButton) {
        this.findings.push({
          type: 'functional',
          severity: 'medium',
          page: 'Gallery',
          message: 'Photo upload button not found'
        });
      }
    } catch (error) {
      console.error('Gallery test error:', error);
    }
  }

  handleConsoleMessage(msg) {
    if (msg.type() === 'error') {
      this.findings.push({
        type: 'console_error',
        severity: 'medium',
        message: msg.text(),
        location: msg.location()
      });
    }
  }

  handlePageError(error) {
    this.findings.push({
      type: 'page_error',
      severity: 'high',
      message: error.message,
      stack: error.stack
    });
  }

  async generateReport() {
    const outputDir = process.argv.find(arg => arg.includes('--output'))?.split('=')[1] || './test-results';
    await fs.mkdir(outputDir, { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      agent: this.config.agent,
      findings: this.findings,
      screenshots: this.screenshots,
      metrics: this.metrics,
      summary: {
        total_issues: this.findings.length,
        critical: this.findings.filter(f => f.severity === 'critical').length,
        high: this.findings.filter(f => f.severity === 'high').length,
        medium: this.findings.filter(f => f.severity === 'medium').length,
        low: this.findings.filter(f => f.severity === 'low').length
      }
    };
    
    await fs.writeFile(
      path.join(outputDir, 'findings.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Test Summary:');
    console.log(`   Total Issues: ${report.summary.total_issues}`);
    console.log(`   Critical: ${report.summary.critical}`);
    console.log(`   High: ${report.summary.high}`);
    console.log(`   Medium: ${report.summary.medium}`);
    console.log(`   Low: ${report.summary.low}`);
  }

  async createGitHubIssues() {
    if (!process.env.GITHUB_TOKEN) {
      console.log('⚠️  No GitHub token provided, skipping issue creation');
      return;
    }
    
    const criticalAndHighFindings = this.findings.filter(
      f => f.severity === 'critical' || f.severity === 'high'
    );
    
    for (const finding of criticalAndHighFindings) {
      await this.createIssue(finding);
    }
  }

  async createIssue(finding) {
    const template = this.config.issue_creation.templates[finding.type] || 
                    this.config.issue_creation.templates.ui_bug;
    
    const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || ['nuptul', 'nuptul-deploy-host'];
    
    try {
      const issue = await this.octokit.issues.create({
        owner,
        repo,
        title: `[Auto-detected] ${finding.type}: ${finding.message.substring(0, 60)}...`,
        body: this.generateIssueBody(finding),
        labels: template.labels,
        assignees: template.assignees
      });
      
      console.log(`   📝 Created issue #${issue.data.number}`);
    } catch (error) {
      console.error(`   ❌ Failed to create issue: ${error.message}`);
    }
  }

  generateIssueBody(finding) {
    let body = `## 🤖 Automated Test Finding\n\n`;
    body += `**Type:** ${finding.type}\n`;
    body += `**Severity:** ${finding.severity}\n`;
    body += `**Page:** ${finding.page || 'N/A'}\n`;
    
    if (finding.browser) {
      body += `**Browser:** ${finding.browser}\n`;
    }
    
    if (finding.viewport) {
      body += `**Viewport:** ${finding.viewport}\n`;
    }
    
    body += `\n### Description\n${finding.message}\n`;
    
    if (finding.stack) {
      body += `\n### Stack Trace\n\`\`\`\n${finding.stack}\n\`\`\`\n`;
    }
    
    if (finding.location) {
      body += `\n### Location\n`;
      body += `- URL: ${finding.location.url}\n`;
      body += `- Line: ${finding.location.lineNumber}\n`;
      body += `- Column: ${finding.location.columnNumber}\n`;
    }
    
    // Find related screenshot
    const screenshot = this.screenshots.find(
      s => s.page === finding.page && 
           s.browser === finding.browser && 
           s.viewport === finding.viewport
    );
    
    if (screenshot) {
      body += `\n### Screenshot\n`;
      body += `![Screenshot](${screenshot.path})\n`;
    }
    
    body += `\n---\n`;
    body += `*This issue was automatically detected by the Nuptul Testing Agent*`;
    
    return body;
  }
}

// Load configuration
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
    const agent = new TestingAgent(config);
    await agent.run();
  } catch (error) {
    console.error('❌ Testing Agent failed:', error);
    process.exit(1);
  }
}

main();