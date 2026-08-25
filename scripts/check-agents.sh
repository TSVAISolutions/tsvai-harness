#!/bin/bash
# Check AGENTS.md for active entries

echo "Active agents:"
grep -E '^\|[^-]' AGENTS.md | grep -v "Agent" | tail -n +2 || echo "No active agents"
