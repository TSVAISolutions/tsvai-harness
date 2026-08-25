# TSVAI Harness

Monorepo aggregating all TSVAI Solutions repositories as submodules + AI packages and plugins.

## Agent Registration (MANDATORY)

Before doing ANY work in this repo, you MUST:

### Starting Work
1. Read [AGENTS.md](./AGENTS.md) to check who else is working and where
2. Add yourself to the table with your area and task
3. Commit and push AGENTS.md

### While Working
- Update your row in AGENTS.md when you switch areas or tasks
- Read AGENTS.md before touching shared files to avoid conflicts
- Commit AGENTS.md frequently (at least every significant change)

### When Done
1. Remove your row from AGENTS.md
2. Commit and push

### Format

```
| <your-id> | <area> | <short task description> | <ISO timestamp> | <ISO timestamp> |
```

### Example

```
| claude-haiku-1 | ai/plugin | updating skills | 2026-08-25T10:00:00Z | 2026-08-25T10:30:00Z |
```

### Conflict Resolution

If you see a conflict with another agent working in the same area - coordinate or wait.

## Repository Structure

```
tsvai-harness/
├── ai/                          # AI tools (NOT submodules - actual packages)
│   ├── cli/                     # CLI submodule (TSVAISolutions/cli)
│   ├── ai-security/             # TSVAI security scanner submodule
│   ├── plugin/                  # Core plugin (skills, CLAUDE.md, build scripts)
│   └── marketplace/             # Claude marketplace submodule
│
├── submodules/                  # All TSVAISolutions repos (submodules)
│   ├── frontend/                # Frontend applications
│   ├── backend/                 # Backend services
│   └── platform/                # Platform infrastructure
│
├── context/                     # Architecture docs and deployment flows
│   └── deployments/
│       ├── ai-subcook-platform-deployment.md
│       └── ...
│
├── AGENTS.md                    # Active agent tracking (READ FIRST!)
├── CLAUDE.md                    # This file
├── README.md                    # Main documentation
└── .gitmodules                  # Submodule configuration
```

## Submodules

### Working with Submodules

Always update submodules when working here:

```bash
git submodule update --remote
```

Commit any pointer changes. Push directly to main - no branches, no PRs.

### Submodule Locations

**Frontend Repos** (`submodules/frontend/`)
- `pms-frontend/` - PMS frontend application
- `admin-dashboard/` - Admin dashboard

**Backend Repos** (`submodules/backend/`)
- `pms-backend/` - PMS backend service

**Platform Repos** (`submodules/platform/`)
- `pms-platform/` - Platform infrastructure

### Updating Specific Submodule

```bash
cd submodules/frontend/pms-frontend
git checkout main
git pull origin main
cd ../../..
git add submodules/frontend/pms-frontend
git commit -m "chore: update pms-frontend submodule"
git push
```

## AI Packages

### ai/cli/

TSVAISolutions/cli submodule - TSVAI command-line interface

```bash
cd ai/cli
git pull origin main
```

### ai/ai-security/

TSVAI security scanner submodule for vulnerability scanning

### ai/plugin/

Core TSVAI plugin with:
- Text analysis capabilities
- Claude skills definitions
- MCP configuration
- Build scripts for distribution

**Structure:**
```
ai/plugin/
├── .claude-plugin/
│   └── plugin.json            # Plugin manifest
├── src/                        # Plugin source code
├── bin/
│   └── tsvai                  # CLI wrapper
├── scripts/
│   ├── setup.sh               # Environment setup
│   ├── build-plugin.sh        # Build plugin
│   └── build-claude-code.sh   # Build for Claude Code
├── skills/                    # Claude skills
├── .mcp.json                  # MCP configuration
├── CLAUDE.md                  # Integration guide
├── CONNECTORS.md              # Connector documentation
└── package.json               # Minimal package config
```

### ai/marketplace/

TSVAI Claude Marketplace submodule for plugin distribution and discovery

## Plugin Builds

### Prerequisites

```bash
cd ai/plugin
bash scripts/setup.sh          # Download tsvai CLI, install deps
```

### Build for Distribution

```bash
bash ai/plugin/scripts/build-plugin.sh       # Create zip archive
bash ai/plugin/scripts/build-claude-code.sh  # Build for Claude Code
```

### Build via npm

```bash
npm run pack:plugin            # Build plugin archive
npm run pack:claude-code       # Build for Claude Code
```

### How It Works

1. Plugins download `tsvai.mjs` from the CLI repo's GitHub release
2. Build scripts stage plugin files
3. Creates distributable zip archive
4. Uploads to CLI release repository

## CLI Integration

The plugin CLI wrapper (`ai/plugin/bin/tsvai`) looks for the CLI binary in 3 locations:

1. **Installed mode**: `bin/tsvai.mjs` (distributed in ZIP)
2. **Dev fallback**: `.tsvai.mjs` (cached in plugin directory)
3. **Submodule fallback**: `ai/cli/packages/cli/dist-standalone/tsvai.mjs` (development)

## Context Documentation

Architecture docs and deployment guides live in `context/`.

### Key Documents

- **context/README.md** - Documentation index
- **context/deployments/ai-subcook-platform-deployment.md** - AI-SubCook deployment flow with Terraform Cloud
- **context/docs/ARCHITECTURE.md** - Plugin architecture guide

### Adding Context

1. Create document in `context/` or subdirectory
2. Update `context/README.md` with link
3. Use clear structure with sections and examples

## GitHub Actions

### build-plugin.yml

Triggered on changes to `ai/plugin/**`

**Jobs:**
- `build` - Creates `tsvai-plugin.zip`
- `build-dev` - Creates `tsvai-dev-plugin.zip` (marked as [DEV])

Both jobs:
1. Download CLI from TSVAISolutions/cli release
2. Stage plugin files
3. Create zip archive
4. Upload to CLI release repository

## Common Tasks

### Add a New Submodule

```bash
cd submodules/backend
git submodule add https://github.com/TSVAISolutions/new-repo.git
cd ..
git add .gitmodules new-repo
git commit -m "feat: add new-repo submodule"
git push
```

### Update All Submodules

```bash
git submodule update --remote --merge
git add submodules
git commit -m "chore: update submodules"
git push
```

### Build Plugin Locally

```bash
cd ai/plugin
bash scripts/setup.sh                 # Setup environment
bash scripts/build-claude-code.sh     # Build for Claude
```

### Test Plugin

```bash
cd ai/plugin
npm test                              # Run tests
npm run lint                          # Lint code
```

## Best Practices

1. **Always check AGENTS.md first** - Know who's working where
2. **Update AGENTS.md frequently** - Especially on shared areas
3. **Small commits** - Easier to track and revert if needed
4. **Descriptive messages** - Reference area in commit messages
5. **Communicate** - If conflict with another agent, coordinate
6. **Keep submodules updated** - Regular syncs with remote
7. **Test before pushing** - Build and test locally first

## Troubleshooting

### Submodule Issues

**Submodule not updating:**
```bash
git submodule update --remote --merge
```

**Submodule branch incorrect:**
```bash
cd submodules/frontend/pms-frontend
git checkout main
cd ../../..
git add submodules/frontend/pms-frontend
git commit -m "chore: sync pms-frontend to main"
```

### Plugin Build Issues

**CLI not found:**
```bash
cd ai/plugin
bash scripts/setup.sh  # Download CLI
```

**Build script fails:**
```bash
cd ai/plugin
npm install            # Ensure dependencies
bash scripts/build-plugin.sh
```

## Support

- **Issues**: Report in GitHub Issues
- **Coordination**: Check and update AGENTS.md
- **Architecture**: See context/ documentation
- **Plugin Help**: See ai/plugin/CLAUDE.md

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-25  
**Maintained by**: TSVAI DevOps Team
