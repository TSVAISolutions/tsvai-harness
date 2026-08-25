# Claude Rules & Configuration

Composable rule layers for Claude agents and operations in TSVAI.

## Structure

### global/
Global rules that apply to all contexts and operations across TSVAI.

### baseline/
Baseline rules that establish foundational behavior patterns.

### consilient/
Mined consilient rulesets - extracted from observed patterns across agents and operations. Rules that achieve consensus and coherence.

### overrides/
Context-specific overrides that take precedence over global/baseline rules for specific operational contexts.

## Usage

Rules are loaded in order:
1. `global/` - Applied first
2. `baseline/` - Applied second
3. `consilient/` - Applied third
4. `overrides/` - Applied last (highest priority)

Later rules override earlier ones for conflicting directives.

## Contributing

Add new rules in appropriate subdirectory with clear naming:
- `global/` - `service-xyz-guidelines.md`
- `baseline/` - `default-validation-rules.md`
- `consilient/` - `mined-coordination-patterns.md`
- `overrides/` - `env-production-overrides.md`

---

**Maintained by:** TSVAI DevOps Team
