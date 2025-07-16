# Nuptul Deploy Host - Deployment Setup Guide

## GitHub Repository Setup

The repository has been created at: https://github.com/Nuptul/nuptul-deploy-host

## Required GitHub Actions Secrets

Configure these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

### Production Environment
- `VITE_SUPABASE_URL`: Production Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Production Supabase anonymous key
- `SUPABASE_PROD_SERVICE_KEY`: Production Supabase service role key (for migration agent)

### Development Environment (for migration agent)
- `SUPABASE_DEV_URL`: https://iwmfxcrzzwpmxomydmuq.supabase.co
- `SUPABASE_DEV_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWZ4Y3J6endwbXhvbXlkbXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjQxMjQsImV4cCI6MjA0ODgwMDEyNH0.nPFQdJqnUx4xMpMNOjsUeGpQSFHgaEKKQJNQOSWjWoQ

### Netlify Configuration
- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: 9ae8b5b5-8e7c-4134-b7fc-717d90d82fb0

## Setup Instructions

### 1. Configure GitHub Actions Secrets

1. Go to https://github.com/Nuptul/nuptul-deploy-host/settings/secrets/actions
2. Click "New repository secret"
3. Add each of the secrets listed above

### 2. Get Netlify Auth Token

1. Go to https://app.netlify.com/user/applications#personal-access-tokens
2. Click "New access token"
3. Give it a descriptive name like "Nuptul Deploy Host CI/CD"
4. Copy the token and add it as `NETLIFY_AUTH_TOKEN` secret

### 3. Set Up Production Supabase

1. Create a new Supabase project for Nuptial PTY LTD
2. Get the project URL and anon key from project settings
3. Add them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets
4. Generate a service role key for the migration agent

### 4. Push Code to GitHub

Since you have access to the Nuptul account, you can push directly:

```bash
# Add your GitHub token to authenticate
git remote set-url origin https://YOUR_TOKEN@github.com/Nuptul/nuptul-deploy-host.git

# Or use SSH if you have SSH keys configured
git remote set-url origin git@github.com:Nuptul/nuptul-deploy-host.git

# Push to GitHub
git push -u origin main
```

### 5. Verify Deployment

1. Check GitHub Actions runs at: https://github.com/Nuptul/nuptul-deploy-host/actions
2. The deployment workflow will trigger automatically on push
3. Site will be available at: https://nuptul.com

## Multi-Agent System

The multi-agent orchestrator will run:
- **Every 6 hours** via cron schedule
- **On new issues** for automatic assignment
- **On manual trigger** for full system activation

### Agent Features

1. **Testing Agent**: Automated UI testing with screenshots
2. **Migration Agent**: Database migration from dev to production
3. **Orchestrator**: Issue analysis and agent assignment
4. **Health Monitoring**: System health checks

### Observability

The system includes:
- Real-time agent health monitoring
- Automated issue creation and assignment
- Performance metrics collection
- Screenshot capture for UI testing

## Domain Configuration

The site is already configured for nuptial.com domain with:
- Custom domain: nuptial.com
- SSL certificate: Automatic
- CDN: Global distribution
- Security headers: Configured

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all environment variables are set correctly
2. **Deployment fails**: Verify Netlify token and site ID
3. **Agent errors**: Check GitHub token permissions

### Debug Commands

```bash
# Test local build
npm run build

# Validate agent system
node .github/agents/validate-system.cjs

# Manual deployment
netlify deploy --prod --dir=dist
```

## Next Steps

1. Push code to GitHub
2. Configure GitHub Actions secrets
3. Set up production Supabase project
4. Test deployment pipeline
5. Activate multi-agent system

The system is now ready for continuous deployment and multi-agent orchestration!