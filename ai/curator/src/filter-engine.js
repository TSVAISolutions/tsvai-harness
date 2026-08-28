/**
 * Filter Engine
 * Filters content for spam, noise, and policy violations
 * Supports multiple filter types and custom rules
 */

class FilterEngine {
  constructor(config = {}) {
    this.config = {
      enableSpamDetection: config.enableSpamDetection !== false,
      enableNoiseDetection: config.enableNoiseDetection !== false,
      enablePolicyCheck: config.enablePolicyCheck !== false,
      spamThreshold: config.spamThreshold || 0.7,
      noiseThreshold: config.noiseThreshold || 0.6,
      ...config
    };

    this.filters = new Map(); // filterId -> filter config
    this.blocklist = new Set(); // blocked terms/patterns
    this.allowlist = new Set(); // allowed terms/patterns
    this.policies = new Map(); // policyId -> policy rule
    this.filterResults = [];
    this.filterCounter = 0;
  }

  /**
   * Register a filter
   */
  registerFilter(name, filterFn, metadata = {}) {
    const filterId = `filter-${++this.filterCounter}`;

    this.filters.set(filterId, {
      id: filterId,
      name,
      fn: filterFn,
      metadata: {
        ...metadata,
        created: new Date().toISOString()
      },
      matchCount: 0
    });

    return { success: true, filterId };
  }

  /**
   * Add to blocklist
   */
  addToBlocklist(terms) {
    const termArray = Array.isArray(terms) ? terms : [terms];

    termArray.forEach(term => this.blocklist.add(term.toLowerCase()));

    return { success: true, addedCount: termArray.length };
  }

  /**
   * Add to allowlist
   */
  addToAllowlist(terms) {
    const termArray = Array.isArray(terms) ? terms : [terms];

    termArray.forEach(term => this.allowlist.add(term.toLowerCase()));

    return { success: true, addedCount: termArray.length };
  }

  /**
   * Register a policy
   */
  registerPolicy(name, policyFn, metadata = {}) {
    const policyId = `policy-${Date.now()}`;

    this.policies.set(policyId, {
      id: policyId,
      name,
      fn: policyFn,
      metadata: {
        ...metadata,
        created: new Date().toISOString()
      }
    });

    return { success: true, policyId };
  }

  /**
   * Filter content
   */
  filter(content, options = {}) {
    const result = {
      id: `filter-${Date.now()}`,
      content: content.substring ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100),
      timestamp: new Date().toISOString(),
      filtered: false,
      reasons: [],
      scores: {},
      checks: {}
    };

    const str = typeof content === 'string' ? content : JSON.stringify(content);

    // Check blocklist
    if (this.config.enableSpamDetection) {
      const blocklistMatch = this._checkBlocklist(str);

      if (blocklistMatch) {
        result.filtered = true;
        result.reasons.push(`Blocked term detected: ${blocklistMatch}`);
      }

      result.checks.blocklist = blocklistMatch ? 'BLOCKED' : 'PASS';
    }

    // Check allowlist (whitelist mode if enabled)
    if (options.useAllowlist && this.allowlist.size > 0) {
      const allowlistPass = this._checkAllowlist(str);

      if (!allowlistPass) {
        result.filtered = true;
        result.reasons.push('Content not on allowlist');
      }

      result.checks.allowlist = allowlistPass ? 'PASS' : 'BLOCKED';
    }

    // Spam detection
    if (this.config.enableSpamDetection) {
      result.scores.spam = this._detectSpam(str);

      if (result.scores.spam > this.config.spamThreshold) {
        result.filtered = true;
        result.reasons.push(`High spam score: ${result.scores.spam}`);
      }
    }

    // Noise detection
    if (this.config.enableNoiseDetection) {
      result.scores.noise = this._detectNoise(str);

      if (result.scores.noise > this.config.noiseThreshold) {
        result.filtered = true;
        result.reasons.push(`High noise score: ${result.scores.noise}`);
      }
    }

    // Policy checks
    if (this.config.enablePolicyCheck) {
      for (const [policyId, policy] of this.policies.entries()) {
        try {
          const policyViolation = !policy.fn(content);

          if (policyViolation) {
            result.filtered = true;
            result.reasons.push(`Policy violation: ${policy.name}`);
          }

          result.checks[policy.name] = policyViolation ? 'VIOLATION' : 'PASS';
        } catch (error) {
          result.checks[policy.name] = `ERROR: ${error.message}`;
        }
      }
    }

    // Run custom filters
    for (const [filterId, filter] of this.filters.entries()) {
      try {
        const blocked = filter.fn(content);

        if (blocked) {
          result.filtered = true;
          result.reasons.push(`Filter match: ${filter.name}`);
          filter.matchCount++;
        }

        result.checks[filter.name] = blocked ? 'BLOCKED' : 'PASS';
      } catch (error) {
        result.checks[filter.name] = `ERROR: ${error.message}`;
      }
    }

    this.filterResults.push(result);

    return result;
  }

  /**
   * Batch filter
   */
  filterBatch(items, options = {}) {
    const results = items.map(item => this.filter(item, options));

    const passedCount = results.filter(r => !r.filtered).length;

    return {
      totalItems: items.length,
      passedItems: passedCount,
      filteredItems: items.length - passedCount,
      filterRate: Math.round(((items.length - passedCount) / items.length) * 100),
      results
    };
  }

  /**
   * Get filter statistics
   */
  getStatistics() {
    const results = this.filterResults;

    if (results.length === 0) {
      return {
        totalFiltered: 0,
        passedCount: 0,
        filteredCount: 0,
        filterRate: 0,
        topReasons: [],
        filterMatches: {}
      };
    }

    const filtered = results.filter(r => r.filtered).length;
    const reasons = new Map();

    results.forEach(r => {
      r.reasons.forEach(reason => {
        reasons.set(reason, (reasons.get(reason) || 0) + 1);
      });
    });

    const topReasons = Array.from(reasons.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    const filterMatches = {};

    for (const [filterId, filter] of this.filters.entries()) {
      filterMatches[filter.name] = filter.matchCount;
    }

    return {
      totalFiltered: results.length,
      passedCount: results.length - filtered,
      filteredCount: filtered,
      filterRate: Math.round((filtered / results.length) * 100),
      topReasons,
      filterMatches,
      blocklistSize: this.blocklist.size,
      allowlistSize: this.allowlist.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear results
   */
  clear() {
    this.filterResults = [];

    return { success: true };
  }

  // ============ Private Methods ============

  _checkBlocklist(content) {
    const lower = content.toLowerCase();

    for (const term of this.blocklist) {
      if (lower.includes(term)) {
        return term;
      }
    }

    return null;
  }

  _checkAllowlist(content) {
    const lower = content.toLowerCase();

    for (const term of this.allowlist) {
      if (lower.includes(term)) {
        return true;
      }
    }

    return false;
  }

  _detectSpam(content) {
    let score = 0;

    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      score += 0.3;
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;

    if (linkCount > 5) {
      score += 0.3;
    }

    // Check for excessive caps
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / content.length;

    if (capsRatio > 0.5) {
      score += 0.2;
    }

    // Check for special character spam
    const specialCount = (content.match(/[!@#$%^&*()]/g) || []).length;

    if (specialCount / content.length > 0.2) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  _detectNoise(content) {
    let score = 0;

    // Check for short content
    if (content.length < 20) {
      score += 0.4;
    }

    // Check for random characters
    const randomChars = (content.match(/[^a-zA-Z0-9\s.,!?-]/g) || []).length;

    if (randomChars / content.length > 0.3) {
      score += 0.3;
    }

    // Check for gibberish patterns
    if (/([a-z])\1{2,}/.test(content.toLowerCase())) {
      score += 0.2;
    }

    // Check for low information content
    const uniqueWords = new Set(content.split(/\s+/)).size;

    if (uniqueWords < 3) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }
}

module.exports = FilterEngine;
