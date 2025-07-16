#!/bin/bash
# Fix CSP injection in built HTML

echo "🔧 Fixing CSP injection in index.html..."

# Check if the problematic CSP meta tag exists
if grep -q 'Content-Security-Policy.*style-src.*self.*unsafe-inline.*;"' dist/index.html; then
  echo "Found restrictive CSP meta tag, updating..."
  
  # Replace the restrictive CSP with the correct one
  sed -i 's|<meta http-equiv="Content-Security-Policy" content="[^"]*">|<meta http-equiv="Content-Security-Policy" content="default-src '\''self'\'' https:; script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https: data:; style-src '\''self'\'' '\''unsafe-inline'\'' https: https://fonts.googleapis.com; img-src '\''self'\'' https: data: blob: https://ui-avatars.com; font-src '\''self'\'' https: data: https://fonts.gstatic.com; connect-src '\''self'\'' https: wss: ws: https://*.supabase.co wss://*.supabase.co; media-src '\''self'\'' https: blob:; object-src '\''none'\''; frame-src '\''self'\'' https:; worker-src '\''self'\'' blob:;">|g' dist/index.html
  
  echo "✅ Fixed CSP meta tag"
else
  echo "✅ No restrictive CSP meta tag found"
fi

# Also remove any data URI modulepreloads as before
sed -i '/<link rel="modulepreload" href="data:application\/octet-stream/d' dist/index.html

echo "✅ Completed CSP fixes"