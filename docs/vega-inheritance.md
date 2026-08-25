# Vega Inheritance & TSVAI Specifics

This document clarifies which components are inherited from the vega harness and which are TSVAI-specific.

## Components Inherited from Vega

### `ai/cli/` (CLI Tool)
- **Source**: `TSVAISolutions/cli` (submodule)
- **Applies to TSVAI**: Yes, but partially
- **What to ignore**:
  - References to `mcp-lp` (LP/Investor portal)
  - References to `mcp-gp` (GP/General Partner portal)
  - Vega-specific commands for portfolio management
  - Fund management commands specific to vega
- **What to use**:
  - Core CLI infrastructure
  - Build and development commands
  - General utility commands

### `ai/cli/` Submodule Content
The CLI submodule contains vega-specific MCP servers and commands:

```
ai/cli/packages/
├── cli/                    # Core CLI (reusable)
├── mcp-core/               # Core MCP (reusable)
├── mcp-lp/                 # LP portal (vega-specific - ignore)
├── mcp-gp/                 # GP portal (vega-specific - ignore)
└── ...
```

**For TSVAI development**:
- Use the CLI for building and development
- Ignore LP/GP portal-specific features
- Focus on core tooling and utilities

## Components TSVAI-Specific

### Core Framework
- ✅ `AGENTS.md` - Agent coordination
- ✅ `CLAUDE.md` - Coordination guide
- ✅ `CONTEXT.md` - TSVAI vocabulary
- ✅ `Makefile` - TSVAI domain management
- ✅ `rules/baseline/` - TSVAI development standards

### AI Layer
- ✅ `ai/plugin/` - TSVAI plugin system
- ✅ `ai/skills/` - TSVAI skills (analytics, text-analysis, etc.)
- ✅ `ai/brain-wiki/` - TSVAI knowledge base
- ✅ `ai/curator/` - TSVAI content curation
- ✅ `ai/consilient/` - TSVAI consensus engine
- ✅ `ai/harvester/` - TSVAI data harvesting

### Documentation
- ✅ `docs/onboarding.md` - TSVAI quick start
- ✅ `context/` - TSVAI architecture docs
- ✅ `rules/` - TSVAI development rules

### Repositories
- ✅ `submodules/frontend/pms-frontend/` - TSVAI frontend
- ✅ `submodules/backend/pms-backend/` - TSVAI backend
- ✅ `submodules/platform/pms-platform/` - TSVAI platform

## What to Do With Vega References

### In `ai/cli/` Files
**Don't edit** these files in the harness - they're from a submodule. If you need to:
1. Work with the CLI team to update the CLI repository
2. Use what applies to TSVAI
3. Ignore vega-specific features

### Examples of Vega-Specific (Ignore)
```
// In ai/cli/CLAUDE.md or other files:

❌ MCP — LP Portal features
❌ MCP — GP Portal features
❌ Fund management commands
❌ Investment portfolio commands
❌ Vega-specific integrations
```

### Examples of TSVAI-Applicable (Use)
```
✅ Core CLI infrastructure
✅ Build commands
✅ Development utilities
✅ MCP core functionality
✅ General tooling
```

## If You Find Vega References

1. **In harness documentation** (CLAUDE.md, CONTEXT.md, docs/):
   - ✅ Update to be TSVAI-specific
   - ✅ Remove vega-only features

2. **In submodules** (ai/cli/, etc.):
   - ⚠️ Don't edit (they're separate repos)
   - 📝 Document what applies to TSVAI
   - 🔗 Link to the actual repo for updates

3. **In TSVAI components** (ai/plugin/, ai/skills/, etc.):
   - ✅ Should be 100% TSVAI-specific
   - ✅ Update if you find vega references

## Summary

| Component | Source | TSVAI-Only? | Actions |
|-----------|--------|------------|----------|
| Harness core | TSVAI | ✅ Yes | Edit freely |
| CLAUDE.md | TSVAI | ✅ Yes | Edit freely |
| CONTEXT.md | TSVAI | ✅ Yes | Edit freely |
| Makefile | TSVAI | ✅ Yes | Edit freely |
| rules/ | TSVAI | ✅ Yes | Edit freely |
| ai/plugin/ | TSVAI | ✅ Yes | Edit freely |
| ai/skills/ | TSVAI | ✅ Yes | Edit freely |
| ai/cli/ | Vega (submodule) | ⚠️ Partial | Use, don't edit |
| submodules/* | TSVAI | ✅ Yes | Edit freely |

---

**When in doubt**: If it's about LP/GP portals, fund management, or investor features → it's vega-specific, ignore for TSVAI.

**Report issues**: If you find vega-specific features affecting TSVAI work, document them here and coordinate with the team.
