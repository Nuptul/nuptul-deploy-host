#!/bin/bash
# Deployment verification script

echo "🔍 Verifying Nuptul deployment..."
echo "================================"

# Check if site is accessible
echo -n "1. Checking site availability... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nuptul.com)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Site is up (HTTP $HTTP_STATUS)"
else
  echo "❌ Site returned HTTP $HTTP_STATUS"
fi

# Check CSP headers
echo -e "\n2. Checking CSP headers:"
CSP_HEADER=$(curl -s -I https://nuptul.com | grep -i "content-security-policy:" | head -1)
if [ -n "$CSP_HEADER" ]; then
  echo "Found CSP header:"
  echo "$CSP_HEADER"
  
  # Check for required directives
  if echo "$CSP_HEADER" | grep -q "https://fonts.googleapis.com"; then
    echo "  ✅ Google Fonts allowed in style-src"
  else
    echo "  ❌ Google Fonts NOT allowed in style-src"
  fi
  
  if echo "$CSP_HEADER" | grep -q "data:" && echo "$CSP_HEADER" | grep -q "script-src"; then
    echo "  ✅ Data URIs allowed in script-src"
  else
    echo "  ❌ Data URIs NOT allowed in script-src"
  fi
else
  echo "❌ No CSP header found"
fi

# Check JavaScript MIME types
echo -e "\n3. Checking JavaScript MIME types:"
JS_CONTENT_TYPE=$(curl -s -I https://nuptul.com/assets/index-*.js | grep -i "content-type:" | head -1)
if echo "$JS_CONTENT_TYPE" | grep -q "application/javascript"; then
  echo "✅ JavaScript files served with correct MIME type"
else
  echo "❌ JavaScript files have incorrect MIME type: $JS_CONTENT_TYPE"
fi

# Check for CSP meta tag in HTML
echo -e "\n4. Checking for CSP meta tag injection:"
if curl -s https://nuptul.com | grep -q '<meta http-equiv="Content-Security-Policy"'; then
  echo "⚠️  CSP meta tag found in HTML (might be from plugins)"
  CSP_META=$(curl -s https://nuptul.com | grep -o '<meta http-equiv="Content-Security-Policy"[^>]*>' | head -1)
  echo "  $CSP_META"
else
  echo "✅ No CSP meta tag in HTML"
fi

# Check if main resources load
echo -e "\n5. Checking resource loading:"
# Check Google Fonts
if curl -s https://nuptul.com | grep -q "fonts.googleapis.com"; then
  echo "✅ Google Fonts references found"
else
  echo "⚠️  No Google Fonts references found"
fi

# Summary
echo -e "\n================================"
echo "Deployment verification complete!"
echo "Check https://nuptul.com in browser for visual confirmation"