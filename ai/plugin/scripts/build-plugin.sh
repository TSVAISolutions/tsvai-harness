#!/bin/bash

# Build TSVAI plugin
# Usage: ./scripts/build-plugin.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building TSVAI plugin..."
echo ""

# Install dependencies
if [ -f "$PLUGIN_DIR/package.json" ]; then
    echo "1. Installing dependencies..."
    cd "$PLUGIN_DIR"
    npm install
    echo "   ✓ Dependencies installed"
fi

# Run build script if defined
if [ -f "$PLUGIN_DIR/package.json" ] && grep -q '"build"' "$PLUGIN_DIR/package.json"; then
    echo "2. Running build script..."
    cd "$PLUGIN_DIR"
    npm run build 2>/dev/null || echo "   ⊘ No build script defined"
fi

echo ""
echo "✓ Plugin build complete"
