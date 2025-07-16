#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Essential files to upload
const files = [
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  '.env.example',
  'netlify.toml',
  '.gitignore',
  'DEPLOYMENT_SETUP.md',
  'CLAUDE.md',
  '.github/workflows/deploy.yml',
  '.github/workflows/multi-agent-orchestrator.yml',
  '.github/agents/validate-system.cjs',
  '.github/agents/orchestrator/analyze-issue.cjs',
  '.github/agents/orchestrator/assign-agent.cjs',
  '.github/agents/orchestrator/check-agent-health.cjs',
  '.github/agents/testing/run-testing-agent.js',
  '.github/agents/migration/run-migration.js',
  '.github/agents/development/agent-template.js',
  '.github/agents/observability/dashboard.js'
];

// Create upload command
const uploadCommand = `
# Upload essential files to GitHub
git add .
git commit -m "🚀 Upload complete Nuptul multi-agent system"
git push origin main
`;

console.log('Files to upload:');
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
});

console.log('\nUpload command:');
console.log(uploadCommand);

// Try to upload using git
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🚀 Upload complete Nuptul multi-agent system"', { stdio: 'inherit' });
  console.log('\nTo complete the upload, run:');
  console.log('git push origin main');
} catch (error) {
  console.error('Error during git operations:', error.message);
  console.log('\nManual upload required. Set up authentication first.');
}