/**
 * Curator
 * Content curation and quality control system
 * Validates, filters, and classifies content
 */

const QualityValidator = require('./quality-validator');
const FilterEngine = require('./filter-engine');
const ContentClassifier = require('./content-classifier');

class Curator {
  constructor(config = {}) {
    this.config = config;

    this.validator = new QualityValidator(config.validator || {});
    this.filter = new FilterEngine(config.filter || {});
    this.classifier = new ContentClassifier(config.classifier || {});

    this.curationResults = [];
    this.curationCounter = 0;
  }

  /**
   * Curate content (validate, filter, classify)
   */
  curate(content, options = {}) {
    const curationId = `curation-${++this.curationCounter}`;

    const curation = {
      id: curationId,
      content: content.substring ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100),
      timestamp: new Date().toISOString(),
      accepted: true,
      validation: null,
      filtering: null,
      classification: null,
      issues: [],
      score: 0
    };

    // Step 1: Validate quality
    if (options.validate !== false) {
      curation.validation = this.validator.validate(content, options);

      if (!curation.validation.passed) {
        curation.accepted = false;
        curation.issues.push(`Quality check failed (score: ${curation.validation.overallScore})`);
      }

      curation.score += curation.validation.overallScore * 0.3;
    }

    // Step 2: Filter content
    if (options.filter !== false) {
      curation.filtering = this.filter.filter(content, options);

      if (curation.filtering.filtered) {
        curation.accepted = false;
        curation.issues.push(`Content filtered: ${curation.filtering.reasons.join(', ')}`);
      }

      // Add filter scores to overall score
      const filterScore = 1 - (curation.filtering.scores.spam || 0);
      curation.score += filterScore * 0.35;
    }

    // Step 3: Classify content
    if (options.classify !== false) {
      curation.classification = this.classifier.classify(content, options);

      curation.score += (curation.classification.categories.length > 0 ? 0.35 : 0.1);
    }

    // Normalize score
    curation.score = Math.round((curation.score / 3) * 100) / 100;

    this.curationResults.push(curation);

    return curation;
  }

  /**
   * Batch curate
   */
  curateBatch(items, options = {}) {
    const results = items.map(item => this.curate(item, options));

    const acceptedCount = results.filter(r => r.accepted).length;

    return {
      totalItems: items.length,
      acceptedItems: acceptedCount,
      rejectedItems: items.length - acceptedCount,
      acceptanceRate: Math.round((acceptedCount / items.length) * 100),
      averageScore: Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 100) / 100,
      results
    };
  }

  /**
   * Register validation rule
   */
  registerRule(name, ruleFn, metadata = {}) {
    return this.validator.registerRule(name, ruleFn, metadata);
  }

  /**
   * Register filter
   */
  registerFilter(name, filterFn, metadata = {}) {
    return this.filter.registerFilter(name, filterFn, metadata);
  }

  /**
   * Register category
   */
  registerCategory(name, config = {}) {
    return this.classifier.registerCategory(name, config);
  }

  /**
   * Register taxonomy
   */
  registerTaxonomy(name, terms) {
    return this.classifier.registerTaxonomy(name, terms);
  }

  /**
   * Add to blocklist
   */
  blockTerms(terms) {
    return this.filter.addToBlocklist(terms);
  }

  /**
   * Add to allowlist
   */
  allowTerms(terms) {
    return this.filter.addToAllowlist(terms);
  }

  /**
   * Register policy
   */
  registerPolicy(name, policyFn, metadata = {}) {
    return this.filter.registerPolicy(name, policyFn, metadata);
  }

  /**
   * Get curation statistics
   */
  getStatistics() {
    const curations = this.curationResults;

    if (curations.length === 0) {
      return {
        totalCurations: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        acceptanceRate: 0,
        averageScore: 0,
        validationStats: {},
        filterStats: {},
        classificationStats: {}
      };
    }

    const accepted = curations.filter(c => c.accepted).length;
    const scores = curations.map(c => c.score);

    return {
      totalCurations: curations.length,
      acceptedCount: accepted,
      rejectedCount: curations.length - accepted,
      acceptanceRate: Math.round((accepted / curations.length) * 100),
      averageScore: Math.round((scores.reduce((a, b) => a + b) / scores.length) * 100) / 100,
      scoreDistribution: this._calculateScoreDistribution(scores),
      validationStats: this.validator.getStatistics(),
      filterStats: this.filter.getStatistics(),
      classificationStats: this.classifier.getStatistics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get curation results
   */
  getResults(accepted = null, limit = 100) {
    let results = this.curationResults;

    if (accepted !== null) {
      results = results.filter(r => r.accepted === accepted);
    }

    return results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get rejected content
   */
  getRejected(limit = 100) {
    return this.getResults(false, limit);
  }

  /**
   * Get accepted content
   */
  getAccepted(limit = 100) {
    return this.getResults(true, limit);
  }

  /**
   * Clear all results
   */
  clear() {
    this.curationResults = [];
    this.validator.clear();
    this.filter.clear();
    this.classifier.clear();

    return { success: true };
  }

  // ============ Private Methods ============

  _calculateScoreDistribution(scores) {
    const ranges = {
      'excellent': { min: 0.8, max: 1.0, count: 0 },
      'good': { min: 0.6, max: 0.8, count: 0 },
      'fair': { min: 0.4, max: 0.6, count: 0 },
      'poor': { min: 0.0, max: 0.4, count: 0 }
    };

    scores.forEach(score => {
      for (const [range, config] of Object.entries(ranges)) {
        if (score >= config.min && score < config.max) {
          config.count++;
          break;
        }
      }
    });

    const distribution = {};

    for (const [range, config] of Object.entries(ranges)) {
      distribution[range] = config.count;
    }

    return distribution;
  }
}

module.exports = Curator;
