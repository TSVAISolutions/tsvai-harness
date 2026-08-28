/**
 * Brain-Wiki
 * Central knowledge management system
 * Unified interface for knowledge storage, search, and enrichment
 */

const KnowledgeStore = require('./knowledge-store');
const SemanticSearch = require('./semantic-search');
const ContextEnricher = require('./context-enricher');

class BrainWiki {
  constructor(config = {}) {
    this.config = config;

    // Initialize components
    this.knowledge = new KnowledgeStore(config.store || {});
    this.search = new SemanticSearch(this.knowledge, config.search || {});
    this.enricher = new ContextEnricher(this.knowledge, this.search, config.enricher || {});

    this.initialized = true;
    this.createdAt = Date.now();
  }

  /**
   * Learn a fact (add to knowledge base)
   */
  learn(content, metadata = {}) {
    const result = this.knowledge.addEntry(content, metadata);

    if (result.success) {
      // Index for semantic search
      this.search.indexEntry(result.entry);
    }

    return result;
  }

  /**
   * Recall knowledge (retrieve by ID)
   */
  recall(id) {
    const entry = this.knowledge.getEntry(id);

    if (!entry) {
      return null;
    }

    return this.enricher.enrichEntry(id);
  }

  /**
   * Remember a fact
   */
  remember(id) {
    return this.knowledge.getEntry(id);
  }

  /**
   * Forget knowledge (delete)
   */
  forget(id) {
    return this.knowledge.deleteEntry(id);
  }

  /**
   * Search knowledge base
   */
  search_knowledge(query, options = {}) {
    // Try semantic search first
    const semanticResults = this.search.search(query, 20);

    if (semanticResults.length > 0) {
      return {
        found: true,
        method: 'semantic',
        results: this.enricher.enrichResults(semanticResults.slice(0, options.limit || 10))
      };
    }

    // Fallback to structured search
    const structuredResults = this.knowledge.search(query, options);

    return {
      found: structuredResults.length > 0,
      method: 'structured',
      results: this.enricher.enrichResults(structuredResults)
    };
  }

  /**
   * Ask a question
   */
  ask(question) {
    const explanation = this.enricher.explainConcept(question);
    const gaps = this.enricher.findGaps(question);

    return {
      question,
      explanation,
      gaps,
      confidence: explanation.found
        ? Math.round((explanation.confidence || 0) * 100) / 100
        : 0
    };
  }

  /**
   * Get related concepts
   */
  getRelated(id, type = null, depth = 1) {
    return this.knowledge.getRelated(id, type, depth);
  }

  /**
   * Relate two facts
   */
  relate(sourceId, targetId, type = 'related', metadata = {}) {
    return this.knowledge.addRelationship(sourceId, targetId, type, metadata);
  }

  /**
   * Find similar knowledge
   */
  findSimilar(id, limit = 10) {
    return this.search.findSimilar(id, limit);
  }

  /**
   * Build reasoning chain
   */
  buildChain(entryId, depth = 3) {
    return this.enricher.buildReasoningChain(entryId, depth);
  }

  /**
   * Explain concept
   */
  explain(concept) {
    return this.enricher.explainConcept(concept);
  }

  /**
   * Analyze topic coverage
   */
  analyzeTopic(topic) {
    return this.enricher.findGaps(topic);
  }

  /**
   * Get knowledge by type
   */
  getByType(type) {
    return this.knowledge.getByType(type);
  }

  /**
   * Get knowledge by source
   */
  getBySource(source) {
    return this.knowledge.getBySource(source);
  }

  /**
   * Get knowledge by tag
   */
  getByTag(tag) {
    return this.knowledge.getByTag(tag);
  }

  /**
   * Update knowledge
   */
  update(id, newContent, metadata = {}) {
    return this.knowledge.updateEntry(id, newContent, metadata);
  }

  /**
   * Get knowledge statistics
   */
  getStatistics() {
    const knowledgeStats = this.knowledge.getStatistics();
    const searchStats = this.search.getStatistics();

    return {
      knowledge: knowledgeStats,
      search: searchStats,
      indexCoverage: Math.round((searchStats.totalReferences / knowledgeStats.totalEntries) * 100) / 100,
      uptime: Date.now() - this.createdAt
    };
  }

  /**
   * Get summary
   */
  getSummary(id) {
    return this.enricher.getSummary(id, true);
  }

  /**
   * Export knowledge base
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      data: this.knowledge.export(),
      statistics: this.getStatistics()
    };
  }

  /**
   * Import knowledge base
   */
  import(data) {
    const result = this.knowledge.import(data.data || data);

    if (result.success) {
      // Rebuild search index
      this.search.rebuildIndex();
    }

    return result;
  }

  /**
   * Clear all knowledge
   */
  clear() {
    return this.knowledge.clear();
  }

  /**
   * Health check
   */
  getHealth() {
    const stats = this.getStatistics();

    return {
      status: stats.knowledge.totalEntries > 0 ? 'healthy' : 'empty',
      uptime: stats.uptime,
      totalKnowledge: stats.knowledge.totalEntries,
      indexed: stats.searchStats?.totalReferences || 0,
      indexCoverage: stats.indexCoverage,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BrainWiki;
