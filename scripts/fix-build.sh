#\!/bin/bash
# Fix build issues after Vite build

# Remove data URI modulepreload that breaks CSP
sed -i '/<link rel="modulepreload" href="data:application\/octet-stream/d' dist/index.html

echo "✅ Fixed build issues"