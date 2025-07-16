# CSP (Content Security Policy) Troubleshooting Guide

## Common Issues and Solutions

### Issue: White Screen with CSP Errors

**Symptoms:**
- Site shows white/blank screen
- Browser console shows errors like:
  - "Refused to load the stylesheet 'https://fonts.googleapis.com/...' because it violates the following Content Security Policy directive"
  - "Refused to load the script 'data:...' because it violates the following Content Security Policy directive"

**Root Causes:**
1. CSP headers blocking required resources (Google Fonts, data URIs, etc.)
2. Conflicting CSP definitions in multiple places
3. Netlify serving different headers than configured

### CSP Configuration Locations

**DO NOT** define CSP in multiple places! Choose ONE:

1. **netlify.toml** (RECOMMENDED)
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       Content-Security-Policy = "..."
   ```

2. **_headers file** (Alternative)
   ```
   /*
     Content-Security-Policy: ...
   ```

3. **HTML meta tag** (NOT RECOMMENDED)
   ```html
   <meta http-equiv="Content-Security-Policy" content="...">
   ```

### Priority Order
- netlify.toml > _headers > HTML meta tags
- HTTP headers override meta tags

### Required CSP Directives for This App

```
default-src 'self' https:;
script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:;
style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com;
img-src 'self' https: data: blob: https://ui-avatars.com;
font-src 'self' https: data: https://fonts.gstatic.com;
connect-src 'self' https: wss: ws: https://*.supabase.co wss://*.supabase.co;
media-src 'self' https: blob:;
object-src 'none';
frame-src 'self' https:;
worker-src 'self' blob:;
```

### Debugging Steps

1. **Check what headers are actually being served:**
   ```bash
   curl -I https://yourdomain.com | grep -i content-security-policy
   ```

2. **Check browser console for CSP violations**

3. **Verify netlify.toml is properly formatted:**
   - No syntax errors
   - Proper indentation
   - Headers in correct section

4. **Check for conflicting configurations:**
   - Remove CSP from HTML meta tags if using netlify.toml
   - Ensure no _headers file exists if using netlify.toml
   - Check for build plugins that might modify headers

### Testing CSP Changes

1. **Use Report-Only mode first:**
   ```toml
   Content-Security-Policy-Report-Only = "..."
   ```

2. **Test locally with Netlify CLI:**
   ```bash
   netlify dev
   ```

3. **Deploy to preview branch first**

### Common Gotchas

1. **Vite generates data: URI modulepreloads** - Ensure `data:` is in script-src
2. **Google Fonts requires specific domains** - Add both googleapis.com and gstatic.com
3. **Supabase WebSockets** - Include wss://*.supabase.co in connect-src
4. **Netlify caching** - Headers might be cached, wait 2-5 minutes for changes

### Emergency Fix

If site is down due to CSP:
1. Remove ALL CSP configurations temporarily
2. Deploy and verify site works
3. Add CSP back incrementally
4. Test each addition

### Resources

- [Netlify CSP Documentation](https://docs.netlify.com/security/content-security-policy/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)