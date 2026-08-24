#!/bin/bash

# TSVAI Plugin Setup Script
# Initialize and setup plugin environment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Setting up TSVAI Plugin environment..."
echo ""

# 1. Download CLI if available
echo "1. Downloading TSVAI CLI..."
if command -v gh &> /dev/null; then
    cd "$PLUGIN_DIR"
    gh release download --repo TSVAISolutions/cli --pattern "tsvai.mjs" --clobber 2>/dev/null || echo "   ⊘ CLI not found in releases (optional)"
    if [ -f "$PLUGIN_DIR/tsvai.mjs" ]; then
        mv "$PLUGIN_DIR/tsvai.mjs" "$PLUGIN_DIR/.tsvai.mjs"
        echo "   ✓ CLI downloaded"
    fi
else
    echo "   ⊘ gh CLI not installed (optional)"
fi

# 2. Install plugin dependencies
echo ""
echo "2. Installing plugin dependencies..."
if [ -f "$PLUGIN_DIR/package.json" ]; then
    cd "$PLUGIN_DIR"
    npm install
    echo "   ✓ Dependencies installed"
fi

# 3. Verify CLI availability
echo ""
echo "3. Verifying CLI setup..."
if [[ -f "$PLUGIN_DIR/bin/tsvai" ]]; then
    chmod +x "$PLUGIN_DIR/bin/tsvai"
    if "$PLUGIN_DIR/bin/tsvai" --version &>/dev/null; then
        echo "   ✓ CLI is available"
    else
        echo "   ⊘ CLI wrapper ready (binary not yet available)"
    fi
else
    echo "   ⊘ CLI wrapper not found"
fi

echo ""
echo "✓ Plugin setup complete"
echo ""
echo "Next steps:"
echo "  - Run: bash scripts/build-claude-code.sh   # Build plugin"
echo "  - Run: ./bin/tsvai --help                 # Test CLI"
