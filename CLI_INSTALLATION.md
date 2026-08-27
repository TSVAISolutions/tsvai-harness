# TSVAI CLI - Installation Guide

Complete guide to installing and running the TSVAI CLI for development and usage.

## Why `npm install -g` Doesn't Work

The CLI package is **private** and not published to public npm. It's only available in your private GitHub Packages registry or built locally from source.

---

## Installation Methods

### 1. **Development Install (Recommended for Dev Work)**

Build and run from source in the harness:

```bash
cd /Users/kbuchepalli/tsvai-harness/ai/cli

# Install dependencies
bun install

# Run CLI without building
bun run --filter '@tsvaisolutions/core-cli' dev -- --help

# Or run any command
bun run --filter '@tsvaisolutions/core-cli' dev -- users list
bun run --filter '@tsvaisolutions/core-cli' dev -- login -e test -p app
```

**Alias it for convenience:**

```bash
# Add to ~/.zshrc or ~/.bashrc
alias tsvai='bun run --filter @tsvaisolutions/core-cli --cwd /Users/kbuchepalli/tsvai-harness/ai/cli dev --'

# Now use it anywhere
tsvai --help
tsvai users list
tsvai login -e test -p app
```

---

### 2. **Build Standalone (Production Use)**

Create a standalone CLI binary:

```bash
cd /Users/kbuchepalli/tsvai-harness/ai/cli

# Build standalone CLI
bun run build:standalone

# Output: packages/cli/dist/tsvai.mjs (5-6 MB)

# Run it
node packages/cli/dist/tsvai.mjs --help
node packages/cli/dist/tsvai.mjs users list
```

**Copy to PATH:**

```bash
# Make it globally available
cp packages/cli/dist/tsvai.mjs /usr/local/bin/tsvai
chmod +x /usr/local/bin/tsvai

# Now use it everywhere
tsvai --help
```

---

### 3. **GitHub Release Install (Future)**

Once the CLI is released on GitHub:

```bash
# Download from GitHub release
gh release download cli-v1.105.0 \
  --repo TSVAISolutions/cli \
  --pattern "tsvai.mjs"

# Run it
node tsvai.mjs --help

# Or move to PATH
mv tsvai.mjs /usr/local/bin/tsvai
chmod +x /usr/local/bin/tsvai
```

---

### 4. **Claude Code Plugin (Easiest for Users)**

Install the plugin which bundles the CLI:

```bash
# From the CLI repo
cd /Users/kbuchepalli/tsvai-harness/ai/cli
./scripts/install-claude-code.sh

# Or without cloning
bash <(gh api -H "Accept:application/vnd.github.raw+json" /repos/TSVAISolutions/cli/contents/scripts/install-claude-code.sh)
```

Then use in Claude Code:

```
/tsvai:help
/tsvai:users
/tsvai:resources
```

---

## Build Steps Explained

### Full Build

```bash
cd ai/cli

# 1. Install dependencies
bun install

# 2. Build both packages
bun run build
#   ├─ packages/cli/dist/index.js
#   └─ packages/mcp-core/dist/index.js

# 3. Run tests
bun run test

# 4. Typecheck
bun run typecheck

# 5. Lint
bun run lint
```

### Standalone Build

```bash
# Creates packages/cli/dist/tsvai.mjs (~5-6 MB)
# This is the distributable CLI binary
bun run build:standalone
```

**What happens:**
1. Compiles CLI TypeScript → JavaScript
2. Bundles all dependencies into one file
3. Adds shebang (#!) to make it executable
4. Result: one `.mjs` file with no external dependencies

---

## Environment Variables

Set these before running the CLI:

```bash
# For login
export TSVAI_EMAIL=user@example.com
export TSVAI_PASSWORD=yourpassword
export TSVAI_ENVIRONMENT=test  # test, uat, prod

# For logging/debugging
export TSVAI_DEBUG=true

# For output format
export TSVAI_FORMAT=json  # json, table, csv
```

---

## Quick Commands

```bash
# Development mode
bun run --filter '@tsvaisolutions/core-cli' dev -- <command>

# Build for distribution
bun run build:standalone

# Test it
bun run test

# Type check
bun run typecheck

# Lint
bun run lint
```

---

## Directory Structure

```
ai/cli/
├── packages/
│   ├── cli/               # Main CLI package
│   │   ├── src/
│   │   │   ├── commands/  # Command implementations
│   │   │   ├── lib/       # Shared libraries (auth, api, config)
│   │   │   └── index.ts   # Entry point
│   │   ├── dist/          # Build output
│   │   │   └── tsvai.mjs  # Standalone binary (after build)
│   │   └── package.json   # CLI version
│   │
│   └── mcp-core/          # Shared MCP infrastructure
│       ├── src/
│       ├── dist/
│       └── package.json
│
├── scripts/
│   ├── build-plugin.sh         # Build Claude Code plugin
│   ├── install-claude-code.sh  # Install plugin
│   └── sync-versions.js        # Sync versions across package.json
│
├── bun.lock               # Lock file (Bun)
├── package.json           # Root workspace config
├── .releaserc.json        # semantic-release config
└── CLAUDE.md              # Developer guide (this repo)
```

---

## Development Workflow

```bash
# 1. Clone/go to CLI repo
cd /Users/kbuchepalli/tsvai-harness/ai/cli

# 2. Install deps
bun install

# 3. Make changes to src/

# 4. Test your changes
bun run dev -- users list

# 5. Commit with conventional format
git commit -m "feat(cli): add new feature"

# 6. On merge to main:
#    - GitHub Actions runs semantic-release
#    - Version bumps automatically (based on commit type)
#    - Release created on GitHub
#    - Artifacts built and published
```

---

## Troubleshooting

### Issue: `bun: command not found`

**Solution:** Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### Issue: `Cannot find module '@tsvaisolutions/core-cli'`

**Solution:** Install dependencies

```bash
cd ai/cli
bun install
```

### Issue: Standalone build fails

**Solution:** Clean and rebuild

```bash
cd ai/cli
rm -rf packages/cli/dist packages/mcp-core/dist
bun run build:standalone
```

### Issue: Tests fail with auth errors

**Solution:** Mock auth is required. Make sure test files import `mock-auth.ts`:

```typescript
import { mock-auth } from '../__tests__/helpers/mock-auth';  // Required!
```

---

## Next Steps

1. **For development:** Use the alias or `bun run dev --` method
2. **For distribution:** Build standalone with `bun run build:standalone`
3. **For CI/CD:** Releases are automatic via semantic-release on main
4. **For users:** They install the Claude Code plugin or download from releases

---

## Summary

| Method | Use Case | Command |
|--------|----------|---------|
| **Dev mode** | Local testing | `bun run dev -- <cmd>` |
| **Standalone** | Local/CI distribution | `bun run build:standalone` |
| **GitHub release** | Users downloading | `gh release download` |
| **Claude plugin** | AI agent use | `/tsvai:` commands |

---

**That's it!** Choose the method that fits your workflow.

For more details on the CLI itself, see [CLI_USAGE.md](CLI_USAGE.md).
