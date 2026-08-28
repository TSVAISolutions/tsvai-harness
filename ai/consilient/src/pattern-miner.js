/**
 * Pattern Miner
 * Discovers consensus patterns from observations
 * Learns from repeated successful behaviors and decisions
 */

class PatternMiner {
  constructor(config = {}) {
    this.config = {
      minFrequency: config.minFrequency || 3,
      minConfidence: config.minConfidence || 0.7,
      maxPatterns: config.maxPatterns || 10000,
      ...config
    };

    this.patterns = new Map(); // patternHash -> pattern
    this.observations = []; // All observations
    this.patternCounter = 0;
  }

  /**
   * Record an observation
   */
  observe(input, output, metadata = {}) {
    const observation = {
      id: `obs-${Date.now()}-${this.observations.length}`,
      input,
      output,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        success: metadata.success !== false
      }
    };

    this.observations.push(observation);

    return { success: true, observationId: observation.id };
  }

  /**
   * Mine patterns from observations
   */
  minePatterns() {
    if (this.observations.length === 0) {
      return [];
    }

    // Group by input pattern
    const groups = this._groupObservations();
    const minedPatterns = [];

    for (const [inputPattern, observations] of groups.entries()) {
      if (observations.length < this.config.minFrequency) {
        continue;
      }

      // Calculate consistency
      const outputs = observations.map(o => o.output);
      const uniqueOutputs = new Set(outputs);
      const consistency = 1 - (uniqueOutputs.size / observations.length);

      // Calculate success rate
      const successCount = observations.filter(o => o.metadata.success).length;
      const successRate = successCount / observations.length;

      if (successRate >= this.config.minConfidence) {
        const patternId = `pattern-${++this.patternCounter}`;

        const pattern = {
          id: patternId,
          input: this._parsePattern(inputPattern),
          output: this._getMostCommonOutput(outputs),
          frequency: observations.length,
          consistency: Math.round(consistency * 100) / 100,
          successRate: Math.round(successRate * 100) / 100,
          confidence: this._calculateConfidence(consistency, successRate),
          examples: observations.slice(0, 5),
          created: new Date().toISOString()
        };

        this.patterns.set(patternId, pattern);
        minedPatterns.push(pattern);

        // Keep bounded
        if (this.patterns.size > this.config.maxPatterns) {
          const oldest = Array.from(this.patterns.values())
            .sort((a, b) => new Date(a.created) - new Date(b.created))[0];
          this.patterns.delete(oldest.id);
        }
      }
    }

    return minedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get pattern by ID
   */
  getPattern(patternId) {
    return this.patterns.get(patternId) || null;
  }

  /**
   * List patterns
   */
  listPatterns(minConfidence = 0, limit = 100) {
    return Array.from(this.patterns.values())
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Find matching patterns
   */
  findMatchingPatterns(input, threshold = 0.7) {
    const matches = [];

    for (const pattern of this.patterns.values()) {
      const similarity = this._calculateSimilarity(input, pattern.input);

      if (similarity >= threshold) {
        matches.push({
          pattern,
          similarity: Math.round(similarity * 100) / 100,
          predictedOutput: pattern.output
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    const patterns = Array.from(this.patterns.values());

    if (patterns.length === 0) {
      return {
        totalPatterns: 0,
        averageConfidence: 0,
        averageFrequency: 0,
        averageConsistency: 0
      };
    }

    const confidences = patterns.map(p => p.confidence);
    const frequencies = patterns.map(p => p.frequency);
    const consistencies = patterns.map(p => p.consistency);

    return {
      totalPatterns: patterns.length,
      totalObservations: this.observations.length,
      averageConfidence: Math.round((confidences.reduce((a, b) => a + b) / confidences.length) * 100) / 100,
      averageFrequency: Math.round(frequencies.reduce((a, b) => a + b) / frequencies.length),
      averageConsistency: Math.round((consistencies.reduce((a, b) => a + b) / consistencies.length) * 100) / 100,
      highConfidencePatterns: patterns.filter(p => p.confidence > 0.85).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear patterns
   */
  clear() {
    this.patterns.clear();
    this.observations = [];

    return { success: true };
  }

  // ============ Private Methods ============

  _groupObservations() {
    const groups = new Map();

    this.observations.forEach(obs => {
      const inputHash = JSON.stringify(obs.input);

      if (!groups.has(inputHash)) {
        groups.set(inputHash, []);
      }

      groups.get(inputHash).push(obs);
    });

    return groups;
  }

  _parsePattern(patternString) {
    try {
      return JSON.parse(patternString);
    } catch {
      return patternString;
    }
  }

  _getMostCommonOutput(outputs) {
    const counts = {};

    outputs.forEach(output => {
      const key = JSON.stringify(output);
      counts[key] = (counts[key] || 0) + 1;
    });

    const mostCommon = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];

    return mostCommon ? this._parsePattern(mostCommon[0]) : outputs[0];
  }

  _calculateConfidence(consistency, successRate) {
    return Math.round(((consistency + successRate) / 2) * 100) / 100;
  }

  _calculateSimilarity(input1, input2) {
    const str1 = JSON.stringify(input1);
    const str2 = JSON.stringify(input2);

    if (str1 === str2) return 1.0;

    const terms1 = new Set(str1.toLowerCase().split(/\s+/));
    const terms2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...terms1].filter(x => terms2.has(x)));
    const union = new Set([...terms1, ...terms2]);

    return intersection.size / union.size;
  }
}

module.exports = PatternMiner;
