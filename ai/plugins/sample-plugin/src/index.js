/**
 * Sample Text Analysis Plugin
 * Demonstrates plugin architecture for TSVAI Solutions
 */

const TextAnalyzer = require('./analyzer');
const PluginManager = require('./manager');

class SamplePlugin {
  constructor(config = {}) {
    this.config = config;
    this.analyzer = new TextAnalyzer(config);
    this.manager = new PluginManager();
    this.name = 'sample-plugin';
    this.version = '1.0.0';
  }

  async initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    return {
      success: true,
      message: `${this.name} initialized successfully`
    };
  }

  async execute(command, params) {
    try {
      switch (command) {
        case 'analyze':
          return await this.analyzer.analyze(params);
        case 'extractKeywords':
          return await this.analyzer.extractKeywords(params);
        case 'getSentiment':
          return await this.analyzer.getSentiment(params);
        case 'getStats':
          return await this.analyzer.getStats(params);
        default:
          return {
            success: false,
            error: `Unknown command: ${command}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validate(params) {
    if (!params.text || typeof params.text !== 'string') {
      return {
        valid: false,
        error: 'Text parameter is required and must be a string'
      };
    }

    if (params.text.length > this.config.maxTextLength || 10000) {
      return {
        valid: false,
        error: `Text exceeds maximum length of ${this.config.maxTextLength || 10000}`
      };
    }

    return { valid: true };
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      capabilities: [
        'textAnalysis',
        'keywordExtraction',
        'sentimentAnalysis',
        'statisticsGeneration'
      ],
      commands: [
        'analyze',
        'extractKeywords',
        'getSentiment',
        'getStats'
      ]
    };
  }

  async shutdown() {
    console.log(`Shutting down ${this.name}`);
    return { success: true };
  }
}

module.exports = SamplePlugin;
