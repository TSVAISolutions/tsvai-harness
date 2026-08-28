/**
 * Consilient
 * Consensus & coherence engine
 * Validates decision coherence and mines consensus patterns
 */

const PatternMiner = require('./pattern-miner');
const ConflictResolver = require('./conflict-resolver');

class Consilient {
  constructor(config = {}) {
    this.config = config;

    this.miner = new PatternMiner(config.miner || {});
    this.resolver = new ConflictResolver(config.resolver || {});

    this.rules = new Map(); // rule name -> rule definition
    this.decisions = [];
    this.initialized = true;
  }

  /**
   * Record a decision
   */
  recordDecision(decision, context = {}) {
    const record = {
      id: `decision-${Date.now()}-${this.decisions.length}`,
      decision,
      context,
      timestamp: new Date().toISOString(),
      coherent: null,
      patterns: []
    };

    // Check coherence
    record.coherent = this._checkCoherence(decision);

    // Find applicable patterns
    record.patterns = this.miner.findMatchingPatterns(decision.input || {});

    this.decisions.push(record);

    // Observe for pattern mining
    this.miner.observe(
      decision.input || {},
      decision.output || {},
      {
        success: decision.successful !== false,
        context
      }
    );

    return { success: true, decisionId: record.id, coherent: record.coherent };
  }

  /**
   * Mine consensus patterns
   */
  minePatterns() {
    const patterns = this.miner.minePatterns();

    return {
      patternsFound: patterns.length,
      patterns,
      statistics: this.miner.getStatistics()
    };
  }

  /**
   * Get pattern
   */
  getPattern(patternId) {
    return this.miner.getPattern(patternId);
  }

  /**
   * List patterns
   */
  listPatterns(minConfidence = 0.7, limit = 50) {
    return this.miner.listPatterns(minConfidence, limit);
  }

  /**
   * Check decision against patterns
   */
  checkDecision(decision) {
    const matchingPatterns = this.miner.findMatchingPatterns(decision.input || {}, 0.6);

    const alignment = matchingPatterns.map(match => ({
      pattern: match.pattern.id,
      similarity: match.similarity,
      expectedOutput: match.predictedOutput,
      actualOutput: decision.output,
      aligned: this._outputsMatch(match.predictedOutput, decision.output)
    }));

    const alignmentScore = alignment.length > 0
      ? alignment.filter(a => a.aligned).length / alignment.length
      : 0.5;

    return {
      decision,
      matchingPatterns: matchingPatterns.length,
      alignment,
      alignmentScore: Math.round(alignmentScore * 100) / 100,
      aligned: alignmentScore > 0.5
    };
  }

  /**
   * Detect conflict
   */
  detectConflict(item1, item2, context = {}) {
    return this.resolver.detectConflict(item1, item2, context);
  }

  /**
   * Resolve conflict
   */
  resolveConflict(conflictId, metadata = {}) {
    return this.resolver.resolveConflict(conflictId, metadata);
  }

  /**
   * Validate coherence of multiple items
   */
  validateCoherence(items) {
    return this.resolver.validateCoherence(items);
  }

  /**
   * Get conflict suggestions
   */
  getConflictSuggestions(conflictId) {
    return this.resolver.getSuggestions(conflictId);
  }

  /**
   * Register a validation rule
   */
  registerRule(name, ruleFn, metadata = {}) {
    this.rules.set(name, {
      name,
      fn: ruleFn,
      metadata,
      created: new Date().toISOString()
    });

    return { success: true, ruleName: name };
  }

  /**
   * Validate against rules
   */
  validate(item) {
    const results = [];

    for (const [ruleName, rule] of this.rules.entries()) {
      try {
        const passes = rule.fn(item);

        results.push({
          rule: ruleName,
          passes,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          rule: ruleName,
          passes: false,
          error: error.message
        });
      }
    }

    const passCount = results.filter(r => r.passes).length;
    const score = results.length > 0 ? passCount / results.length : 1.0;

    return {
      valid: passCount === results.length,
      validationScore: Math.round(score * 100) / 100,
      results,
      passedRules: passCount,
      totalRules: results.length
    };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const decisions = this.decisions;
    const coherentDecisions = decisions.filter(d => d.coherent).length;

    return {
      totalDecisions: decisions.length,
      coherentDecisions,
      coherenceRate: decisions.length > 0
        ? Math.round((coherentDecisions / decisions.length) * 100)
        : 0,
      patterns: this.miner.getStatistics(),
      conflicts: this.resolver.getStatistics(),
      rules: this.rules.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all data
   */
  clear() {
    this.miner.clear();
    this.resolver.clear();
    this.decisions = [];

    return { success: true };
  }

  // ============ Private Methods ============

  _checkCoherence(decision) {
    // Check against existing patterns
    const matchingPatterns = this.miner.findMatchingPatterns(decision.input || {}, 0.5);

    if (matchingPatterns.length === 0) {
      return true; // No patterns to conflict with
    }

    // Check if output matches expected patterns
    const alignedCount = matchingPatterns.filter(m =>
      this._outputsMatch(m.predictedOutput, decision.output)
    ).length;

    return alignedCount / matchingPatterns.length > 0.5;
  }

  _outputsMatch(output1, output2) {
    if (output1 === output2) return true;

    try {
      const str1 = JSON.stringify(output1);
      const str2 = JSON.stringify(output2);

      return str1 === str2;
    } catch {
      return false;
    }
  }
}

module.exports = Consilient;
