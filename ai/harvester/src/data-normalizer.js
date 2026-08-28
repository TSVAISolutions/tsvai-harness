/**
 * Data Normalizer
 * Normalizes data to standard format
 * Handles format conversion, deduplication, and validation
 */

class DataNormalizer {
  constructor(config = {}) {
    this.config = {
      standardFormat: config.standardFormat || 'json',
      strictMode: config.strictMode !== false,
      maxNormalizeSize: config.maxNormalizeSize || 1000000,
      ...config
    };

    this.schemas = new Map(); // format -> schema
    this.normalizations = [];
    this.deduplicator = new Map(); // hash -> original
  }

  /**
   * Register a schema for a format
   */
  registerSchema(format, schema) {
    this.schemas.set(format, schema);

    return { success: true, format };
  }

  /**
   * Detect format of data
   */
  detectFormat(data) {
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
        return 'json';
      } catch {
        // Try CSV
        if (data.includes(',') && data.includes('\n')) {
          return 'csv';
        }

        return 'text';
      }
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return 'array';
      }

      return 'object';
    }

    return 'unknown';
  }

  /**
   * Normalize data to standard format
   */
  normalize(data, sourceFormat = null) {
    const format = sourceFormat || this.detectFormat(data);

    let parsed;

    try {
      switch (format) {
        case 'json':
          parsed = typeof data === 'string' ? JSON.parse(data) : data;
          break;

        case 'csv':
          parsed = this._parseCSV(data);
          break;

        case 'xml':
          parsed = this._parseXML(data);
          break;

        default:
          parsed = data;
      }

      // Standardize to common format
      const normalized = this._standardize(parsed);

      // Check for duplicates
      const isDuplicate = this._checkDuplicate(normalized);

      const result = {
        success: true,
        originalFormat: format,
        normalized,
        isDuplicate,
        timestamp: new Date().toISOString()
      };

      this.normalizations.push(result);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalFormat: format
      };
    }
  }

  /**
   * Batch normalize
   */
  normalizeBatch(items, options = {}) {
    const results = [];
    const successCount = { success: 0, failed: 0, duplicates: 0 };

    items.forEach(item => {
      const result = this.normalize(item, options.format);

      if (result.success) {
        successCount.success++;

        if (result.isDuplicate) {
          successCount.duplicates++;
        }
      } else {
        successCount.failed++;
      }

      results.push(result);
    });

    return {
      success: true,
      totalItems: items.length,
      results,
      statistics: successCount
    };
  }

  /**
   * Validate normalized data
   */
  validate(data, format = 'json') {
    const schema = this.schemas.get(format);

    if (!schema) {
      return {
        valid: true,
        message: 'No schema registered for format'
      };
    }

    const errors = this._validateAgainstSchema(data, schema);

    return {
      valid: errors.length === 0,
      errors,
      validated: new Date().toISOString()
    };
  }

  /**
   * Get deduplication statistics
   */
  getDeduplicationStats() {
    return {
      totalItems: this.normalizations.length,
      uniqueItems: this.deduplicator.size,
      duplicates: this.normalizations.length - this.deduplicator.size,
      deduplicationRate: this.normalizations.length > 0
        ? Math.round(((this.normalizations.length - this.deduplicator.size) / this.normalizations.length) * 100)
        : 0
    };
  }

  /**
   * Get normalization statistics
   */
  getStatistics() {
    const success = this.normalizations.filter(n => n.success).length;
    const failed = this.normalizations.filter(n => !n.success).length;

    return {
      totalNormalizations: this.normalizations.length,
      successful: success,
      failed,
      successRate: this.normalizations.length > 0
        ? Math.round((success / this.normalizations.length) * 100)
        : 0,
      deduplication: this.getDeduplicationStats(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old data
   */
  clear() {
    this.normalizations = [];
    this.deduplicator.clear();

    return { success: true };
  }

  // ============ Private Methods ============

  _parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const obj = {};

      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });

      data.push(obj);
    }

    return data;
  }

  _parseXML(xml) {
    // Simple XML parser (in real scenario, use proper XML library)
    const data = {};

    const regex = /<([^>]+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      data[match[1]] = match[2];
    }

    return data;
  }

  _standardize(data) {
    // Convert to standard format
    if (Array.isArray(data)) {
      return data.map(item => this._standardizeObject(item));
    }

    return this._standardizeObject(data);
  }

  _standardizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const standardized = {
      id: obj.id || obj._id || null,
      data: obj,
      extracted: new Date().toISOString()
    };

    return standardized;
  }

  _checkDuplicate(normalized) {
    const hash = this._hashData(normalized);

    if (this.deduplicator.has(hash)) {
      return true;
    }

    this.deduplicator.set(hash, normalized);

    return false;
  }

  _hashData(data) {
    const str = JSON.stringify(data);

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return hash.toString();
  }

  _validateAgainstSchema(data, schema) {
    const errors = [];

    for (const [key, type] of Object.entries(schema)) {
      if (!(key in data)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      if (typeof data[key] !== type) {
        errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof data[key]}`);
      }
    }

    return errors;
  }
}

module.exports = DataNormalizer;
