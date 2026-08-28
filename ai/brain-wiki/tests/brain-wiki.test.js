/**
 * Brain-Wiki Tests
 * Comprehensive tests for knowledge storage, search, and enrichment
 */

const BrainWiki = require('../src/brain-wiki');
const KnowledgeStore = require('../src/knowledge-store');
const SemanticSearch = require('../src/semantic-search');
const ContextEnricher = require('../src/context-enricher');

describe('KnowledgeStore', () => {
  let store;

  beforeEach(() => {
    store = new KnowledgeStore();
  });

  describe('Adding and Retrieving', () => {
    it('adds a knowledge entry', () => {
      const result = store.addEntry('The capital of France is Paris', {
        type: 'fact',
        source: 'geography',
        tags: ['france', 'capital']
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.entry.content).toBe('The capital of France is Paris');
    });

    it('retrieves an entry', () => {
      const add = store.addEntry('Test content', { type: 'fact' });
      const entry = store.getEntry(add.id);

      expect(entry).toBeDefined();
      expect(entry.content).toBe('Test content');
    });

    it('returns null for non-existent entry', () => {
      const entry = store.getEntry('non-existent');

      expect(entry).toBeNull();
    });

    it('tracks access count', () => {
      const add = store.addEntry('Content', { type: 'fact' });
      store.getEntry(add.id);
      store.getEntry(add.id);

      const entry = store.getEntry(add.id);

      expect(entry.metadata.accessCount).toBe(3);
    });
  });

  describe('Updating and Deleting', () => {
    it('updates entry content', () => {
      const add = store.addEntry('Old content', { type: 'fact' });
      store.updateEntry(add.id, 'New content');

      const entry = store.getEntry(add.id);

      expect(entry.content).toBe('New content');
    });

    it('maintains version history', () => {
      const add = store.addEntry('v1', { type: 'fact' });
      store.updateEntry(add.id, 'v2');
      store.updateEntry(add.id, 'v3');

      const entry = store.getEntry(add.id);

      expect(entry.versions.length).toBe(3);
      expect(entry.versions[0].content).toBe('v1');
    });

    it('deletes an entry', () => {
      const add = store.addEntry('Content', { type: 'fact' });
      const result = store.deleteEntry(add.id);

      expect(result.success).toBe(true);
      expect(store.getEntry(add.id)).toBeNull();
    });
  });

  describe('Relationships', () => {
    it('creates relationships', () => {
      const id1 = store.addEntry('Paris', { type: 'location' }).id;
      const id2 = store.addEntry('France', { type: 'country' }).id;

      const result = store.addRelationship(id1, id2, 'located_in');

      expect(result.success).toBe(true);
    });

    it('retrieves related entries', () => {
      const id1 = store.addEntry('Apple', { type: 'company' }).id;
      const id2 = store.addEntry('iPhone', { type: 'product' }).id;
      const id3 = store.addEntry('Tim Cook', { type: 'person' }).id;

      store.addRelationship(id1, id2, 'produces');
      store.addRelationship(id1, id3, 'led_by');

      const related = store.getRelated(id1);

      expect(related.length).toBeGreaterThan(0);
    });

    it('filters by relationship type', () => {
      const id1 = store.addEntry('A', { type: 'fact' }).id;
      const id2 = store.addEntry('B', { type: 'fact' }).id;
      const id3 = store.addEntry('C', { type: 'fact' }).id;

      store.addRelationship(id1, id2, 'supports');
      store.addRelationship(id1, id3, 'contradicts');

      const supports = store.getRelated(id1, 'supports');
      const contradicts = store.getRelated(id1, 'contradicts');

      expect(supports.length).toBe(1);
      expect(contradicts.length).toBe(1);
    });
  });

  describe('Searching', () => {
    beforeEach(() => {
      store.addEntry('Python is a programming language', {
        type: 'technology',
        source: 'wiki',
        tags: ['programming', 'python']
      });
      store.addEntry('Java is also a programming language', {
        type: 'technology',
        source: 'wiki',
        tags: ['programming', 'java']
      });
      store.addEntry('A snake is a reptile', {
        type: 'biology',
        source: 'wiki',
        tags: ['animal', 'python']
      });
    });

    it('searches by text', () => {
      const results = store.search('programming');

      expect(results.length).toBeGreaterThan(0);
    });

    it('filters by type', () => {
      const results = store.search('', { type: 'technology' });

      expect(results.every(r => r.metadata.type === 'technology')).toBe(true);
    });

    it('filters by tags', () => {
      const results = store.search('', { tags: ['python'] });

      expect(results.length).toBeGreaterThan(0);
    });

    it('searches by tag', () => {
      const results = store.getByTag('programming');

      expect(results.length).toBe(2);
    });
  });

  describe('Statistics', () => {
    it('calculates statistics', () => {
      store.addEntry('Fact 1', { type: 'fact', source: 'src1', tags: ['a', 'b'] });
      store.addEntry('Fact 2', { type: 'fact', source: 'src2', tags: ['c'] });

      const stats = store.getStatistics();

      expect(stats.totalEntries).toBe(2);
      expect(stats.byType.fact).toBe(2);
      expect(Object.keys(stats.bySource).length).toBe(2);
    });
  });
});

describe('SemanticSearch', () => {
  let store;
  let search;

  beforeEach(() => {
    store = new KnowledgeStore();
    search = new SemanticSearch(store);
  });

  describe('Indexing and Search', () => {
    beforeEach(() => {
      const e1 = store.addEntry('Machine learning is a subset of artificial intelligence', {
        type: 'concept'
      }).entry;
      const e2 = store.addEntry('Deep learning uses neural networks', {
        type: 'concept'
      }).entry;

      search.indexEntry(e1);
      search.indexEntry(e2);
    });

    it('indexes entries', () => {
      const stats = search.getStatistics();

      expect(stats.totalTerms).toBeGreaterThan(0);
    });

    it('searches semantically', () => {
      const results = search.search('machine learning');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('finds similar entries', () => {
      const allEntries = store.export().entries;
      const id = allEntries[0].id;

      const similar = search.findSimilar(id);

      expect(Array.isArray(similar)).toBe(true);
    });

    it('suggests related concepts', () => {
      const suggestions = search.suggestRelated('machine learning');

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Similarity Calculation', () => {
    it('calculates high similarity for identical text', () => {
      const e1 = store.addEntry('Machine learning', { type: 'concept' }).entry;
      const e2 = store.addEntry('Machine learning', { type: 'concept' }).entry;

      search.indexEntry(e1);
      search.indexEntry(e2);

      const results = search.search('Machine learning', 10);
      const similarity = results[0]?.similarity;

      expect(similarity).toBeGreaterThan(0.5);
    });
  });
});

describe('ContextEnricher', () => {
  let store;
  let search;
  let enricher;

  beforeEach(() => {
    store = new KnowledgeStore();
    search = new SemanticSearch(store);
    enricher = new ContextEnricher(store, search);

    const e1 = store.addEntry('Python is a language', {
      type: 'technology',
      tags: ['programming']
    }).entry;

    search.indexEntry(e1);
  });

  describe('Enrichment', () => {
    it('enriches an entry', () => {
      const allEntries = store.export().entries;
      const enriched = enricher.enrichEntry(allEntries[0].id);

      expect(enriched.entry).toBeDefined();
      expect(enriched.context).toBeDefined();
      expect(enriched.relatedConcepts).toBeDefined();
    });

    it('enriches search results', () => {
      const results = store.search('Python');
      const enriched = enricher.enrichResults(results);

      expect(enriched[0].confidence).toBeDefined();
    });
  });

  describe('Explanation', () => {
    it('explains a concept', () => {
      const explanation = enricher.explainConcept('Python');

      expect(explanation.concept).toBe('Python');
      expect(explanation.found).toBe(true);
    });

    it('analyzes topic coverage', () => {
      const analysis = enricher.findGaps('programming');

      expect(analysis.topic).toBe('programming');
      expect(analysis.gaps).toBeDefined();
    });
  });
});

describe('BrainWiki', () => {
  let wiki;

  beforeEach(() => {
    wiki = new BrainWiki();
  });

  describe('Learning and Recalling', () => {
    it('learns a fact', () => {
      const result = wiki.learn('The Earth orbits the Sun', {
        type: 'astronomy',
        source: 'science',
        tags: ['earth', 'sun', 'orbit']
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });

    it('recalls a fact', () => {
      const learn = wiki.learn('Paris is the capital of France', {
        type: 'geography',
        tags: ['france', 'capital']
      });

      const recalled = wiki.recall(learn.id);

      expect(recalled).toBeDefined();
      expect(recalled.entry.content).toContain('Paris');
    });

    it('forgets a fact', () => {
      const learn = wiki.learn('Temporary fact', { type: 'temp' });
      const result = wiki.forget(learn.id);

      expect(result.success).toBe(true);
      expect(wiki.recall(learn.id)).toBeNull();
    });
  });

  describe('Searching', () => {
    beforeEach(() => {
      wiki.learn('Machine learning uses algorithms', {
        type: 'technology',
        tags: ['ml', 'ai']
      });
      wiki.learn('Deep learning is a subset of ML', {
        type: 'technology',
        tags: ['dl', 'ai']
      });
    });

    it('searches knowledge base', () => {
      const results = wiki.search_knowledge('machine learning');

      expect(results.found).toBe(true);
      expect(results.results.length).toBeGreaterThan(0);
    });

    it('asks questions', () => {
      const answer = wiki.ask('What is machine learning?');

      expect(answer.question).toBe('What is machine learning?');
      expect(answer.explanation).toBeDefined();
    });
  });

  describe('Relationships', () => {
    it('relates facts', () => {
      const id1 = wiki.learn('React is a library', {
        type: 'technology',
        tags: ['javascript']
      }).id;

      const id2 = wiki.learn('Vue is also a library', {
        type: 'technology',
        tags: ['javascript']
      }).id;

      const result = wiki.relate(id1, id2, 'similar');

      expect(result.success).toBe(true);
    });

    it('gets related facts', () => {
      const id1 = wiki.learn('Apple Inc', { type: 'company' }).id;
      const id2 = wiki.learn('iPhone', { type: 'product' }).id;

      wiki.relate(id1, id2, 'produces');

      const related = wiki.getRelated(id1);

      expect(related.length).toBeGreaterThan(0);
    });
  });

  describe('Analysis', () => {
    beforeEach(() => {
      wiki.learn('Python is a language', { type: 'tech', tags: ['python'] });
      wiki.learn('Java is a language', { type: 'tech', tags: ['java'] });
    });

    it('builds reasoning chains', () => {
      const allEntries = wiki.export().data.entries;

      const chain = wiki.buildChain(allEntries[0].id);

      expect(Array.isArray(chain)).toBe(true);
    });

    it('analyzes topics', () => {
      const analysis = wiki.analyzeTopic('programming languages');

      expect(analysis.topic).toBeDefined();
      expect(analysis.gaps).toBeDefined();
    });

    it('gets statistics', () => {
      const stats = wiki.getStatistics();

      expect(stats.knowledge).toBeDefined();
      expect(stats.search).toBeDefined();
    });
  });

  describe('Import/Export', () => {
    it('exports knowledge', () => {
      wiki.learn('Fact 1', { type: 'fact' });

      const exported = wiki.export();

      expect(exported.data).toBeDefined();
      expect(exported.statistics).toBeDefined();
    });

    it('imports knowledge', () => {
      wiki.learn('Original', { type: 'fact' });
      const exported = wiki.export();

      const wiki2 = new BrainWiki();
      wiki2.import(exported);

      expect(wiki2.getStatistics().knowledge.totalEntries).toBe(1);
    });
  });

  describe('Health', () => {
    it('reports health status', () => {
      const health = wiki.getHealth();

      expect(health.status).toBeDefined();
      expect(health.uptime).toBeDefined();
    });

    it('reports empty status when no knowledge', () => {
      const health = wiki.getHealth();

      expect(health.status).toBe('empty');
    });
  });
});

describe('Integration: Full Knowledge Workflow', () => {
  let wiki;

  beforeEach(() => {
    wiki = new BrainWiki();
  });

  it('handles complete knowledge workflow', () => {
    // Learn facts
    const f1 = wiki.learn('Artificial Intelligence is transforming technology', {
      type: 'trend',
      source: 'tech-news',
      tags: ['ai', 'technology'],
      confidence: 0.9
    });

    const f2 = wiki.learn('Machine Learning is a branch of AI', {
      type: 'definition',
      source: 'wikipedia',
      tags: ['ml', 'ai'],
      confidence: 0.95
    });

    // Relate facts
    wiki.relate(f1.id, f2.id, 'related');

    // Search
    const search = wiki.search_knowledge('artificial intelligence');
    expect(search.found).toBe(true);

    // Ask question
    const answer = wiki.ask('What is artificial intelligence?');
    expect(answer.explanation.found).toBe(true);

    // Analyze
    const analysis = wiki.analyzeTopic('artificial intelligence');
    expect(analysis.coverage).toBeGreaterThan(0);

    // Get stats
    const stats = wiki.getStatistics();
    expect(stats.knowledge.totalEntries).toBe(2);
  });
});
