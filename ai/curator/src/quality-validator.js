/**
 * Quality Validator
 * Validates content quality across multiple dimensions
 * Checks completeness, consistency, accuracy, and relevance
 */

class QualityValidator {
  constructor(config = {}) {
    this.config = {
      minQualityScore: config.minQualityScore || 0.5,
      strictMode: config.strictMode !== false,
      maxValidationSize: config.maxValidationSize || 1000000,
      ...config
    };

    this.rules = new Map(); // ruleId -> rule function
    this.validations = [];
    this.ruleCounter = 0;
  }

  /**
   * Register a validation rule
   */
  registerRule(name, ruleFn, metadata = {}) {
    const ruleId = `rule-${++this.ruleCounter}`;

    this.rules.set(ruleId, {
      id: ruleId,
      name,
      fn: ruleFn,
      metadata: {
        ...metadata,
        created: new Date().toISOString()
      }
    });

    return { success: true, ruleId };
  }

  /**
   * Validate content against rules
   */
  validate(content, options = {}) {
    const validation = {
      id: `validation-${Date.now()}`,
      content: content.substring ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100),
      timestamp: new Date().toISOString(),
      results: [],
      dimensions: {},
      overallScore: 0,
      passed: true
    };

    // Check completeness
    validation.dimensions.completeness = this._checkCompleteness(content);

    // Check consistency
    validation.dimensions.consistency = this._checkConsistency(content);

    // Check accuracy
    validation.dimensions.accuracy = this._checkAccuracy(content);

    // Check relevance
    validation.dimensions.relevance = this._checkRelevance(content);

    // Run custom rules
    for (const [ruleId, rule] of this.rules.entries()) {
      try {
        const passed = rule.fn(content);

        validation.results.push({
          rule: rule.name,
          passed,
          timestamp: new Date().toISOString()
        });

        if (!passed && this.config.strictMode) {
          validation.passed = false;
        }
      } catch (error) {
        validation.results.push({
          rule: rule.name,
          passed: false,
          error: error.message
        });

        validation.passed = false;
      }
    }

    // Calculate overall score
    const dimensionScores = Object.values(validation.dimensions).map(d => d.score || 0);
    const ruleScores = validation.results.map(r => r.passed ? 1 : 0);
    const allScores = [...dimensionScores, ...ruleScores];

    validation.overallScore = allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b) / allScores.length) * 100) / 100
      : 0;

    validation.passed = validation.passed && validation.overallScore >= this.config.minQualityScore;

    this.validations.push(validation);

    return validation;
  }

  /**
   * Batch validate
   */
  validateBatch(items, options = {}) {
    const results = items.map(item => this.validate(item, options));

    const passedCount = results.filter(r => r.passed).length;

    return {
      totalItems: items.length,
      passedItems: passedCount,
      failedItems: items.length - passedCount,
      successRate: Math.round((passedCount / items.length) * 100),
      results
    };
  }

  /**
   * Get validation statistics
   */
  getStatistics() {
    const validations = this.validations;

    if (validations.length === 0) {
      return {
        totalValidations: 0,
        passedValidations: 0,
        failedValidations: 0,
        successRate: 0,
        averageQualityScore: 0
      };
    }

    const passed = validations.filter(v => v.passed).length;
    const scores = validations.map(v => v.overallScore);

    return {
      totalValidations: validations.length,
      passedValidations: passed,
      failedValidations: validations.length - passed,
      successRate: Math.round((passed / validations.length) * 100),
      averageQualityScore: Math.round((scores.reduce((a, b) => a + b) / scores.length) * 100) / 100,
      dimensionAverages: this._calculateDimensionAverages(validations),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear validations
   */
  clear() {
    this.validations = [];

    return { success: true };
  }

  // ============ Private Methods ============

  _checkCompleteness(content) {
    const str = typeof content === 'string' ? content : JSON.stringify(content);

    if (str.length === 0) return { score: 0, issues: ['Empty content'] };

    const issues = [];

    if (str.length < 10) {
      issues.push('Content too short');
    }

    // Check for missing fields in objects
    if (typeof content === 'object' && content !== null) {
      const keys = Object.keys(content);

      if (keys.length < 2) {
        issues.push('Insufficient object properties');
      }

      const nullValues = keys.filter(k => content[k] === null || content[k] === undefined).length;

      if (nullValues > keys.length * 0.3) {
        issues.push('Too many null/undefined values');
      }
    }

    const score = Math.max(0, 1 - (issues.length * 0.2));

    return { score: Math.round(score * 100) / 100, issues };
  }

  _checkConsistency(content) {
    const issues = [];

    if (typeof content === 'object' && content !== null) {
      const types = new Set();

      for (const value of Object.values(content)) {
        types.add(typeof value);
      }

      // Warning if too many different types
      if (types.size > 5) {
        issues.push('Too many different data types');
      }
    }

    const score = Math.max(0, 1 - (issues.length * 0.15));

    return { score: Math.round(score * 100) / 100, issues };
  }

  _checkAccuracy(content) {
    const issues = [];
    const str = typeof content === 'string' ? content : JSON.stringify(content);

    // Check for common accuracy issues
    if (str.includes('TODO') || str.includes('FIXME')) {
      issues.push('Contains unresolved TODOs');
    }

    if (str.includes('undefined') && str.length < 1000) {
      issues.push('Contains undefined values');
    }

    if (str.includes('NaN')) {
      issues.push('Contains NaN values');
    }

    const score = Math.max(0, 1 - (issues.length * 0.2));

    return { score: Math.round(score * 100) / 100, issues };
  }

  _checkRelevance(content) {
    const issues = [];

    // Check if content is meaningful
    if (typeof content === 'string') {
      const wordCount = content.split(/\s+/).length;

      if (wordCount < 3) {
        issues.push('Content too brief');
      }

      // Check for common low-quality patterns
      if (content.match(/^[0-9]+$/)) {
        issues.push('Pure numeric content');
      }
    }

    const score = Math.max(0, 1 - (issues.length * 0.15));

    return { score: Math.round(score * 100) / 100, issues };
  }

  _calculateDimensionAverages(validations) {
    if (validations.length === 0) return {};

    const dimensions = ['completeness', 'consistency', 'accuracy', 'relevance'];
    const averages = {};

    dimensions.forEach(dim => {
      const scores = validations
        .map(v => v.dimensions[dim]?.score || 0)
        .filter(s => s > 0);

      if (scores.length > 0) {
        averages[dim] = Math.round((scores.reduce((a, b) => a + b) / scores.length) * 100) / 100;
      }
    });

    return averages;
  }
}

module.exports = QualityValidator;
