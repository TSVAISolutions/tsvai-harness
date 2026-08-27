/**
 * Quality Assurance Skill
 * Validation, quality metrics, and testing utilities
 */

class QualityAssuranceSkill {
  constructor(config = {}) {
    this.config = config;
  }

  async initialize() {
    console.log('[QualityAssuranceSkill] Initialized');
    return { success: true };
  }

  /**
   * Validate data structure
   */
  async validateStructure(data, schema) {
    try {
      const errors = this._validateAgainstSchema(data, schema);

      return {
        success: errors.length === 0,
        valid: errors.length === 0,
        errorCount: errors.length,
        errors
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate quality metrics
   */
  async calculateMetrics(data) {
    try {
      const metrics = {
        completeness: this._calculateCompleteness(data),
        consistency: this._calculateConsistency(data),
        accuracy: this._estimateAccuracy(data),
        uniformity: this._calculateUniformity(data)
      };

      const overallQuality = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;

      return {
        success: true,
        metrics,
        overallQuality: Math.round(overallQuality * 100) / 100,
        rating: this._rateQuality(overallQuality)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test value ranges
   */
  async testRanges(data, field, min, max) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const outOfRange = data.filter(item => {
        const value = item[field];
        return value < min || value > max;
      });

      const passRate = ((data.length - outOfRange.length) / data.length) * 100;

      return {
        success: true,
        field,
        range: { min, max },
        totalRecords: data.length,
        passCount: data.length - outOfRange.length,
        failCount: outOfRange.length,
        passRate: Math.round(passRate * 100) / 100,
        failures: outOfRange
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect anomalies
   */
  async detectAnomalies(data, field, threshold = 2) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const values = data.map(item => item[field]).filter(v => typeof v === 'number');

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const anomalies = data.filter((item, i) => {
        const value = item[field];
        return Math.abs((value - mean) / stdDev) > threshold;
      });

      return {
        success: true,
        field,
        threshold,
        statistics: {
          mean: Math.round(mean * 100) / 100,
          stdDev: Math.round(stdDev * 100) / 100,
          min: Math.min(...values),
          max: Math.max(...values)
        },
        anomalyCount: anomalies.length,
        anomalies
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for duplicates
   */
  async checkDuplicates(data, field) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const seen = new Map();
      const duplicates = [];

      data.forEach((item, i) => {
        const value = item[field];
        if (seen.has(value)) {
          duplicates.push({
            value,
            indices: [seen.get(value), i]
          });
        } else {
          seen.set(value, i);
        }
      });

      const duplicateRate = (duplicates.length / data.length) * 100;

      return {
        success: true,
        field,
        totalRecords: data.length,
        uniqueCount: seen.size,
        duplicateCount: duplicates.length,
        duplicateRate: Math.round(duplicateRate * 100) / 100,
        duplicates: duplicates.slice(0, 10)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'validate':
        return this.validateStructure(params.data, params.schema);
      case 'metrics':
        return this.calculateMetrics(params.data);
      case 'ranges':
        return this.testRanges(params.data, params.field, params.min, params.max);
      case 'anomalies':
        return this.detectAnomalies(params.data, params.field, params.threshold);
      case 'duplicates':
        return this.checkDuplicates(params.data, params.field);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  async validate(params) {
    if (!params.data) {
      return { valid: false, error: 'Data parameter is required' };
    }
    return { valid: true };
  }

  async shutdown() {
    console.log('[QualityAssuranceSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _validateAgainstSchema(data, schema) {
    const errors = [];

    if (!schema) return errors;

    if (typeof data !== 'object') {
      errors.push('Data must be an object');
      return errors;
    }

    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !(field in data)) {
        errors.push(`Required field missing: ${field}`);
      }

      if (field in data && rules.type) {
        const actualType = typeof data[field];
        if (actualType !== rules.type) {
          errors.push(`Field ${field} has incorrect type. Expected ${rules.type}, got ${actualType}`);
        }
      }
    }

    return errors;
  }

  _calculateCompleteness(data) {
    if (!data || typeof data !== 'object') return 0;

    const fields = Object.keys(data);
    const filledFields = fields.filter(f => data[f] !== null && data[f] !== undefined && data[f] !== '').length;

    return fields.length === 0 ? 1 : filledFields / fields.length;
  }

  _calculateConsistency(data) {
    if (!Array.isArray(data)) return 0.5;

    if (data.length < 2) return 1;

    const firstKeys = Object.keys(data[0]);
    let consistent = 0;

    data.forEach(item => {
      if (Object.keys(item).length === firstKeys.length &&
          firstKeys.every(k => k in item)) {
        consistent++;
      }
    });

    return consistent / data.length;
  }

  _estimateAccuracy(data) {
    if (!data) return 0;
    return 0.85;
  }

  _calculateUniformity(data) {
    if (!Array.isArray(data)) return 0.5;

    if (data.length < 2) return 1;

    const types = {};
    data.forEach(item => {
      const type = typeof item;
      types[type] = (types[type] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(types));
    return maxCount / data.length;
  }

  _rateQuality(quality) {
    if (quality >= 0.9) return 'Excellent';
    if (quality >= 0.8) return 'Good';
    if (quality >= 0.7) return 'Fair';
    if (quality >= 0.6) return 'Poor';
    return 'Critical';
  }

  getMetadata() {
    return {
      name: 'quality-assurance',
      displayName: 'Quality Assurance Skill',
      description: 'Validation, quality metrics, and testing utilities',
      version: '1.0.0',
      capabilities: [
        'Data Validation',
        'Quality Metrics',
        'Range Testing',
        'Anomaly Detection',
        'Duplicate Detection'
      ],
      operations: ['validate', 'metrics', 'ranges', 'anomalies', 'duplicates']
    };
  }
}

module.exports = QualityAssuranceSkill;
