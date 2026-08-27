# TSVAI CLI Usage Guide

Complete guide to using the TSVAI CLI for platform operations and AI agent integration.

## Installation

### Global Install
```bash
npm install -g @tsvaisolutions/core-cli

# Verify installation
tsvai --version
```

### Development Install (from source)
```bash
git clone https://github.com/TSVAISolutions/cli.git
cd cli
bun install
bun run dev -- --help
```

---

## Authentication

### Login (Cookie Mode - Recommended)
```bash
# Interactive login
tsvai login -e test -p app

# Non-interactive (env vars)
export TSVAI_EMAIL=user@example.com
export TSVAI_PASSWORD=yourpassword
tsvai login -e test -p app
```

### Verify Login
```bash
tsvai whoami
# Output: Logged in as user@example.com on test environment
```

### Logout
```bash
tsvai logout
```

### Switch Environment
```bash
tsvai switch prod
tsvai switch uat
tsvai switch dev
```

---

## Core Commands

### 1. User Management

```bash
# List all users
tsvai users list

# Get specific user
tsvai users get <user-id>

# Create new user
tsvai users create --email newuser@example.com --name "New User"

# Update user
tsvai users update <user-id> --name "Updated Name"
```

### 2. Resources

```bash
# List all resources
tsvai resources list

# Get specific resource
tsvai resources get <resource-id>

# Search resources
tsvai resources search --query "platform"
```

### 3. Analytics

```bash
# View platform events
tsvai analytics events

# View metrics
tsvai analytics metrics

# View logs
tsvai analytics logs --filter "error"
```

### 4. Data Management

```bash
# Export data
tsvai data export --resource users --format json

# Import data
tsvai data import --file data.json

# Sync data
tsvai data sync --source prod --target staging
```

### 5. Admin Operations

```bash
# Check platform status
tsvai admin status

# View configuration
tsvai admin config

# Manage admin users
tsvai admin users
```

### 6. Testing

```bash
# Health check
tsvai test health

# Test endpoints
tsvai test endpoints

# Test authentication
tsvai test auth
```

### 7. Raw API Access

```bash
# GET request
tsvai api get /users

# POST request
tsvai api post /users --data '{"name":"John","email":"john@example.com"}'

# PUT request
tsvai api put /users/123 --data '{"name":"Jane"}'

# DELETE request
tsvai api delete /users/123
```

---

## Configuration

### View Config
```bash
tsvai config
```

### Set Config Values
```bash
tsvai config set environment prod
tsvai config set timeout 30
tsvai config set format json
```

### Reset Config
```bash
tsvai config reset
```

---

## Claude Code Plugin

### Install Plugin
```bash
# Automatic installation
./scripts/install-claude-code.sh

# Or use gh CLI
bash <(gh api -H "Accept:application/vnd.github.raw+json" /repos/tsvaisolutions/core-cli/contents/scripts/install-claude-code.sh)
```

### Use Slash Commands

In Claude Code, use `/tsvai:` commands:

```
/tsvai:help              # Show all commands
/tsvai:status            # Platform status
/tsvai:users             # Browse users
/tsvai:resources         # Explore resources
/tsvai:analytics         # View analytics
/tsvai:logs              # View platform logs
/tsvai:health            # Check health
/tsvai:admin             # Admin operations
/tsvai:export            # Export data
```

---

## Usage Examples

### Example 1: User Onboarding

```bash
# 1. Login
tsvai login -e test -p app

# 2. Create new user
tsvai users create \
  --email john@example.com \
  --name "John Doe" \
  --role user

# 3. Verify user created
tsvai users get john@example.com

# 4. Export user list
tsvai data export --resource users --format csv > users.csv
```

### Example 2: Platform Health Check

```bash
# Check platform status
tsvai admin status

# Run tests
tsvai test health
tsvai test endpoints
tsvai test auth

# View recent errors
tsvai analytics logs --filter "error" --limit 10
```

### Example 3: Data Export and Analysis

```bash
# Export all users
tsvai data export --resource users --format json > users.json

# Export all resources
tsvai data export --resource resources --format json > resources.json

# View analytics
tsvai analytics metrics

# Check logs
tsvai analytics logs --tail 50
```

### Example 4: API Integration

```bash
# Get user by ID
tsvai api get /users/user123

# Create resource
tsvai api post /resources \
  --data '{"name":"my-resource","type":"data"}'

# Update resource
tsvai api put /resources/res456 \
  --data '{"name":"updated-resource"}'

# Delete resource
tsvai api delete /resources/res456
```

---

## Environment Variables

### Available Variables

```bash
# Credentials
TSVAI_EMAIL=user@example.com
TSVAI_PASSWORD=yourpassword

# Environment
TSVAI_ENV=test|uat|prod

# CLI Config
TSVAI_FORMAT=json|table|csv
TSVAI_TIMEOUT=30
TSVAI_DEBUG=true|false
```

### Usage

```bash
export TSVAI_EMAIL=user@example.com
export TSVAI_PASSWORD=secret
export TSVAI_ENV=prod

tsvai whoami
# No interactive prompt, uses env vars
```

---

## Output Formats

### JSON Output
```bash
tsvai users list --format json
```

### Table Output
```bash
tsvai users list --format table
```

### CSV Output
```bash
tsvai users list --format csv
```

### Raw Output
```bash
tsvai api get /users --raw
```

---

## Common Tasks

### Task 1: List All Users
```bash
tsvai users list --limit 100
```

### Task 2: Export User Data
```bash
tsvai data export --resource users --format json --output users.json
```

### Task 3: Check System Health
```bash
tsvai test health
tsvai admin status
```

### Task 4: Query Platform APIs
```bash
# List resources
tsvai api get /resources

# Create resource
tsvai api post /resources --data '{"name":"new-resource"}'

# Filter results
tsvai api get /resources?filter=active
```

### Task 5: Monitor Logs
```bash
# View recent logs
tsvai analytics logs --tail 100

# Filter by level
tsvai analytics logs --filter "error"

# Filter by time
tsvai analytics logs --since "1 hour ago"
```

---

## Troubleshooting

### Login Issues

```bash
# Clear cached credentials
rm ~/.tsvai/config.json

# Re-login
tsvai login -e test -p app

# Verify connection
tsvai test auth
```

### Connection Issues

```bash
# Check platform health
tsvai test health

# Check endpoint connectivity
tsvai test endpoints

# View error logs
tsvai analytics logs --filter "error"
```

### Configuration Issues

```bash
# View current config
tsvai config

# Reset to defaults
tsvai config reset

# Set specific values
tsvai config set timeout 60
```

---

## Tips & Tricks

### 1. Alias Frequently Used Commands

```bash
# Add to ~/.bashrc or ~/.zshrc
alias tsvai-status='tsvai admin status && tsvai test health'
alias tsvai-export-users='tsvai data export --resource users --format json'
alias tsvai-logs='tsvai analytics logs --tail 50'
```

### 2. Batch Operations

```bash
# Export multiple resources
for resource in users resources data; do
  tsvai data export --resource $resource --format json > ${resource}.json
done
```

### 3. Parse JSON Output

```bash
# Get specific field
tsvai users list --format json | jq '.users[0].email'

# Filter results
tsvai api get /users --format json | jq '.users[] | select(.status=="active")'
```

### 4. Error Handling in Scripts

```bash
#!/bin/bash
set -e  # Exit on error

# Login
tsvai login -e prod -p app || { echo "Login failed"; exit 1; }

# Export data
tsvai data export --resource users --format json || { echo "Export failed"; exit 1; }

echo "Success!"
```

---

## Getting Help

### Built-in Help
```bash
# General help
tsvai --help

# Command-specific help
tsvai users --help
tsvai api --help
tsvai admin --help
```

### Documentation
```bash
tsvai docs
```

### Version Info
```bash
tsvai --version
tsvai version
```

---

## Security Best Practices

### 1. Environment Variables
- ✅ Use `TSVAI_EMAIL` and `TSVAI_PASSWORD` for non-interactive logins
- ✅ Store credentials in `.env` files (add to `.gitignore`)
- ❌ Never hardcode credentials in scripts

### 2. API Tokens
```bash
# Generate token
tsvai config set token <your-token>

# Use token auth
tsvai api get /users --auth token
```

### 3. Sensitive Data
```bash
# Export data securely
tsvai data export --resource users --format json --encrypt

# Use secure storage
export TSVAI_CONFIG_DIR=~/.tsvai-secure
```

---

## Next Steps

1. **Install CLI:** `npm install -g @tsvaisolutions/core-cli`
2. **Login:** `tsvai login -e test -p app`
3. **Explore:** `tsvai --help`
4. **Install Plugin:** `./scripts/install-claude-code.sh`
5. **Start Using:** Use `/tsvai:` commands in Claude Code

---

**Happy using TSVAI CLI!** 🚀

For more help: `tsvai docs` or `tsvai --help`
