#!/usr/bin/env node

/**
 * Nuptul Multi-Agent System Validation Script
 * 
 * This script validates the complete multi-agent system setup including:
 * - GitHub workflows configuration
 * - Agent implementations
 * - Secret availability
 * - Deployment readiness
 * - Infinite loop system health
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../agent-deployment-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      this.errors.push('Failed to load agent deployment config');
      return {};
    }
  }

  async validateSystem() {
    console.log('🔍 Nuptul Multi-Agent System Validation');
    console.log('=====================================\n');

    // Core validation checks
    await this.validateFileStructure();
    await this.validateWorkflows();
    await this.validateAgentImplementations();
    await this.validateEnvironmentSetup();
    await this.validateBuildSystem();
    await this.validateInfiniteLoopReadiness();
    
    this.generateReport();
  }

  async validateFileStructure() {
    this.addCheck('📁 File Structure Validation');
    
    const requiredPaths = [
      '.github/workflows',
      '.github/agents/testing',
      '.github/agents/migration',
      '.github/agents/development',
      '.github/agents/orchestrator',
      'src',
      'dist',
      'package.json'
    ];

    requiredPaths.forEach(requiredPath => {
      if (fs.existsSync(requiredPath)) {
        this.addCheck(`  ✅ ${requiredPath}`);
      } else {
        this.errors.push(`Missing required path: ${requiredPath}`);
        this.addCheck(`  ❌ ${requiredPath}`);
      }
    });
  }

  async validateWorkflows() {
    this.addCheck('\n🔄 GitHub Workflows Validation');
    
    const workflowFiles = [
      'orchestrator.yml',
      'agent-ci.yml',
      'test-automation.yml',
      'deploy-netlify.yml'
    ];

    workflowFiles.forEach(workflow => {
      const workflowPath = path.join('.github/workflows', workflow);
      if (fs.existsSync(workflowPath)) {
        this.addCheck(`  ✅ ${workflow}`);
        this.validateWorkflowSyntax(workflowPath);
      } else {
        this.errors.push(`Missing workflow: ${workflow}`);
        this.addCheck(`  ❌ ${workflow}`);
      }
    });
  }

  validateWorkflowSyntax(workflowPath) {
    try {
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for required secrets
      const requiredSecrets = [
        'GITHUB_TOKEN',
        'NETLIFY_AUTH_TOKEN',
        'NETLIFY_SITE_ID',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ];

      requiredSecrets.forEach(secret => {
        if (content.includes(`secrets.${secret}`)) {
          this.addCheck(`    ✅ Uses ${secret}`);
        } else if (secret === 'GITHUB_TOKEN' && !workflowPath.includes('deploy-netlify.yml')) {
          // GITHUB_TOKEN not required in all workflows
          return;
        } else {
          this.warnings.push(`Workflow ${workflowPath} may be missing ${secret}`);
        }
      });

    } catch (error) {
      this.errors.push(`Failed to validate workflow syntax: ${workflowPath}`);
    }
  }

  async validateAgentImplementations() {
    this.addCheck('\n🤖 Agent Implementation Validation');
    
    const agentTypes = ['testing', 'migration', 'development', 'orchestrator'];
    
    agentTypes.forEach(agentType => {
      const agentDir = path.join('.github/agents', agentType);
      if (fs.existsSync(agentDir)) {
        this.addCheck(`  ✅ ${agentType} agent directory`);
        this.validateAgentFiles(agentType, agentDir);
      } else {
        this.errors.push(`Missing agent directory: ${agentType}`);
        this.addCheck(`  ❌ ${agentType} agent directory`);
      }
    });
  }

  validateAgentFiles(agentType, agentDir) {
    const files = fs.readdirSync(agentDir);
    
    // Check for main agent files
    const expectedFiles = {
      'testing': ['run-testing-agent.js', 'config.json'],
      'migration': ['run-migration.js'],
      'development': ['agent-template.js', 'generate-solution.js'],
      'orchestrator': ['analyze-issue.cjs', 'assign-agent.cjs', 'check-agent-health.cjs']
    };

    const expected = expectedFiles[agentType] || [];
    expected.forEach(fileName => {
      if (files.includes(fileName)) {
        this.addCheck(`    ✅ ${fileName}`);
      } else {
        this.warnings.push(`Missing agent file: ${agentType}/${fileName}`);
        this.addCheck(`    ⚠️  ${fileName}`);
      }
    });
  }

  async validateEnvironmentSetup() {
    this.addCheck('\n🌐 Environment Setup Validation');
    
    // Check for package.json
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.addCheck('  ✅ package.json found');
      
      // Check for required scripts
      const requiredScripts = ['dev', 'build', 'test', 'lint'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.addCheck(`    ✅ ${script} script`);
        } else {
          this.warnings.push(`Missing package.json script: ${script}`);
          this.addCheck(`    ⚠️  ${script} script`);
        }
      });
    } else {
      this.errors.push('Missing package.json');
      this.addCheck('  ❌ package.json');
    }

    // Check for environment files
    const envFiles = ['.env.example', '.env.local'];
    envFiles.forEach(envFile => {
      if (fs.existsSync(envFile)) {
        this.addCheck(`  ✅ ${envFile}`);
      } else {
        this.warnings.push(`Missing environment file: ${envFile}`);
        this.addCheck(`  ⚠️  ${envFile}`);
      }
    });
  }

  async validateBuildSystem() {
    this.addCheck('\n🏗️  Build System Validation');
    
    try {
      // Check if dist directory exists (from previous build)
      if (fs.existsSync('dist')) {
        this.addCheck('  ✅ Build artifacts found');
        
        // Check for key build files
        const buildFiles = ['index.html', 'assets'];
        buildFiles.forEach(file => {
          if (fs.existsSync(path.join('dist', file))) {
            this.addCheck(`    ✅ ${file}`);
          } else {
            this.warnings.push(`Missing build file: dist/${file}`);
            this.addCheck(`    ⚠️  ${file}`);
          }
        });
      } else {
        this.warnings.push('No build artifacts found - run "npm run build"');
        this.addCheck('  ⚠️  Build artifacts');
      }

      // Validate package installation
      if (fs.existsSync('node_modules')) {
        this.addCheck('  ✅ Dependencies installed');
      } else {
        this.errors.push('Dependencies not installed - run "npm install"');
        this.addCheck('  ❌ Dependencies');
      }

    } catch (error) {
      this.errors.push(`Build system validation failed: ${error.message}`);
    }
  }

  async validateInfiniteLoopReadiness() {
    this.addCheck('\n♾️  Infinite Loop System Validation');
    
    // Check for observability components
    const observabilityFiles = [
      'development Files/observability-dashboard-implementation.md'
    ];

    observabilityFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.addCheck(`  ✅ ${path.basename(file)}`);
      } else {
        this.warnings.push(`Missing observability component: ${file}`);
        this.addCheck(`  ⚠️  ${path.basename(file)}`);
      }
    });

    // Check agent coordination files
    const coordinationFiles = [
      '.github/agents/development/generate-solution.js',
      '.github/agents/orchestrator/assign-agent.cjs'
    ];

    coordinationFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.addCheck(`  ✅ ${path.basename(file)}`);
      } else {
        this.errors.push(`Missing coordination file: ${file}`);
        this.addCheck(`  ❌ ${path.basename(file)}`);
      }
    });

    // Validate configuration
    if (this.config.infinite_loop) {
      this.addCheck('  ✅ Infinite loop configuration');
      if (this.config.infinite_loop.enabled) {
        this.addCheck('    ✅ Loop system enabled');
      } else {
        this.warnings.push('Infinite loop system is disabled');
        this.addCheck('    ⚠️  Loop system disabled');
      }
    } else {
      this.warnings.push('Missing infinite loop configuration');
      this.addCheck('  ⚠️  Loop configuration');
    }
  }

  addCheck(message) {
    this.checks.push(message);
    console.log(message);
  }

  generateReport() {
    console.log('\n📊 Validation Report');
    console.log('===================\n');

    const totalChecks = this.checks.length;
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;

    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Warnings: ${warningCount}\n`);

    if (errorCount > 0) {
      console.log('❌ Critical Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
      console.log('');
    }

    if (warningCount > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
      console.log('');
    }

    // System readiness assessment
    console.log('🎯 System Readiness Assessment:');
    
    if (errorCount === 0) {
      if (warningCount === 0) {
        console.log('✅ FULLY READY - All systems operational!');
        console.log('🚀 Multi-agent system is ready for infinite loop operation.');
      } else if (warningCount <= 3) {
        console.log('🟡 MOSTLY READY - Minor issues detected');
        console.log('⚡ System can operate with reduced functionality.');
      } else {
        console.log('🟠 PARTIALLY READY - Multiple warnings detected');
        console.log('🔧 Recommend addressing warnings before full deployment.');
      }
    } else {
      console.log('❌ NOT READY - Critical errors must be resolved');
      console.log('🛠️  Please fix all errors before deployment.');
    }

    console.log('\n📋 Next Steps:');
    if (errorCount > 0) {
      console.log('1. Fix all critical errors listed above');
      console.log('2. Re-run validation: node .github/agents/validate-system.js');
    } else {
      console.log('1. Configure GitHub repository secrets');
      console.log('2. Test individual workflow triggers');
      console.log('3. Monitor agent activity in observability dashboard');
      console.log('4. Activate infinite loop system');
    }

    console.log('\n🔗 Resources:');
    console.log('• Setup Guide: ./setup-production.md');
    console.log('• Agent Config: ./.github/agent-deployment-config.json');
    console.log('• Live Site: http://nuptial-production.netlify.app');
    console.log('• Netlify Dashboard: https://app.netlify.com/sites/9ae8b5b5-8e7c-4134-b7fc-717d90d82fb0');

    // Exit with appropriate code
    process.exit(errorCount > 0 ? 1 : 0);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SystemValidator();
  validator.validateSystem().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = SystemValidator;