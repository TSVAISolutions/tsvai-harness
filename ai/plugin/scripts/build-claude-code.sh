#!/bin/bash

# Build TSVAI plugin for Claude Code integration
# This script builds the plugin and prepares it for distribution

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building TSVAI plugin for Claude Code..."
echo ""

# 1. Setup environment
echo "1. Setting up environment..."
bash "$SCRIPT_DIR/setup.sh" 2>&1 | grep -E "^   ✓|^   ⊘" || true
echo ""

# 2. Build plugin
echo "2. Building plugin..."
bash "$SCRIPT_DIR/build-plugin.sh"
echo ""

# 3. Verify structure
echo "3. Verifying plugin structure..."
REQUIRED_FILES=(".claude-plugin/plugin.json" "CLAUDE.md" ".mcp.json" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PLUGIN_DIR/$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file (missing)"
    fi
done

echo ""
echo "✓ Plugin build for Claude Code complete"
echo ""
echo "Plugin is ready to use with Claude Code at: $PLUGIN_DIR"
