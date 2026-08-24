#!/bin/bash

# TSVAI Plugin Setup Script
# Initialize and setup all plugins

set -e

echo "Setting up TSVAI Plugins..."

# Install dependencies for each plugin
for plugin_dir in */; do
    if [ -f "$plugin_dir/package.json" ]; then
        echo "Installing dependencies for $plugin_dir..."
        cd "$plugin_dir"
        npm install
        cd ..
    fi
done

echo "✓ Plugin setup complete"
