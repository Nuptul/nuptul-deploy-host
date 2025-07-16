#!/bin/bash
# Fix build issues after Vite build

# Remove data URI modulepreload that breaks CSP
sed -i '/<link rel="modulepreload" href="data:application\/octet-stream/d' dist/index.html

# Fix .tsx file extension issue - rename .tsx to .js in assets
if [ -f dist/assets/App-*.tsx ]; then
  for file in dist/assets/App-*.tsx; do
    newfile="${file%.tsx}.js"
    mv "$file" "$newfile"
    basename_old=$(basename "$file")
    basename_new=$(basename "$newfile")
    # Update references in index.html
    sed -i "s/${basename_old}/${basename_new}/g" dist/index.html
    # Update references in all JS files
    find dist/assets -name "*.js" -type f -exec sed -i "s/${basename_old}/${basename_new}/g" {} \;
    echo "✅ Renamed $basename_old to $basename_new"
  done
fi

echo "✅ Fixed build issues"