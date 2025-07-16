#!/bin/bash

# 🚀 Nuptul Deploy Host - GitHub Deployment Script
# Professional deployment script for private repository setup

echo "🔮 Nuptul Deploy Host - GitHub Deployment"
echo "=========================================="

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check authentication status
echo "🔍 Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run 'gh auth login' first."
    exit 1
fi

# Get current user
CURRENT_USER=$(gh api user --jq '.login')
echo "✅ Authenticated as: $CURRENT_USER"

# Check if repository exists
REPO_NAME="nuptul-deploy-host"
ORG_NAME="Nuptul"

echo "🔍 Checking repository status..."
if gh repo view "$ORG_NAME/$REPO_NAME" &> /dev/null; then
    echo "✅ Repository $ORG_NAME/$REPO_NAME exists"
    
    # Check if it's private
    REPO_VISIBILITY=$(gh repo view "$ORG_NAME/$REPO_NAME" --json visibility --jq '.visibility')
    if [ "$REPO_VISIBILITY" != "PRIVATE" ]; then
        echo "🔒 Making repository private..."
        gh repo edit "$ORG_NAME/$REPO_NAME" --visibility private
        echo "✅ Repository is now private"
    else
        echo "✅ Repository is already private"
    fi
else
    echo "❌ Repository $ORG_NAME/$REPO_NAME does not exist or is not accessible"
    echo "Please create the repository first or check permissions."
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin main; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/$ORG_NAME/$REPO_NAME"
else
    echo "❌ Failed to push to GitHub"
    echo "💡 Try running: gh auth refresh"
    exit 1
fi

# Update repository description
echo "📝 Updating repository description..."
gh repo edit "$ORG_NAME/$REPO_NAME" \
    --description "🔮 Nuptul Deploy Host - Advanced Multi-Agent Wedding Platform with Infinite Agentic Loop Architecture" \
    --homepage "https://nuptul.com" \
    --add-topic "wedding-platform" \
    --add-topic "multi-agent-system" \
    --add-topic "react-typescript" \
    --add-topic "supabase" \
    --add-topic "infinite-agentic-loop" \
    --add-topic "luxury-wedding" \
    --add-topic "professional-development"

echo "✅ Repository setup complete!"
echo ""
echo "🎉 Nuptul Deploy Host is now live on GitHub!"
echo "🔗 Repository: https://github.com/$ORG_NAME/$REPO_NAME"
echo "🌐 Live Site: https://nuptul.com"
echo ""
echo "📋 Next Steps:"
echo "1. Configure GitHub Actions secrets"
echo "2. Test staging deployment"
echo "3. Activate multi-agent system"
echo "4. Monitor production deployment"