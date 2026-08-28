/**
 * Semantic Search
 * Similarity-based search using text similarity metrics
 * Enables finding related concepts and similar entries
 */

class SemanticSearch {
  constructor(knowledgeStore, config = {}) {
    this.knowledgeStore = knowledgeStore;
    this.config = {
      similarityThreshold: config.similarityThreshold || 0.5,
      maxResults: config.maxResults || 100,
      ...config
    };

    this.index = new Map(); // term -> entry IDs
    this.termFrequency = new Map(); // term -> frequency
  }

  /**
   * Index an entry for semantic search
   */
  indexEntry(entry) {
    const terms = this._extractTerms(entry.content);

    terms.forEach(term => {
      if (!this.index.has(term)) {
        this.index.set(term, []);
      }

      if (!this.index.get(term).includes(entry.id)) {
        this.index.get(term).push(entry.id);
      }

      // Track term frequency
      const freq = this.termFrequency.get(term) || 0;
      this.termFrequency.set(term, freq + 1);
    });

    return { success: true, termsIndexed: terms.length };
  }

  /**
   * Search by semantic similarity
   */
  search(query, limit = 50) {
    const queryTerms = this._extractTerms(query);

    if (queryTerms.length === 0) {
      return [];
    }

    // Find entries matching query terms
    const matches = new Map(); // entryId -> score

    queryTerms.forEach(term => {
      const entryIds = this.index.get(term) || [];

      entryIds.forEach(id => {
        matches.set(id, (matches.get(id) || 0) + 1);
      });
    });

    // Calculate similarity scores
    const results = [];

    for (const [entryId, matchCount] of matches.entries()) {
      const entry = this.knowledgeStore.getEntry(entryId);

      if (!entry) continue;

      const similarity = this._calculateSimilarity(query, entry.content);

      if (similarity >= this.config.similarityThreshold) {
        results.push({
          id: entryId,
          content: entry.content,
          metadata: entry.metadata,
          similarity: Math.round(similarity * 100) / 100,
          matchCount
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, limit);
  }

  /**
   * Find similar entries
   */
  findSimilar(entryId, limit = 20) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) {
      return [];
    }

    return this.search(entry.content, limit).filter(r => r.id !== entryId);
  }

  /**
   * Get semantic neighbors
   */
  getNeighbors(entryId, depth = 1) {
    const entry = this.knowledgeStore.getEntry(entryId);

    if (!entry) {
      return [];
    }

    // Get directly related entries
    const neighbors = this.knowledgeStore.getRelated(entryId, null, depth);

    // Score by similarity to source
    neighbors.forEach(neighbor => {
      neighbor.similarity = this._calculateSimilarity(
        entry.content,
        neighbor.content
      );
    });

    return neighbors.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Suggest related concepts
   */
  suggestRelated(query, limit = 10) {
    const results = this.search(query, 50);

    if (results.length === 0) {
      return [];
    }

    // Extract unique tags from top results
    const suggestions = new Map();

    results.slice(0, 10).forEach(result => {
      const tags = result.metadata.tags || [];

      tags.forEach(tag => {
        suggestions.set(tag, (suggestions.get(tag) || 0) + 1);
      });
    });

    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, score]) => ({ tag, relevance: score }));
  }

  /**
   * Rebuild index
   */
  rebuildIndex() {
    this.index.clear();
    this.termFrequency.clear();

    const store = this.knowledgeStore;
    let indexed = 0;

    // Re-index all entries
    const entries = store.export().entries;

    entries.forEach(entry => {
      this.indexEntry(entry);
      indexed++;
    });

    return { success: true, indexed };
  }

  /**
   * Get index statistics
   */
  getStatistics() {
    const terms = Array.from(this.termFrequency.values());

    return {
      totalTerms: this.index.size,
      totalReferences: terms.reduce((a, b) => a + b, 0),
      averageTermFrequency: terms.length > 0
        ? Math.round(terms.reduce((a, b) => a + b, 0) / terms.length)
        : 0,
      mostCommonTerms: Array.from(this.termFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term, freq]) => ({ term, frequency: freq }))
    };
  }

  // ============ Private Methods ============

  _extractTerms(text) {
    // Extract meaningful terms (lowercase, remove special chars)
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^a-z0-9]/g, ''))
      .filter(term => term.length > 0);
  }

  _calculateSimilarity(text1, text2) {
    const terms1 = new Set(this._extractTerms(text1));
    const terms2 = new Set(this._extractTerms(text2));

    if (terms1.size === 0 || terms2.size === 0) {
      return 0;
    }

    // Jaccard similarity
    const intersection = new Set([...terms1].filter(x => terms2.has(x)));
    const union = new Set([...terms1, ...terms2]);

    return intersection.size / union.size;
  }

  _levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

module.exports = SemanticSearch;
