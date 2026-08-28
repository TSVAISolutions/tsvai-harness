# Brain-Wiki

Intelligent knowledge management system for TSVAI agents.

## Purpose

Brain-Wiki is a sophisticated knowledge base that enables:
- **Learning & Recall** - Store facts with metadata and retrieve with context
- **Semantic Search** - Find related concepts using similarity metrics
- **Knowledge Graphs** - Build and traverse relationships between facts
- **Context Enrichment** - Understand reasoning chains and knowledge gaps
- **Agent Integration** - Provide intelligent knowledge to multi-agent systems

## Architecture

### Core Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| knowledge-store.js | 350 | Storage, versioning, relationships |
| semantic-search.js | 280 | Similarity-based retrieval |
| context-enricher.js | 320 | Context building and reasoning |
| brain-wiki.js | 220 | Unified interface |

### Data Model

```
Entry (Fact/Knowledge)
├── Metadata (type, source, tags, confidence)
├── Versions (full history)
├── Relationships (to other entries)
└── Access tracking (count, timestamps)

Relationship
├── Source & Target
├── Type (related, supports, contradicts, extends)
└── Metadata
```

## Quick Start

```javascript
const BrainWiki = require('./src/brain-wiki');
const wiki = new BrainWiki();

// Learn
const fact = wiki.learn('Python is a programming language', {
  type: 'technology',
  tags: ['python', 'programming'],
  confidence: 0.95
});

// Recall
const recalled = wiki.recall(fact.id);

// Search
const results = wiki.search_knowledge('programming');

// Ask
const answer = wiki.ask('What is Python?');
```

## Features

### Learning
- Add facts with metadata
- Track sources and confidence
- Automatic versioning
- Tag-based organization

### Search
- **Text Search** - Find by keyword
- **Semantic Search** - Find by similarity
- **Filter** - By type, source, tags, confidence
- **Related** - Discover connections

### Knowledge Graph
- Create relationships between facts
- Traverse up to N levels deep
- Multiple relationship types
- Cycle detection

### Analysis
- Explain concepts
- Analyze topic coverage
- Find knowledge gaps
- Build reasoning chains

### Management
- Import/Export knowledge
- Full statistics
- Health monitoring
- Bounded storage (auto-cleanup)

## Usage Examples

### Store Knowledge

```javascript
// Simple fact
wiki.learn('The Earth orbits the Sun', {
  type: 'astronomy',
  source: 'NASA',
  tags: ['earth', 'sun'],
  confidence: 1.0
});

// Complex knowledge
wiki.learn(
  'Machine learning uses algorithms to learn from data',
  {
    type: 'definition',
    source: 'research-paper',
    tags: ['ml', 'ai', 'algorithms'],
    confidence: 0.95,
    references: ['arxiv:2024.001', 'paper:ml-fundamentals']
  }
);
```

### Retrieve Knowledge

```javascript
// By ID
const entry = wiki.recall(entryId);

// By search
const results = wiki.search_knowledge('artificial intelligence');

// By type
const technologies = wiki.getByType('technology');

// By source
const facts = wiki.getBySource('Wikipedia');

// By tag
const python = wiki.getByTag('python');
```

### Relationships

```javascript
// Relate facts
wiki.relate(pythonId, mlId, 'used_for');
wiki.relate(mlId, aiId, 'subset_of');

// Get related
const related = wiki.getRelated(entryId);

// Find similar
const similar = wiki.findSimilar(entryId, limit = 10);
```

### Analysis

```javascript
// Ask questions
const answer = wiki.ask('What is machine learning?');
// Returns: explanation, gaps, confidence

// Analyze topic
const analysis = wiki.analyzeTopic('AI trends');
// Returns: coverage, sources, gaps

// Build reasoning
const chain = wiki.buildChain(entryId, depth = 3);
// Shows logical sequence
```

## Integration

### With Army-Agents

```javascript
// Agents can learn from operations
orchestrator.on('workflow:complete', (execution) => {
  if (execution.successful) {
    wiki.learn(`Successful pattern: ${execution.pattern}`);
  }
});

// Agents can query knowledge
async function findBestApproach(goal) {
  const results = wiki.search_knowledge(goal);
  return results.results[0]?.content;
}
```

### With Plugins

```javascript
// Skills can access knowledge
async function analyzeData(data) {
  const context = wiki.search_knowledge(data.type);
  return analyzeWithContext(data, context);
}
```

## Files

| File | Purpose |
|------|---------|
| src/knowledge-store.js | Core storage & retrieval |
| src/semantic-search.js | Similarity-based search |
| src/context-enricher.js | Context & reasoning |
| src/brain-wiki.js | Unified interface |
| tests/brain-wiki.test.js | 60+ test cases |
| docs/BRAIN_WIKI_GUIDE.md | Complete guide |

## Statistics

- **Lines:** 1,170 core + 470 tests
- **Test Cases:** 60+
- **Coverage:** >90%
- **Storage:** 50,000 entries (configurable)
- **Relationships:** 100,000 (configurable)

## Performance

| Operation | Complexity |
|-----------|-----------|
| Add/Retrieve | O(1) |
| Search (text) | O(n) |
| Search (indexed) | O(log n) |
| Get Related | O(d) where d = depth |
| Export/Import | O(n) |

## Configuration

```javascript
const wiki = new BrainWiki({
  store: {
    maxEntries: 50000,
    maxRelationships: 100000
  },
  search: {
    similarityThreshold: 0.5,
    maxResults: 100
  },
  enricher: {
    maxContext: 10,
    maxRelationships: 5,
    maxSimilar: 3
  }
});
```

## API Reference

### Learning
- `learn(content, metadata)` - Add knowledge
- `update(id, newContent, metadata)` - Update
- `forget(id)` - Delete

### Retrieval
- `recall(id)` - Get with context
- `remember(id)` - Basic retrieval
- `search_knowledge(query, options)` - Search
- `getByType(type)` - Filter by type
- `getBySource(source)` - Filter by source
- `getByTag(tag)` - Filter by tag

### Relationships
- `relate(sourceId, targetId, type)` - Create link
- `getRelated(id, type, depth)` - Get linked entries
- `findSimilar(id, limit)` - Find similar

### Analysis
- `ask(question)` - Get answer with gaps
- `explain(concept)` - Explain concept
- `analyzeTopic(topic)` - Analyze coverage
- `buildChain(entryId, depth)` - Reasoning chain
- `getSummary(id)` - Entry summary

### Administration
- `getStatistics()` - Stats
- `export()` - Export knowledge
- `import(data)` - Import knowledge
- `clear()` - Clear all
- `getHealth()` - Health status

## Best Practices

1. **Set confidence** - Higher for verified, lower for inferred
2. **Use tags** - Multiple tags improve discoverability
3. **Add sources** - Track knowledge provenance
4. **Build graph** - Create relationships for reasoning
5. **Keep current** - Update outdated information
6. **Analyze gaps** - Use gap analysis to guide learning
7. **Backup regularly** - Export periodically
8. **Monitor health** - Check coverage and quality

## Next: Phase 6 - Consilient Engine

After Brain-Wiki, the consilient component will:
- Mine consensus patterns from observations
- Resolve conflicts between divergent facts
- Validate decision coherence
- Integrate with ConsensusEngine for multi-agent decisions

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Lines of Code:** 1,170 core + 470 tests + 500 docs  
**Test Coverage:** >90%  
**Last Updated:** 2026-08-28
