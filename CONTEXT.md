# TSVAI Harness — Shared Vocabulary

Terminology and definitions for TSVAI core systems and operations.

## AI & Agent Systems

**Claude Agent**:
An autonomous Claude instance operating within TSVAI with defined scope, permissions, and responsibilities.
_Variants_: Coder (builds features), Reviewer (audits changes), Orchestrator (coordinates work)

**Army Agent** (`ai/army-agents/`):
Coordinated multi-agent system for distributed parallel task execution.
_Related_: Agent pool, task distribution, coordination protocols

**Brain Wiki** (`ai/brain-wiki/`):
Central knowledge repository synthesized from operational patterns, learned insights, and organizational memory.
_Related_: Knowledge graph, pattern library, decision records

**Consilient Engine** (`ai/consilient/`):
System that achieves consensus across agents through coherence checking and conflict resolution.
_Avoid_: Consensus layer (too generic), voting system (too simplistic)

## Data & Intelligence

**Curator** (`ai/curator/`):
Content filtering and organization system that evaluates, ranks, and distributes information.
_Variants_: Product curator, technical curator, insight curator
_Avoid_: Content manager (too broad)

**Harvester** (`ai/harvester/`):
System for systematically collecting data from multiple sources and normalizing it.
_Related_: Ingestion, aggregation, data pipeline
_Avoid_: Scraper (too specific), collector (too generic)

**VI Dashboard** (`ai/vi-dashboard/`):
Visual Intelligence interface providing real-time monitoring of TSVAI operations.
_Displays_: Agent status, task progress, system health, insights
_Avoid_: Dashboard (too generic), admin panel (implies control, not insight)

## Plugin System

**Plugin** (`ai/plugin/`):
Modular extension to TSVAI providing specialized capabilities, exposed as Claude skills.
_Examples_: Text analysis, security scanning, data processing
_Structure_: .claude-plugin/, src/, skills/, bin/, scripts/

**Skill** (`ai/plugin/skills/`):
Named capability within a plugin, callable by Claude with defined inputs/outputs.
_Examples_: analytics, text-analysis, data-processing, reporting

**Plugin Template** (`ai/plugin-templates/`):
Reusable scaffold for creating new plugins following TSVAI patterns.

**CLI Wrapper** (`ai/plugin/bin/tsvai`):
Command-line interface entry point with fallback logic for CLI binary resolution.

## Development & Coordination

**Domain**:
Logical grouping of related submodules (e.g., platform, frontend, backend).
_Defined in_: Makefile (DOMAIN_* variables)
_Used in_: `make setup domain`, `make update domain`

**Submodule**:
Git repository embedded in tsvai-harness under `submodules/` (lazy-checked-out).
_Locations_: submodules/frontend/, submodules/backend/, submodules/platform/

**Lazy Checkout**:
Submodule is listed in .gitmodules but not downloaded until explicitly initialized.
_Benefit_: Faster clones, optional component loading
_Managed by_: `make setup <service>`

**AGENTS.md**:
Live multi-agent coordination table. Records who is working where and when.
_Auto-cleanup_: Entries >24h old automatically removed
_Required_: Agents must register before starting work

## Architecture & Deployment

**Composable Rules** (`.claude/rules/`):
Layered configuration system with precedence: global → baseline → consilient → overrides.
_Global_: Apply to all contexts
_Baseline_: Foundational defaults
_Consilient_: Mined patterns from operations
_Overrides_: Context-specific exceptions

**MCP Server**:
Model Context Protocol server exposing TSVAI tools and resources to Claude.
_Definition_: `.mcp.json` at root
_Tools_: Plugin operations, agent coordination, context access

**Terraform Cloud**:
Infrastructure-as-code deployment system for TSVAI platform components.
_Reference_: context/deployments/ai-subcook-platform-deployment.md

## Quality & Operations

**Code Review**:
Automated inspection of changes for correctness, security, and pattern compliance.
_Levels_: Low (fast), medium (balanced), high/ultra (comprehensive)

**CI/CD**:
Automated build, test, and deployment workflows via GitHub Actions.
_Key workflows_: build-plugin.yml, cleanup-agents.yml

**Health Check**:
Periodic validation of system state, agent health, and operational readiness.

---

**Last Updated**: 2026-08-25  
**Maintained by**: TSVAI DevOps Team
