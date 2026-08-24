#!/bin/bash

# Build all plugins for Claude Code integration
# This script builds plugins and prepares them for distribution

echo "Building TSVAI plugins for Claude Code..."

# Build each plugin
for plugin_dir in */; do
    if [ -f "$plugin_dir/package.json" ]; then
        echo "Building $plugin_dir..."
        bash scripts/build-plugin.sh "$plugin_dir"
    fi
done

echo "✓ All plugins built successfully"
