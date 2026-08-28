/**
 * Context Enricher
 * Enriches knowledge with contextual information
 * Adds related facts, references, and reasoning chains
 */

class ContextEnricher {
  constructor(knowledgeStore, semanticSearch, config = {}) {
    this.knowledgeStore = knowledgeStore;
    this.semanticSearch = semanticSearch;
    this.config = {
      maxContext: config.maxContext || 10,
      maxRelationships: config.maxRelationships || 5,
      maxSimilar: config.maxSimilar || 3,
      ...config
    };
  }

  /**
   * Enrich a knowledge entry with context
   */
  enrichEntry(entryId) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) {
      return null;
    }

    return {
      entry,
      context: this._buildContext(entryId),
      relationships: this._getRelationships(entryId),
      similarEntries: this.semanticSearch.findSimilar(entryId, this.config.maxSimilar),
      relatedConcepts: this._extractConcepts(entry),
      metadata: this._enrichMetadata(entry)
    };
  }

  /**
   * Enrich search results
   */
  enrichResults(results) {
    return results.map(result => ({
      ...result,
      relatedEntries: this._findRelatedInResults(result.id, results),
      suggestedTags: this._suggestAdditionalTags(result),
      confidence: this._calculateConfidence(result)
    }));
  }

  /**
   * Build reasoning chain for a fact
   */
  buildReasoningChain(entryId, depth = 3) {
    const chain = [];
    const visited = new Set();

    const traverse = (id, currentDepth, reasoning = []) => {
      if (currentDepth === 0 || visited.has(id)) return;

      visited.add(id);
      const entry = this.knowledgeStore.getEntry(id);

      if (!entry) return;

      chain.push({
        entry: {
          id: entry.id,
          content: entry.content,
          type: entry.metadata.type
        },
        depth: depth - currentDepth + 1,
        reasoning
      });

      // Get supporting facts
      const related = this.knowledgeStore.getRelated(id, 'supports', 1);

      related.forEach(rel => {
        traverse(rel.id, currentDepth - 1, [...reasoning, id]);
      });
    };

    traverse(entryId, depth);

    return chain;
  }

  /**
   * Get contextual summary
   */
  getSummary(entryId, includeRelationships = true) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) {
      return null;
    }

    const summary = {
      id: entry.id,
      content: entry.content,
      type: entry.metadata.type,
      source: entry.metadata.source,
      confidence: entry.metadata.confidence,
      tags: entry.metadata.tags,
      versions: entry.versions.length
    };

    if (includeRelationships) {
      summary.relatedCount = entry.relationships.length;
      summary.related = this.knowledgeStore.getRelated(entryId, null, 1).slice(0, 5);
    }

    return summary;
  }

  /**
   * Explain a concept
   */
  explainConcept(concept) {
    const results = this.semanticSearch.search(concept, 10);

    if (results.length === 0) {
      return {
        concept,
        found: false,
        suggestions: this.semanticSearch.suggestRelated(concept, 5)
      };
    }

    const primary = results[0];

    return {
      concept,
      found: true,
      definition: primary.content,
      source: primary.metadata.source,
      type: primary.metadata.type,
      confidence: primary.metadata.confidence,
      tags: primary.metadata.tags,
      related: results.slice(1, 5).map(r => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity
      })),
      references: primary.metadata.references || []
    };
  }

  /**
   * Find knowledge gaps
   */
  findGaps(topic) {
    const results = this.semanticSearch.search(topic, 20);

    if (results.length === 0) {
      return {
        topic,
        found: false,
        confidence: 0,
        gaps: ['No knowledge found for this topic'],
        suggestions: this.semanticSearch.suggestRelated(topic, 10)
      };
    }

    // Analyze coverage
    const types = {};
    const sources = {};

    results.forEach(r => {
      types[r.metadata.type] = (types[r.metadata.type] || 0) + 1;
      sources[r.metadata.source] = (sources[r.metadata.source] || 0) + 1;
    });

    const gaps = [];

    if (Object.keys(types).length < 3) {
      gaps.push(`Limited perspective coverage (only ${Object.keys(types).length} types)`);
    }

    if (Object.keys(sources).length < 2) {
      gaps.push('Information from limited sources - consider diversifying');
    }

    if (results.some(r => r.metadata.confidence < 0.7)) {
      gaps.push('Some information has lower confidence - verify with sources');
    }

    return {
      topic,
      found: true,
      coverage: results.length,
      averageConfidence: Math.round((results.reduce((sum, r) => sum + r.metadata.confidence, 0) / results.length) * 100) / 100,
      typeCoverage: types,
      sourceCoverage: sources,
      gaps: gaps.length > 0 ? gaps : ['Knowledge appears complete'],
      topResults: results.slice(0, 5)
    };
  }

  // ============ Private Methods ============

  _buildContext(entryId) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) return [];

    const context = [];

    // Add directly related entries
    const related = this.knowledgeStore.getRelated(entryId, null, 1);

    related.slice(0, this.config.maxContext).forEach(rel => {
      context.push({
        id: rel.id,
        content: rel.content,
        type: rel.relationshipType,
        depth: rel.depth
      });
    });

    return context;
  }

  _getRelationships(entryId) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) return [];

    const relationships = [];
    const related = this.knowledgeStore.getRelated(entryId, null, 1);

    related.forEach(rel => {
      relationships.push({
        id: rel.id,
        type: rel.relationshipType,
        strength: 'direct'
      });
    });

    return relationships;
  }

  _extractConcepts(entry) {
    const concepts = new Set();

    // Extract from tags
    (entry.metadata.tags || []).forEach(tag => concepts.add(tag));

    // Extract from type
    concepts.add(entry.metadata.type);

    // Extract from content (simple approach)
    const words = entry.content.split(/\s+/);

    words
      .filter(w => w.length > 3)
      .slice(0, 5)
      .forEach(word => concepts.add(word.toLowerCase()));

    return Array.from(concepts);
  }

  _enrichMetadata(entry) {
    return {
      version: entry.versions.length,
      lastModified: entry.metadata.updatedAt,
      accessCount: entry.metadata.accessCount || 0,
      references: entry.metadata.references || [],
      relatedCount: entry.relationships.length
    };
  }

  _findRelatedInResults(entryId, allResults) {
    return allResults
      .filter(r => r.id !== entryId)
      .slice(0, 3)
      .map(r => ({
        id: r.id,
        similarity: r.similarity || r.metadata.confidence
      }));
  }

  _suggestAdditionalTags(result) {
    const suggestions = [];

    if (!result.metadata.tags || result.metadata.tags.length < 3) {
      suggestions.push('Add more tags for better discoverability');
    }

    if (result.metadata.confidence < 0.8) {
      suggestions.push('Consider verifying confidence level');
    }

    if (!result.metadata.source || result.metadata.source === 'unknown') {
      suggestions.push('Add source information');
    }

    return suggestions;
  }

  _calculateConfidence(result) {
    let confidence = result.metadata.confidence || 0.5;

    // Boost confidence based on similarity
    if (result.similarity) {
      confidence = (confidence + result.similarity) / 2;
    }

    // Adjust based on access history
    if (result.metadata.accessCount && result.metadata.accessCount > 5) {
      confidence = Math.min(1, confidence * 1.1);
    }

    return Math.round(confidence * 100) / 100;
  }
}

module.exports = ContextEnricher;
