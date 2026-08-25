#!/bin/bash
# Setup TSVAI harness environment

set -e

echo "TSVAI Harness Setup"
echo "==================="
echo ""

# Check dependencies
echo "1. Checking dependencies..."
command -v git >/dev/null || { echo "✗ git not found"; exit 1; }
command -v node >/dev/null || { echo "✗ node not found"; exit 1; }
command -v npm >/dev/null || { echo "✗ npm not found"; exit 1; }
echo "✓ Dependencies OK"
echo ""

# Setup git
echo "2. Configuring git..."
git config --global url."https://github.com/".insteadOf git://github.com/ 2>/dev/null || true
echo "✓ Git configured"
echo ""

# Initialize submodules (optional)
echo "3. Submodules:"
echo "   Run: make setup <domain>"
echo "   Example: make setup frontend"
echo ""

# Setup plugin
echo "4. Setting up plugin..."
make plugin-setup
echo ""

echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "  make domains               List available domains"
echo "  make setup <domain>        Setup domain submodules"
echo "  make plugin-build          Build plugin"
echo ""
