#!/bin/bash

# 🔐 Nuptul Deploy Host - GitHub Secrets Configuration
# Professional setup script for production deployment secrets

echo "🔐 Setting up GitHub Actions secrets for Nuptul Deploy Host..."
echo "================================================================="

# Repository details
REPO="Thelyoncrypt/nuptul-deploy-host"

# Supabase Configuration
SUPABASE_URL="https://iwmfxcrzzwpmxomydmuq.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWZ4Y3J6endwbXhvbXlkbXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjQ5NjEsImV4cCI6MjA2NzQ0MDk2MX0.0Nh_rE_1vKYxT68nwQ11esIkOz6OcDY3YdZCb-bucYc"

# Netlify Configuration
NETLIFY_SITE_ID="9ae8b5b5-8e7c-4134-b7fc-717d90d82fb0"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run 'gh auth login' first."
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Set Supabase secrets
echo "🔧 Setting Supabase secrets..."
echo "$SUPABASE_URL" | gh secret set VITE_SUPABASE_URL --repo "$REPO"
echo "$SUPABASE_ANON_KEY" | gh secret set VITE_SUPABASE_ANON_KEY --repo "$REPO"

# Set Netlify secrets
echo "🔧 Setting Netlify secrets..."
echo "$NETLIFY_SITE_ID" | gh secret set NETLIFY_SITE_ID --repo "$REPO"

# Note about manual secret
echo "⚠️  Please manually set NETLIFY_AUTH_TOKEN secret using:"
echo "   gh secret set NETLIFY_AUTH_TOKEN --repo $REPO"
echo "   Then paste your Netlify personal access token"

echo ""
echo "✅ GitHub secrets configuration complete!"
echo ""
echo "📋 Configured secrets:"
echo "   ✅ VITE_SUPABASE_URL"
echo "   ✅ VITE_SUPABASE_ANON_KEY"
echo "   ✅ NETLIFY_SITE_ID"
echo "   ⚠️  NETLIFY_AUTH_TOKEN (manual setup required)"
echo ""
echo "🚀 Your repository is now ready for production deployment!"
echo "📍 Repository: https://github.com/$REPO"
echo "🌐 Production URL: https://nuptul.com"