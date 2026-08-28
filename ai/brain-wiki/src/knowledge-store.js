/**
 * Knowledge Store
 * Core knowledge storage and retrieval system
 * Manages persistent storage of facts, relationships, and metadata
 */

class KnowledgeStore {
  constructor(config = {}) {
    this.config = {
      maxEntries: config.maxEntries || 50000,
      maxRelationships: config.maxRelationships || 100000,
      ...config
    };

    this.entries = new Map(); // id -> entry
    this.relationships = new Map(); // sourceId -> [targets]
    this.metadata = new Map(); // id -> metadata
    this.entryCounter = 0;
    this.relationshipCounter = 0;
    this.createdAt = Date.now();
  }

  /**
   * Store a knowledge entry
   */
  addEntry(content, metadata = {}) {
    const id = this._generateId();

    const entry = {
      id,
      content,
      metadata: {
        ...metadata,
        type: metadata.type || 'fact',
        source: metadata.source || 'unknown',
        tags: metadata.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confidence: metadata.confidence || 1.0,
        references: metadata.references || []
      },
      relationships: [],
      versions: [{ version: 1, content, timestamp: new Date().toISOString() }]
    };

    this.entries.set(id, entry);
    this.metadata.set(id, entry.metadata);

    // Keep bounded
    if (this.entries.size > this.config.maxEntries) {
      const oldestId = Array.from(this.entries.values())
        .sort((a, b) => new Date(a.metadata.createdAt) - new Date(b.metadata.createdAt))[0].id;
      this.entries.delete(oldestId);
      this.metadata.delete(oldestId);
    }

    return { success: true, id, entry };
  }

  /**
   * Retrieve an entry
   */
  getEntry(id) {
    const entry = this.entries.get(id);

    if (!entry) {
      return null;
    }

    // Track access
    entry.metadata.lastAccessedAt = new Date().toISOString();
    entry.metadata.accessCount = (entry.metadata.accessCount || 0) + 1;

    return entry;
  }

  /**
   * Update an entry
   */
  updateEntry(id, newContent, metadata = {}) {
    const entry = this.entries.get(id);

    if (!entry) {
      return { success: false, error: `Entry not found: ${id}` };
    }

    // Keep version history
    entry.versions.push({
      version: entry.versions.length + 1,
      content: newContent,
      timestamp: new Date().toISOString(),
      previousContent: entry.content
    });

    entry.content = newContent;
    entry.metadata.updatedAt = new Date().toISOString();

    // Update metadata if provided
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...metadata };
    }

    return { success: true, id, version: entry.versions.length };
  }

  /**
   * Delete an entry
   */
  deleteEntry(id) {
    if (!this.entries.has(id)) {
      return { success: false, error: `Entry not found: ${id}` };
    }

    // Remove relationships
    this.relationships.delete(id);
    for (const targets of this.relationships.values()) {
      const idx = targets.indexOf(id);
      if (idx !== -1) {
        targets.splice(idx, 1);
      }
    }

    this.entries.delete(id);
    this.metadata.delete(id);

    return { success: true, id };
  }

  /**
   * Create a relationship between entries
   */
  addRelationship(sourceId, targetId, type = 'related', metadata = {}) {
    const source = this.entries.get(sourceId);
    const target = this.entries.get(targetId);

    if (!source || !target) {
      return { success: false, error: 'Source or target entry not found' };
    }

    if (!this.relationships.has(sourceId)) {
      this.relationships.set(sourceId, []);
    }

    const relationship = {
      id: `rel-${++this.relationshipCounter}`,
      sourceId,
      targetId,
      type,
      metadata,
      createdAt: new Date().toISOString()
    };

    this.relationships.get(sourceId).push(relationship);

    // Track in entry
    source.relationships.push(relationship.id);

    // Keep bounded
    if (this.relationshipCounter > this.config.maxRelationships) {
      this.relationshipCounter = 0;
    }

    return { success: true, relationshipId: relationship.id };
  }

  /**
   * Get related entries
   */
  getRelated(id, type = null, depth = 1) {
    const entry = this.entries.get(id);

    if (!entry) {
      return [];
    }

    const related = [];
    const visited = new Set([id]);

    const traverse = (currentId, currentDepth) => {
      if (currentDepth > depth) return;

      const rels = this.relationships.get(currentId) || [];

      rels.forEach(rel => {
        if (type && rel.type !== type) return;

        if (!visited.has(rel.targetId)) {
          visited.add(rel.targetId);
          const target = this.entries.get(rel.targetId);

          if (target) {
            related.push({
              id: rel.targetId,
              content: target.content,
              metadata: target.metadata,
              relationshipType: rel.type,
              depth: currentDepth
            });

            if (currentDepth < depth) {
              traverse(rel.targetId, currentDepth + 1);
            }
          }
        }
      });
    };

    traverse(id, 1);

    return related;
  }

  /**
   * Search entries
   */
  search(query, options = {}) {
    const {
      type = null,
      source = null,
      tags = [],
      minConfidence = 0,
      limit = 100
    } = options;

    let results = Array.from(this.entries.values());

    // Filter by type
    if (type) {
      results = results.filter(e => e.metadata.type === type);
    }

    // Filter by source
    if (source) {
      results = results.filter(e => e.metadata.source === source);
    }

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter(e =>
        tags.some(tag => e.metadata.tags.includes(tag))
      );
    }

    // Filter by confidence
    results = results.filter(e => e.metadata.confidence >= minConfidence);

    // Search content
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(e =>
        e.content.toLowerCase().includes(queryLower) ||
        (e.metadata.tags && e.metadata.tags.some(t => t.toLowerCase().includes(queryLower)))
      );
    }

    // Sort by relevance and access count
    results.sort((a, b) => {
      const scoreA = (a.metadata.accessCount || 0) + (a.metadata.confidence || 0);
      const scoreB = (b.metadata.accessCount || 0) + (b.metadata.confidence || 0);
      return scoreB - scoreA;
    });

    return results.slice(0, limit).map(e => ({
      id: e.id,
      content: e.content,
      metadata: e.metadata,
      relationshipCount: e.relationships.length
    }));
  }

  /**
   * Get entries by tag
   */
  getByTag(tag) {
    return Array.from(this.entries.values())
      .filter(e => e.metadata.tags.includes(tag))
      .map(e => ({
        id: e.id,
        content: e.content,
        metadata: e.metadata
      }));
  }

  /**
   * Get entries by source
   */
  getBySource(source) {
    return Array.from(this.entries.values())
      .filter(e => e.metadata.source === source)
      .map(e => ({
        id: e.id,
        content: e.content,
        metadata: e.metadata
      }));
  }

  /**
   * Get entries by type
   */
  getByType(type) {
    return Array.from(this.entries.values())
      .filter(e => e.metadata.type === type)
      .map(e => ({
        id: e.id,
        content: e.content,
        metadata: e.metadata
      }));
  }

  /**
   * Get knowledge graph statistics
   */
  getStatistics() {
    const allEntries = Array.from(this.entries.values());

    const byType = {};
    const bySource = {};
    const byTag = {};
    let totalRelationships = 0;

    allEntries.forEach(entry => {
      byType[entry.metadata.type] = (byType[entry.metadata.type] || 0) + 1;
      bySource[entry.metadata.source] = (bySource[entry.metadata.source] || 0) + 1;
      totalRelationships += entry.relationships.length;

      entry.metadata.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
    });

    const confidences = allEntries.map(e => e.metadata.confidence);

    return {
      totalEntries: allEntries.length,
      totalRelationships,
      byType,
      bySource,
      byTag,
      averageConfidence: confidences.length > 0
        ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
        : 0,
      memoryUsage: {
        entries: allEntries.length,
        relationships: this.relationships.size,
        uptime: Date.now() - this.createdAt
      }
    };
  }

  /**
   * Export knowledge graph
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      entries: Array.from(this.entries.values()),
      relationships: Object.fromEntries(this.relationships),
      statistics: this.getStatistics()
    };
  }

  /**
   * Import knowledge graph
   */
  import(data) {
    if (data.entries && Array.isArray(data.entries)) {
      data.entries.forEach(entry => {
        this.entries.set(entry.id, entry);
        this.metadata.set(entry.id, entry.metadata);
      });
    }

    if (data.relationships && typeof data.relationships === 'object') {
      for (const [sourceId, rels] of Object.entries(data.relationships)) {
        this.relationships.set(sourceId, rels);
      }
    }

    return { success: true, imported: data.entries?.length || 0 };
  }

  /**
   * Clear all knowledge
   */
  clear() {
    const count = this.entries.size;
    this.entries.clear();
    this.relationships.clear();
    this.metadata.clear();

    return { success: true, clearedCount: count };
  }

  // ============ Private Methods ============

  _generateId() {
    return `entry-${Date.now()}-${++this.entryCounter}`;
  }
}

module.exports = KnowledgeStore;
