# Nuptily Application Credentials & API Keys

## 🔐 Authentication Credentials

### Admin Account
- **Email**: daniel.j.fleuren@gmail.com
- **Password**: 3d3nC@n@@nAV3nu3

### Guest Test Account
- **Email**: supabasecrypt@gmail.com
- **Password**: 3d3nC@n@@nAV3nu3

### System Access
- **Sudo Password**: 3d3nC@n@@nAv3nu3

---

## 🗄️ Supabase Configuration

### Production Instance
- **URL**: https://iwmfxcrzzwpmxomydmuq.supabase.co
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWZ4Y3J6endwbXhvbXlkbXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjQ5NjEsImV4cCI6MjA2NzQ0MDk2MX0.0Nh_rE_1vKYxT68nwQ11esIkOz6OcDY3YdZCb-bucYc`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWZ4Y3J6endwbXhvbXlkbXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg2NDk2MSwiZXhwIjoyMDY3NDQwOTYxfQ.08sSTpIieN0SMWgWXdE55-rsqQ4cy4D5FIQCrv6vOQ8`

### Supabase MCP Token
- **Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWZ4Y3J6endwbXhvbXlkbXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg2NDk2MSwiZXhwIjoyMDY3NDQwOTYxfQ.08sSTpIieN0SMWgWXdE55-rsqQ4cy4D5FIQCrv6vOQ8`


### Supabase Access Token
- **Service Role Key**:`sbp_7847fbe4bc521017244372aed13b4582da2387dc`

### Netlify MCP Tool Deployment Work FLow
-**Access-key**: `nfp_Z92vbVtp7iKb6gzgDicRjEYkB8dFycuD82f2`
---

## 🔑 MCP Service API Keys

### Brave Search API
- **API Key**: `BSAloN0HxiGQ9-as536DXH8Tdf_UEo4`

### Perplexity AI API
- **API Key**: `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`

### E2B Sandbox API
- **API Key**: `e2b_b2b143f2eab457d636a1e62e1870b7ad8b6f5c3f`

### Sentry API
- **API Key**: `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`

### FireCrawl API
- **API Key**: `fc-531327c505ce497182312022c2e026a2`

### Magic AI by 21st.dev
- **API Key**: `YOUR_MAGIC_API_KEY_HERE` (needs to be obtained from https://21st.dev/magic/console)

---

## 🌐 External Service Configurations

### WebRTC Configuration
- **STUN Servers**: `stun:stun.l.google.com:19302`

### Gift Registry External Link
- **URL**: https://mygiftregistry.com.au/id/tim-and-kirsten/

---

## 🚀 Deployment URLs

### Development
- **Frontend**: http://localhost:8090
- **Supabase Functions**: http://localhost:8091

### Production (to be configured)
- **App URL**: https://your-wedding-domain.com
- **CDN URL**: https://your-cdn-domain.com

---

## 📋 Feature Flags

All features are currently enabled:
- Video Calling: `true`
- Real-time Chat: `true`
- Photo Uploads: `true`
- Admin Dashboard: `true`

---

## ⚠️ Security Notes

1. **NEVER commit this file to version control**
2. Add `credentials.md` to `.gitignore`
3. Use environment variables in production
4. Rotate API keys regularly
5. Service Role Key should only be used server-side
6. Anon Key is safe for client-side use

---

## 🔧 MCP Toolkit Configuration

For MCP Docker toolkit access, ensure these environment variables are set:
- `SUPABASE_MCP_TOKEN` (same as Service Role Key)
- `BRAVE_SEARCH_API_KEY`
- `PERPLEXITY_API_KEY`
- `E2B_API_KEY`
- `SENTRY_API_KEY`
- `FIRECRAWL_API_KEY`

---

Last Updated: January 2025