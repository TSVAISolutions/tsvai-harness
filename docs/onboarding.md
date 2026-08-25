# TSVAI Harness Onboarding

Welcome to the TSVAI Harness! This guide gets you started with development and feature delivery.

## Quick Start

### 1. Clone the Repository
```bash
git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness
```

### 2. Register Yourself (MANDATORY)
Edit `AGENTS.md` and add yourself to the table:
```
| claude-yourname | ai/plugin | initial setup | 2026-08-25T10:00:00Z | 2026-08-25T10:05:00Z |
```

### 3. Setup a Domain
```bash
make setup frontend    # Clone frontend submodules
make setup backend     # Clone backend submodules
make setup platform    # Clone platform submodules
```

Or setup all:
```bash
make setup all
```

### 4. Build the Plugin
```bash
make plugin-setup      # Download CLI and dependencies
make plugin-build      # Build for Claude Code
```

## Making Changes

### Before You Start
1. Check `AGENTS.md` - who's already working?
2. Add yourself: domain, task, timestamp
3. Commit and push immediately

### While Working
- Update `AGENTS.md` if you switch areas
- Commit frequently with clear messages
- Reference the area in commit messages

### When Done
- Remove your row from `AGENTS.md`
- Commit and push
- Create PR if needed

## Key Commands

```bash
make help              # Show all targets
make domains           # List available domains
make setup <domain>    # Clone domain submodules
make update <domain>   # Pull latest changes
make status <domain>   # Show submodule status
make clear <domain>    # Remove submodule working tree

make plugin-setup      # Setup plugin environment
make plugin-build      # Build plugin for Claude Code
```

## File Structure

- `ai/` - AI layer (plugins, skills, tools)
- `submodules/` - TSVAI Solutions repositories
- `context/` - Architecture & reference docs
- `.claude/rules/` - Composable rule layers
- `CLAUDE.md` - Coordination guide
- `AGENTS.md` - Agent tracking
- `CONTEXT.md` - Shared vocabulary
- `Makefile` - Development targets

## Coordination Rules

1. **Always check AGENTS.md first** - avoid stepping on toes
2. **Register immediately** - add yourself before touching code
3. **Update frequently** - if switching areas, update the table
4. **Clear vocabulary** - use terms from CONTEXT.md
5. **Commit messages** - reference area and domain

## Getting Help

- **Documentation**: Read CLAUDE.md for detailed coordination
- **Vocabulary**: Check CONTEXT.md for shared terminology
- **Plugin Dev**: See ai/plugin/CLAUDE.md
- **Architecture**: See context/deployments/ for flow docs

## Common Tasks

### Add a New Submodule
```bash
cd submodules/
git submodule add https://github.com/TSVAISolutions/new-repo.git new-repo
git add .gitmodules new-repo
git commit -m "feat: add new-repo submodule"
```

### Update All Submodules
```bash
git submodule update --remote --merge
git add submodules
git commit -m "chore: update submodules"
```

### Test a Plugin Locally
```bash
cd ai/plugin
npm test
npm run lint
```

## Next Steps

1. ✅ Clone the repo
2. ✅ Setup a domain: `make setup <domain>`
3. ✅ Build plugin: `make plugin-build`
4. ✅ Read CLAUDE.md for coordination patterns
5. ✅ Start coding!

---

**Welcome to TSVAI! Happy coding.** 🚀
