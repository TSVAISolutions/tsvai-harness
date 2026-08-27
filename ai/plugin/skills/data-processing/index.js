/**
 * Data Processing Skill
 * Data transformation, format conversion, and batch operations
 */

class DataProcessingSkill {
  constructor(config = {}) {
    this.config = config;
  }

  async initialize() {
    console.log('[DataProcessingSkill] Initialized');
    return { success: true };
  }

  /**
   * Convert data between formats
   */
  async convertFormat(data, fromFormat, toFormat) {
    try {
      let parsed = data;

      // Parse input
      if (typeof data === 'string') {
        parsed = this._parseFormat(data, fromFormat);
      }

      // Convert to target format
      const result = this._convertToFormat(parsed, toFormat);

      return {
        success: true,
        fromFormat,
        toFormat,
        result,
        size: JSON.stringify(result).length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Transform data using mapping
   */
  async transformData(data, mapping) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const result = data.map(item => {
        const transformed = {};
        for (const [from, to] of Object.entries(mapping)) {
          if (from in item) {
            transformed[to] = item[from];
          }
        }
        return transformed;
      });

      return {
        success: true,
        inputSize: data.length,
        outputSize: result.length,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Filter data
   */
  async filterData(data, predicate) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const result = data.filter(item => {
        try {
          const fn = new Function('item', `return ${predicate}`);
          return fn(item);
        } catch {
          return false;
        }
      });

      return {
        success: true,
        inputSize: data.length,
        filteredSize: result.length,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Aggregate data
   */
  async aggregateData(data, operation, field) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const values = data.map(item => item[field]).filter(v => v !== null && v !== undefined);

      let result;
      switch (operation.toLowerCase()) {
        case 'sum':
          result = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
        case 'average':
          result = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          result = values.length;
          break;
        case 'max':
          result = Math.max(...values);
          break;
        case 'min':
          result = Math.min(...values);
          break;
        default:
          return { success: false, error: `Unknown operation: ${operation}` };
      }

      return {
        success: true,
        operation,
        field,
        result: Math.round(result * 100) / 100,
        valueCount: values.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Flatten nested data
   */
  async flattenData(data, depth = 1) {
    try {
      const flattened = this._flatten(data, depth);
      return {
        success: true,
        depth,
        result: flattened
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Chunk data into batches
   */
  async chunkData(data, chunkSize) {
    try {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Data must be an array' };
      }

      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }

      return {
        success: true,
        chunkSize,
        chunkCount: chunks.length,
        result: chunks
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'convert':
        return this.convertFormat(params.data, params.fromFormat, params.toFormat);
      case 'transform':
        return this.transformData(params.data, params.mapping);
      case 'filter':
        return this.filterData(params.data, params.predicate);
      case 'aggregate':
        return this.aggregateData(params.data, params.operation, params.field);
      case 'flatten':
        return this.flattenData(params.data, params.depth);
      case 'chunk':
        return this.chunkData(params.data, params.chunkSize);
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
    console.log('[DataProcessingSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _parseFormat(data, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.parse(data);
      case 'csv':
        return this._parseCSV(data);
      default:
        return data;
    }
  }

  _convertToFormat(data, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this._convertToCSV(data);
      default:
        return data;
    }
  }

  _parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const values = lines[i].split(',').map(v => v.trim());
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      result.push(obj);
    }

    return result;
  }

  _convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(h => row[h] || '');
      csv.push(values.join(','));
    });

    return csv.join('\n');
  }

  _flatten(arr, depth) {
    if (depth <= 0) return arr;
    return arr.reduce((acc, val) => {
      return acc.concat(Array.isArray(val) ? this._flatten(val, depth - 1) : val);
    }, []);
  }

  getMetadata() {
    return {
      name: 'data-processing',
      displayName: 'Data Processing Skill',
      description: 'Data transformation, format conversion, and batch operations',
      version: '1.0.0',
      capabilities: [
        'Format Conversion',
        'Data Transformation',
        'Filtering',
        'Aggregation',
        'Flattening',
        'Chunking'
      ],
      operations: ['convert', 'transform', 'filter', 'aggregate', 'flatten', 'chunk']
    };
  }
}

module.exports = DataProcessingSkill;
