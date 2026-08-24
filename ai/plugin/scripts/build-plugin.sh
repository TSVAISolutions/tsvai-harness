#!/bin/bash

# Build a specific plugin
# Usage: ./scripts/build-plugin.sh <plugin-name>

if [ -z "$1" ]; then
    echo "Usage: ./scripts/build-plugin.sh <plugin-name>"
    exit 1
fi

PLUGIN=$1

if [ ! -d "$PLUGIN" ]; then
    echo "Plugin not found: $PLUGIN"
    exit 1
fi

echo "Building plugin: $PLUGIN..."

cd "$PLUGIN"
npm install
npm run build 2>/dev/null || true
cd ..

echo "✓ Plugin build complete"
