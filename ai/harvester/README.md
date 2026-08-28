# Harvester

Data collection and ingestion pipeline for TSVAI.

## Purpose

Harvester enables:
- **Multi-Source Collection** - Collect from APIs, databases, files
- **Format Normalization** - Convert between JSON, CSV, XML, etc.
- **Deduplication** - Detect and remove duplicate entries
- **Pipeline Orchestration** - Define and execute complex data workflows

## Quick Start

```javascript
const Harvester = require('./src/harvester');
const harvester = new Harvester();

// Define pipeline
const pipelineId = harvester.definePipeline('ingest', {
  sources: [
    { name: 'api-source', type: 'api', endpoint: '...' },
    { name: 'db-source', type: 'database' }
  ],
  normalizeFormat: 'json',
  deduplicate: true,
  validate: true
}).pipelineId;

// Execute pipeline
const result = await harvester.executePipeline(pipelineId);

// Get statistics
const stats = harvester.getStatistics();
```

## Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| data-collector.js | 280 | Multi-source collection |
| data-normalizer.js | 260 | Format conversion & deduplication |
| harvester.js | 220 | Pipeline orchestration |

## Statistics

- **Total Lines:** 760 core + 480 tests
- **Test Cases:** 40+
- **Coverage:** >90%

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** 2026-08-28
