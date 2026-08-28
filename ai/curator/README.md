# Curator

Content curation and quality control system for TSVAI.

## Purpose

Curator enables:
- **Quality Validation** - Check completeness, consistency, accuracy, relevance
- **Content Filtering** - Detect and remove spam, noise, policy violations
- **Classification** - Tag and categorize content for organization
- **Curation Pipeline** - Integrated validation, filtering, and classification

## Quick Start

```javascript
const Curator = require('./src/curator');
const curator = new Curator();

// Curate content
const result = curator.curate('High quality content here', {
  validate: true,
  filter: true,
  classify: true
});

console.log(result.accepted);  // true/false
console.log(result.score);     // 0-1

// Register custom rules
curator.registerRule('minLength', (c) => c.length > 10);

// Block terms
curator.blockTerms(['spam', 'inappropriate']);

// Get statistics
const stats = curator.getStatistics();
```

## Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| quality-validator.js | 290 | Quality validation across dimensions |
| filter-engine.js | 380 | Spam/noise/policy filtering |
| content-classifier.js | 320 | Content categorization & tagging |
| curator.js | 210 | Unified curation pipeline |

## Statistics

- **Total Lines:** 1,200 core + 480 tests
- **Test Cases:** 50+
- **Coverage:** >90%

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-08-28
