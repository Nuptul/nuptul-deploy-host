# Nuptul Deploy Host - Deployment Pipeline

## Overview

This deployment pipeline implements the requested staging → production workflow for the Nuptul wedding platform with multi-agent testing and approval.

## Workflow

### 1. First Deployment (Direct to Production)
- **Initial push**: Goes directly to nuptul.com
- **Trigger**: Push to `main` branch
- **Status**: ✅ Already deployed at https://nuptul.com

### 2. Future Updates (Staging → Production)
- **Staging**: Push to `develop` or `staging` branch
- **Test**: Multi-agent testing runs automatically
- **Approve**: Manual approval required for production
- **Deploy**: Production deployment with verification

## Branch Strategy

```
main (production) ← First deployment done
  ↑
  └── develop (staging) ← Future updates
      ↑
      └── feature/* (development)
```

## Staging Process

### 1. Create Staging Deployment
```bash
# Create staging branch
git checkout -b staging

# Make changes
git add .
git commit -m "Update: description of changes"

# Push to staging
git push origin staging
```

### 2. Automatic Testing
- **Multi-agent testing** runs automatically
- **Screenshots** captured for visual verification
- **Performance metrics** collected
- **Accessibility checks** performed
- **Functional tests** executed

### 3. Manual Approval
- Review staging deployment at test URL
- Check test results and screenshots
- Approve or reject for production

### 4. Production Deployment
- Manual workflow trigger with approval
- Automatic deployment to nuptul.com
- Post-deployment verification

## GitHub Actions Workflows

### `.github/workflows/staging-deploy.yml`
- **Trigger**: Push to `develop` or `staging` branches
- **Actions**: Build, deploy to staging, run tests
- **Output**: Staging URL and test results

### `.github/workflows/production-deploy.yml`
- **Trigger**: Manual workflow dispatch
- **Actions**: Manual approval, deploy to production
- **Output**: Production deployment confirmation

### `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Actions**: Direct production deployment
- **Usage**: Initial deployment (already done)

## Multi-Agent Testing

### Testing Agent Features
- **Cross-browser testing** (Chrome, Firefox, Safari)
- **Responsive design** testing across viewports
- **Performance monitoring** with thresholds
- **Accessibility validation** (WCAG compliance)
- **Functional testing** of key user flows
- **Screenshot capture** for visual verification

### Test Suites
- **Navigation**: All menu links and routing
- **RSVP**: Form validation and submission
- **Gallery**: Photo upload and display
- **Messaging**: Instant messaging functionality
- **Performance**: Load times and Core Web Vitals

## Configuration Requirements

### GitHub Actions Secrets
```bash
# Production Environment
VITE_SUPABASE_URL=https://your-production-supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Netlify Configuration
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=9ae8b5b5-8e7c-4134-b7fc-717d90d82fb0

# GitHub Token (for issue creation)
GITHUB_TOKEN=automatically-provided
```

## Usage Instructions

### For Developers
1. **Clone repository**
2. **Create feature branch**
3. **Make changes**
4. **Push to staging branch**
5. **Review test results**
6. **Request production deployment**

### For Deployment Manager
1. **Monitor staging deployments**
2. **Review multi-agent test results**
3. **Approve/reject production deployments**
4. **Monitor production health**

## Monitoring and Observability

### Automated Monitoring
- **Performance metrics** collection
- **Error tracking** with screenshots
- **Accessibility compliance** monitoring
- **Functional test results**

### Manual Review Points
- **Staging URL review** before production
- **Test results approval** for critical issues
- **Performance threshold** validation
- **User experience** verification

## Next Steps

1. **Push code to GitHub** (authentication required)
2. **Configure GitHub Actions secrets**
3. **Test staging deployment**
4. **Verify production approval workflow**
5. **Enable continuous deployment**

## Support

- **GitHub Repository**: https://github.com/Nuptul/nuptul-deploy-host
- **Live Site**: https://nuptul.com
- **Multi-agent system**: Runs automatically on deployment

The staging/production pipeline is now ready for continuous deployment with multi-agent testing and approval workflow!