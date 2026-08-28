# Brain-Wiki Guide

Complete knowledge management system for TSVAI agents.

## Overview

Brain-Wiki provides intelligent knowledge storage, retrieval, and enrichment:
- **Learn & Recall** - Store and retrieve facts with metadata
- **Semantic Search** - Find related concepts and similar facts
- **Context Enrichment** - Understand relationships and build reasoning chains
- **Knowledge Graph** - Navigate connections between concepts

## Quick Start

```javascript
const BrainWiki = require('./src/brain-wiki');
const wiki = new BrainWiki();

// Learn a fact
const fact = wiki.learn('Python is a programming language', {
  type: 'technology',
  source: 'documentation',
  tags: ['programming', 'python'],
  confidence: 0.95
});

// Recall the fact
const recalled = wiki.recall(fact.id);

// Search for related knowledge
const results = wiki.search_knowledge('programming languages');

// Ask questions
const answer = wiki.ask('What is Python?');
```

## Core Components

### 1. KnowledgeStore

Storage and retrieval of facts with versioning and relationships.

```javascript
const KnowledgeStore = require('./src/knowledge-store');
const store = new KnowledgeStore();

// Add entry
const result = store.addEntry('Paris is in France', {
  type: 'geography',
  source: 'atlas',
  tags: ['europe', 'france'],
  confidence: 1.0
});

// Retrieve
const entry = store.getEntry(result.id);

// Update with history
store.updateEntry(result.id, 'Paris is the capital of France');

// Create relationships
store.addRelationship(parisId, franceId, 'capital_of');

// Search
const results = store.search('France', {
  type: 'geography',
  minConfidence: 0.8
});

// Statistics
const stats = store.getStatistics();
```

### 2. SemanticSearch

Similarity-based search using text analysis.

```javascript
const SemanticSearch = require('./src/semantic-search');
const search = new SemanticSearch(store);

// Index entry
search.indexEntry(entry);

// Search by similarity
const results = search.search('machine learning');
// Results include similarity scores (0-1)

// Find similar
const similar = search.findSimilar(entryId, limit = 10);

// Suggest related concepts
const suggestions = search.suggestRelated('AI', limit = 5);

// Statistics
const stats = search.getStatistics();
```

### 3. ContextEnricher

Add context and reasoning to knowledge.

```javascript
const ContextEnricher = require('./src/context-enricher');
const enricher = new ContextEnricher(store, search);

// Enrich entry with context
const enriched = enricher.enrichEntry(entryId);
// {
//   entry,
//   context: [...related facts],
//   relationships: [...connections],
//   similarEntries: [...semantically similar],
//   relatedConcepts: [...],
//   metadata: {...}
// }

// Explain concept
const explanation = enricher.explainConcept('Python');
// {
//   found: true,
//   definition: '...',
//   tags: [...],
//   related: [...similar concepts],
//   references: [...]
// }

// Analyze coverage
const analysis = enricher.findGaps('machine learning');
// {
//   coverage: 25,
//   averageConfidence: 0.87,
//   typeCoverage: {...},
//   sourceCoverage: {...},
//   gaps: ['Recommendations for missing knowledge']
// }

// Build reasoning chain
const chain = enricher.buildReasoningChain(entryId, depth = 3);
```

## BrainWiki API

### Learning

```javascript
// Add knowledge
const result = wiki.learn(content, metadata);

// Learn from multiple sources
wiki.learn('Fact 1', { source: 'Wikipedia', type: 'fact' });
wiki.learn('Fact 2', { source: 'Research Paper', type: 'research' });

// Update
wiki.update(id, newContent, { updatedReason: 'Clarification' });

// Forget
wiki.forget(id);
```

### Retrieval

```javascript
// Recall by ID
const fact = wiki.recall(id);
// Includes context, relationships, similar entries

// Remember (basic retrieval)
const entry = wiki.remember(id);

// Search
const results = wiki.search_knowledge('query', { limit: 20 });

// Get by type/source/tag
wiki.getByType('technology');
wiki.getBySource('wikipedia');
wiki.getByTag('python');
```

### Relationships

```javascript
// Relate facts
wiki.relate(sourceId, targetId, 'related');
wiki.relate(sourceId, targetId, 'supports');
wiki.relate(sourceId, targetId, 'contradicts');

// Get related
const related = wiki.getRelated(id, type = null, depth = 1);

// Find similar
const similar = wiki.findSimilar(id, limit = 10);
```

### Analysis

```javascript
// Ask questions
const answer = wiki.ask('What is artificial intelligence?');
// {
//   question,
//   explanation: { found, definition, confidence, related, references },
//   gaps: { coverage, averageConfidence, gaps },
//   confidence: 0-1
// }

// Explain concept
const explanation = wiki.explain('machine learning');

// Analyze topic
const analysis = wiki.analyzeTopic('AI trends');

// Build reasoning
const chain = wiki.buildChain(entryId, depth = 3);
```

### Administration

```javascript
// Statistics
const stats = wiki.getStatistics();
// { knowledge, search, indexCoverage, uptime }

// Summary
const summary = wiki.getSummary(id);

// Export
const exported = wiki.export();

// Import
wiki.import(exported);

// Clear
wiki.clear();

// Health
const health = wiki.getHealth();
// { status, uptime, totalKnowledge, indexed, indexCoverage }
```

## Data Structure

### Entry

```javascript
{
  id: 'entry-...',
  content: 'Fact or knowledge content',
  metadata: {
    type: 'fact|definition|research|...',
    source: 'source-name',
    tags: ['tag1', 'tag2'],
    confidence: 0.0-1.0,
    references: ['url1', 'url2'],
    createdAt: '2026-08-28T...',
    updatedAt: '2026-08-28T...',
    accessCount: 5,
    lastAccessedAt: '2026-08-28T...'
  },
  relationships: ['rel-id-1', 'rel-id-2'],
  versions: [
    { version: 1, content: '...', timestamp: '...' },
    { version: 2, content: '...', timestamp: '...' }
  ]
}
```

### Relationship

```javascript
{
  id: 'rel-...',
  sourceId: 'entry-...',
  targetId: 'entry-...',
  type: 'related|supports|contradicts|extends|...',
  metadata: { ... },
  createdAt: '2026-08-28T...'
}
```

## Examples

### Building a Knowledge Base

```javascript
const wiki = new BrainWiki();

// Learn facts
const python = wiki.learn(
  'Python is a high-level programming language',
  {
    type: 'technology',
    source: 'official-docs',
    tags: ['programming', 'python', 'language'],
    confidence: 1.0
  }
);

const ml = wiki.learn(
  'Machine Learning is a subset of AI',
  {
    type: 'definition',
    source: 'research',
    tags: ['ai', 'ml'],
    confidence: 0.95
  }
);

// Relate them
wiki.relate(python.id, ml.id, 'used_for');

// Search
const search = wiki.search_knowledge('machine learning');

// Explain
const explanation = wiki.explain('machine learning');
```

### Using with Agents

```javascript
// Agent asks knowledge base
async function handleQuery(agent, query) {
  // Ask brain-wiki
  const answer = wiki.ask(query);

  if (answer.confidence > 0.8) {
    // Use retrieved knowledge
    return answer.explanation.definition;
  } else if (answer.gaps.gaps.length > 0) {
    // Request new knowledge from agent
    return agent.research(answer.gaps);
  }
}
```

### Reasoning Chains

```javascript
// Learn logical sequence
const c1 = wiki.learn('If A then B', { type: 'rule' }).id;
const c2 = wiki.learn('If B then C', { type: 'rule' }).id;
const c3 = wiki.learn('A is true', { type: 'fact' }).id;

// Relate in sequence
wiki.relate(c1, c2, 'supports');
wiki.relate(c3, c1, 'enables');

// Build chain
const chain = wiki.buildChain(c3);
// Shows A → B → C reasoning
```

### Integration with Army-Agents

```javascript
// Brain-Wiki provides knowledge to agents
const knowledgeBase = new BrainWiki();

// Agents can learn from successful operations
armyAgents.on('workflow:complete', (execution) => {
  if (execution.successful) {
    knowledgeBase.learn(
      `Workflow ${execution.workflowId} succeeded with pattern ${execution.pattern}`,
      {
        type: 'pattern',
        source: 'agent-learning',
        tags: [execution.workflowId, 'success'],
        confidence: 0.9
      }
    );
  }
});

// Agents can query for patterns
async function findBestPattern(goal) {
  const results = knowledgeBase.search_knowledge(`Pattern for ${goal}`);
  return results.results[0];
}
```

## Best Practices

1. **Set confidence levels** - Higher for verified facts, lower for inferences
2. **Tag comprehensively** - Multiple tags enable better discovery
3. **Include sources** - Track where knowledge comes from
4. **Relate concepts** - Build knowledge graph for reasoning
5. **Update regularly** - Keep information current
6. **Analyze gaps** - Use gap analysis to guide learning
7. **Export periodically** - Backup knowledge base
8. **Monitor health** - Track index coverage and quality

## Performance

- **Lookup:** O(1) for ID-based retrieval
- **Search:** O(n) for text search, O(log n) for indexed terms
- **Relationships:** O(d) where d = relationship depth
- **Storage:** Bounded at 50,000 entries (configurable)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Low search results | Increase similarity threshold or add more tags |
| Poor relevance | Add relationships between related concepts |
| High memory usage | Reduce maxEntries or clear old facts |
| Missing context | Build relationships and update metadata |

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

---

**Version:** 1.0.0  
**Status:** Production-Ready  
**Last Updated:** 2026-08-28
