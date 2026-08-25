# TSVAI Harness

Central workspace aggregating all TSVAI Solutions repositories as submodules + AI packages and plugins.

This repository is maintained **for AI agents and developers**. The authoritative entry points are:

- **`CLAUDE.md`** — agent operating instructions, repo structure, and coordination rules
- **`AGENTS.md`** — live multi-agent coordination table (self-pruning, >24h auto-cleanup)
- **`CONTEXT.md`** — shared vocabulary and terminology
- **`docs/onboarding.md`** — quick start guide
- **`Makefile`** — domain management and common targets
- **`rules/baseline/`** — development standards and patterns

## Quick Start

### 1. Clone with Submodules
```bash
git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness
```

### 2. Run Setup
```bash
bash scripts/setup.sh
```

### 3. Get Started
```bash
make domains               # List available domains
make setup frontend        # Clone frontend repos
make help                  # Show all commands
```

## Repository Structure

```
tsvai-harness/
├── ai/                    # AI layer (plugins, skills, tools)
├── submodules/            # TSVAI repos (lazy checkout)
│   ├── frontend/
│   ├── backend/
│   └── platform/
├── context/               # Architecture & reference docs
├── .claude/rules/         # Composable rule layers
├── Makefile               # Development targets
├── CLAUDE.md              # Coordination guide
├── AGENTS.md              # Agent tracking
└── CONTEXT.md             # Shared vocabulary
```

## Key Commands

```bash
make setup <domain>        # Clone domain submodules
make update <domain>       # Pull latest changes
make clear <domain>        # Remove working tree
make status                # Show all repo status
make plugin-setup          # Setup plugin environment
make plugin-build          # Build for Claude Code
make help                  # Show all targets
```

## Coordination

Before starting work:
1. Read `AGENTS.md` to check who else is working
2. Add yourself to the table with your area and task
3. Commit and push `AGENTS.md`
4. Update as you work
5. Remove when done

## Documentation

- **`CLAUDE.md`** — Full coordination guide and architecture
- **`CONTEXT.md`** — Shared vocabulary and terminology
- **`docs/onboarding.md`** — Quick start for new developers
- **`rules/baseline/`** — Development standards for backend, frontend, and code review

## Note: Vega Inheritance

Some components (like `ai/cli/`) are submodules inherited from the vega harness. Features specific to vega platforms (LP/GP portals) do not apply to TSVAI. The CLI is reused for TSVAI operations; vega-specific commands can be ignored.

## Contributing

See `CLAUDE.md` for coordination rules and `docs/onboarding.md` for getting started.
