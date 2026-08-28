/**
 * Conflict Resolver
 * Resolves conflicts between divergent facts, patterns, or decisions
 * Validates coherence and proposes resolutions
 */

class ConflictResolver {
  constructor(config = {}) {
    this.config = {
      resolutionStrategies: config.resolutionStrategies || ['evidence', 'majority', 'recency', 'authority'],
      conflictThreshold: config.conflictThreshold || 0.3,
      ...config
    };

    this.conflicts = new Map();
    this.resolutions = new Map();
    this.conflictCounter = 0;
  }

  /**
   * Detect conflicts between items
   */
  detectConflict(item1, item2, context = {}) {
    const conflictLevel = this._calculateConflict(item1, item2);

    if (conflictLevel < this.config.conflictThreshold) {
      return { conflict: false, conflictLevel: 0 };
    }

    const conflictId = `conflict-${++this.conflictCounter}`;

    const conflict = {
      id: conflictId,
      item1,
      item2,
      conflictLevel: Math.round(conflictLevel * 100) / 100,
      type: this._determineConflictType(item1, item2),
      context,
      detected: new Date().toISOString(),
      resolved: false
    };

    this.conflicts.set(conflictId, conflict);

    return {
      conflict: true,
      conflictId,
      conflictLevel: conflict.conflictLevel,
      type: conflict.type
    };
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(conflictId, metadata = {}) {
    const conflict = this.conflicts.get(conflictId);

    if (!conflict) {
      return { success: false, error: 'Conflict not found' };
    }

    const resolution = this._selectResolution(conflict);

    resolution.metadata = metadata;
    resolution.resolvedAt = new Date().toISOString();

    this.resolutions.set(conflictId, resolution);
    conflict.resolved = true;
    conflict.resolution = resolution;

    return {
      success: true,
      conflictId,
      resolution
    };
  }

  /**
   * Validate coherence between items
   */
  validateCoherence(items) {
    const coherenceScore = this._calculateCoherence(items);

    const incoherences = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const conflictLevel = this._calculateConflict(items[i], items[j]);

        if (conflictLevel > this.config.conflictThreshold) {
          incoherences.push({
            item1Index: i,
            item2Index: j,
            conflictLevel
          });
        }
      }
    }

    return {
      coherent: incoherences.length === 0,
      coherenceScore: Math.round(coherenceScore * 100) / 100,
      incoherences,
      totalPairs: (items.length * (items.length - 1)) / 2
    };
  }

  /**
   * Get conflict resolution suggestions
   */
  getSuggestions(conflictId) {
    const conflict = this.conflicts.get(conflictId);

    if (!conflict) {
      return [];
    }

    const suggestions = [];

    for (const strategy of this.config.resolutionStrategies) {
      const suggestion = this._suggestByStrategy(conflict, strategy);

      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  /**
   * List conflicts
   */
  listConflicts(resolved = null, limit = 100) {
    let conflicts = Array.from(this.conflicts.values());

    if (resolved !== null) {
      conflicts = conflicts.filter(c => c.resolved === resolved);
    }

    return conflicts
      .sort((a, b) => new Date(b.detected) - new Date(a.detected))
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const conflicts = Array.from(this.conflicts.values());
    const resolved = conflicts.filter(c => c.resolved).length;

    const byType = {};

    conflicts.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
    });

    const conflictLevels = conflicts.map(c => c.conflictLevel);

    return {
      totalConflicts: conflicts.length,
      resolvedConflicts: resolved,
      resolutionRate: conflicts.length > 0 ? Math.round((resolved / conflicts.length) * 100) : 0,
      byType,
      averageConflictLevel: conflicts.length > 0
        ? Math.round((conflictLevels.reduce((a, b) => a + b) / conflictLevels.length) * 100) / 100
        : 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear conflicts
   */
  clear() {
    this.conflicts.clear();
    this.resolutions.clear();

    return { success: true };
  }

  // ============ Private Methods ============

  _calculateConflict(item1, item2) {
    // Direct comparison
    if (this._isOpposite(item1, item2)) {
      return 1.0;
    }

    // Partial conflict based on difference
    const diff = this._calculateDifference(item1, item2);

    return Math.min(diff, 1.0);
  }

  _isOpposite(item1, item2) {
    if (typeof item1 === 'object' && typeof item2 === 'object') {
      const str1 = JSON.stringify(item1);
      const str2 = JSON.stringify(item2);

      // Check for negation patterns
      if (str1.includes('true') && str2.includes('false')) return true;
      if (str1.includes('false') && str2.includes('true')) return true;
    }

    return false;
  }

  _calculateDifference(item1, item2) {
    const str1 = JSON.stringify(item1);
    const str2 = JSON.stringify(item2);

    if (str1 === str2) return 0;

    const terms1 = new Set(str1.split(/\s+/));
    const terms2 = new Set(str2.split(/\s+/));

    const intersection = new Set([...terms1].filter(x => terms2.has(x)));
    const union = new Set([...terms1, ...terms2]);

    return 1 - (intersection.size / union.size);
  }

  _determineConflictType(item1, item2) {
    if (typeof item1 === 'boolean' || typeof item2 === 'boolean') {
      return 'logical';
    }

    if (typeof item1 === 'number' || typeof item2 === 'number') {
      return 'quantitative';
    }

    return 'qualitative';
  }

  _selectResolution(conflict) {
    const suggestions = [];

    for (const strategy of this.config.resolutionStrategies) {
      const suggestion = this._suggestByStrategy(conflict, strategy);

      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    suggestions.sort((a, b) => b.score - a.score);

    return suggestions[0] || {
      strategy: 'default',
      outcome: conflict.item1,
      reasoning: 'Default to first item',
      score: 0.5
    };
  }

  _suggestByStrategy(conflict, strategy) {
    switch (strategy) {
      case 'evidence':
        return {
          strategy: 'evidence',
          outcome: conflict.item1,
          reasoning: 'Choose item with stronger evidence',
          score: conflict.item1.confidence || 0.5
        };

      case 'majority':
        return {
          strategy: 'majority',
          outcome: conflict.item1,
          reasoning: 'Choose based on majority agreement',
          score: 0.6
        };

      case 'recency':
        return {
          strategy: 'recency',
          outcome: conflict.item1,
          reasoning: 'Choose more recent information',
          score: conflict.item1.timestamp ? 0.7 : 0.4
        };

      case 'authority':
        return {
          strategy: 'authority',
          outcome: conflict.item1,
          reasoning: 'Choose from authoritative source',
          score: conflict.item1.authority || 0.5
        };

      default:
        return null;
    }
  }

  _calculateCoherence(items) {
    if (items.length < 2) return 1.0;

    let totalConflict = 0;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        totalConflict += this._calculateConflict(items[i], items[j]);
      }
    }

    const pairCount = (items.length * (items.length - 1)) / 2;
    const averageConflict = totalConflict / pairCount;

    return 1 - averageConflict;
  }
}

module.exports = ConflictResolver;
