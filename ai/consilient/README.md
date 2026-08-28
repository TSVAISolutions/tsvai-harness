# Consilient Engine

Consensus & coherence validation system for TSVAI.

## Purpose

Consilient enables:
- **Pattern Mining** - Discover consensus patterns from repeated successful behaviors
- **Conflict Resolution** - Detect and resolve conflicts between divergent facts/decisions
- **Coherence Validation** - Verify logical consistency and alignment
- **Decision Support** - Guide decisions against learned patterns and rules

## Quick Start

```javascript
const Consilient = require('./src/consilient');
const consilient = new Consilient();

// Record decisions
consilient.recordDecision({
  input: { action: 'create', type: 'user' },
  output: { status: 201 },
  successful: true
});

// Mine patterns
const patterns = consilient.minePatterns();

// Check alignment
const check = consilient.checkDecision({
  input: { action: 'create', type: 'user' },
  output: { status: 201 }
});

// Detect conflicts
consilient.detectConflict(fact1, fact2);

// Validate coherence
const validation = consilient.validateCoherence([item1, item2]);
```

## Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| pattern-miner.js | 280 | Pattern discovery & matching |
| conflict-resolver.js | 310 | Conflict detection & resolution |
| consilient.js | 220 | Unified interface |

## Statistics

- **Total Lines:** 810 core + 520 tests
- **Test Cases:** 40+
- **Coverage:** >90%

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-08-28
