/**
 * Plugin System Integration Tests
 * Tests all skills with MCP server, loader, and registry
 */

const path = require('path');
const PluginSystem = require('../src/plugin-system');

describe('PluginSystem Integration Tests', () => {
  let system;

  beforeEach(async () => {
    system = new PluginSystem({
      skillsDir: path.join(__dirname, '../skills'),
      debug: false
    });
    await system.initialize();
  });

  afterEach(async () => {
    await system.shutdown();
  });

  describe('System Initialization', () => {
    it('should initialize successfully', () => {
      expect(system.isInitialized()).toBe(true);
    });

    it('should discover all 7 skills', () => {
      const registry = system.getSkillRegistry();
      expect(registry.length).toBe(7);
    });

    it('should load all skills in registry', () => {
      const summary = system.getRegistrySummary();
      expect(summary.totalSkills).toBe(7);
    });

    it('should register MCP tools', () => {
      const tools = system.getMcpTools();
      expect(tools.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Skill Discovery', () => {
    it('should list all skills', () => {
      const skills = system.getSkillRegistry();
      expect(skills.length).toBe(7);

      const skillNames = skills.map(s => s.category);
      expect(skillNames).toContain('analytics');
      expect(skillNames).toContain('text-analysis');
      expect(skillNames).toContain('data-processing');
      expect(skillNames).toContain('content-generation');
      expect(skillNames).toContain('nlp-processing');
      expect(skillNames).toContain('quality-assurance');
      expect(skillNames).toContain('reporting');
    });

    it('should search for skills by query', () => {
      const results = system.searchSkills('analysis');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skillId).toBeDefined();
    });

    it('should find skills by category', () => {
      const skills = system.getSkillsByCategory('analytics');
      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0].name).toBe('analytics');
    });

    it('should find skills by capability', () => {
      const skills = system.getSkillsByCapability('Text Analysis');
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should get detailed skill info', () => {
      const info = system.getSkillInfo('analytics:analytics');
      expect(info).toBeDefined();
      expect(info.displayName).toBe('Analytics Skill');
      expect(info.capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('MCP Tool Execution', () => {
    it('should execute analytics tool', async () => {
      const result = await system.executeTool('analytics_analytics', {
        operation: 'analyze',
        params: { text: 'This is a great test!' }
      });

      expect(result.success).toBe(true);
      expect(result.result.wordCount).toBeGreaterThan(0);
    });

    it('should execute text-analysis tool', async () => {
      const result = await system.executeTool('text_analysis_text_analysis', {
        operation: 'sentences',
        params: { text: 'First sentence. Second sentence.' }
      });

      expect(result.success).toBe(true);
    });

    it('should execute data-processing tool', async () => {
      const result = await system.executeTool('data_processing_data_processing', {
        operation: 'chunk',
        params: { data: [1, 2, 3, 4, 5], chunkSize: 2 }
      });

      expect(result.success).toBe(true);
    });

    it('should execute content-generation tool', async () => {
      const result = await system.executeTool('content_generation_content_generation', {
        operation: 'list',
        params: { items: ['item1', 'item2'], format: 'bullet' }
      });

      expect(result.success).toBe(true);
    });

    it('should execute nlp-processing tool', async () => {
      const result = await system.executeTool('nlp_processing_nlp_processing', {
        operation: 'tokenize',
        params: { text: 'Hello world' }
      });

      expect(result.success).toBe(true);
    });

    it('should execute quality-assurance tool', async () => {
      const result = await system.executeTool('quality_assurance_quality_assurance', {
        operation: 'metrics',
        params: { data: { field1: 'value1', field2: 'value2' } }
      });

      expect(result.success).toBe(true);
    });

    it('should execute reporting tool', async () => {
      const result = await system.executeTool('reporting_reporting', {
        operation: 'executiveSummary',
        params: { data: { title: 'Test Report' } }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Analytics Skill Integration', () => {
    it('should analyze text with all operations', async () => {
      const text = 'The TSVAI platform is amazing! It provides great analytics capabilities.';

      const result = await system.executeTool('analytics_analytics', {
        operation: 'analyze',
        params: { text, operations: ['wordCount', 'stats', 'keywords', 'sentiment'] }
      });

      expect(result.success).toBe(true);
      expect(result.result.wordCount).toBeGreaterThan(0);
      expect(result.result.stats).toBeDefined();
      expect(result.result.keywords).toBeDefined();
      expect(result.result.sentiment).toBeDefined();
    });

    it('should extract keywords', async () => {
      const result = await system.executeTool('analytics_analytics', {
        operation: 'keywords',
        params: { text: 'apple apple banana banana cherry', topN: 3 }
      });

      expect(result.success).toBe(true);
      expect(result.result.keywords.length).toBeLessThanOrEqual(3);
    });

    it('should analyze sentiment', async () => {
      const result = await system.executeTool('analytics_analytics', {
        operation: 'sentiment',
        params: { text: 'This is wonderful and amazing!' }
      });

      expect(result.success).toBe(true);
      expect(result.result.sentiment).toBe('positive');
    });
  });

  describe('Text Analysis Skill Integration', () => {
    it('should parse sentences', async () => {
      const result = await system.executeTool('text_analysis_text_analysis', {
        operation: 'sentences',
        params: { text: 'First. Second. Third.' }
      });

      expect(result.success).toBe(true);
      expect(result.result.sentenceCount).toBe(3);
    });

    it('should parse paragraphs', async () => {
      const result = await system.executeTool('text_analysis_text_analysis', {
        operation: 'paragraphs',
        params: { text: 'Para 1\n\nPara 2\n\nPara 3' }
      });

      expect(result.success).toBe(true);
      expect(result.result.paragraphCount).toBe(3);
    });

    it('should detect patterns', async () => {
      const result = await system.executeTool('text_analysis_text_analysis', {
        operation: 'patterns',
        params: { text: 'Email: test@example.com, URL: https://example.com' }
      });

      expect(result.success).toBe(true);
      expect(result.result.patterns).toBeDefined();
    });
  });

  describe('Data Processing Skill Integration', () => {
    it('should convert formats', async () => {
      const data = JSON.stringify([{ name: 'John', age: 30 }]);

      const result = await system.executeTool('data_processing_data_processing', {
        operation: 'convert',
        params: { data, fromFormat: 'json', toFormat: 'csv' }
      });

      expect(result.success).toBe(true);
    });

    it('should filter data', async () => {
      const result = await system.executeTool('data_processing_data_processing', {
        operation: 'filter',
        params: {
          data: [{ id: 1, active: true }, { id: 2, active: false }],
          predicate: 'item.active === true'
        }
      });

      expect(result.success).toBe(true);
    });

    it('should aggregate data', async () => {
      const result = await system.executeTool('data_processing_data_processing', {
        operation: 'aggregate',
        params: {
          data: [{ value: 10 }, { value: 20 }, { value: 30 }],
          operation: 'sum',
          field: 'value'
        }
      });

      expect(result.success).toBe(true);
      expect(result.result.result).toBe(60);
    });
  });

  describe('Content Generation Skill Integration', () => {
    it('should generate list', async () => {
      const result = await system.executeTool('content_generation_content_generation', {
        operation: 'list',
        params: { items: ['item1', 'item2', 'item3'], format: 'bullet' }
      });

      expect(result.success).toBe(true);
      expect(result.result.result).toContain('•');
    });

    it('should generate table', async () => {
      const result = await system.executeTool('content_generation_content_generation', {
        operation: 'table',
        params: {
          data: [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }],
          format: 'markdown'
        }
      });

      expect(result.success).toBe(true);
      expect(result.result.result).toContain('|');
    });

    it('should generate report', async () => {
      const result = await system.executeTool('content_generation_content_generation', {
        operation: 'report',
        params: { data: { title: 'Test', metric1: 100 }, reportType: 'summary' }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('NLP Processing Skill Integration', () => {
    it('should tokenize text', async () => {
      const result = await system.executeTool('nlp_processing_nlp_processing', {
        operation: 'tokenize',
        params: { text: 'Hello world test' }
      });

      expect(result.success).toBe(true);
      expect(result.result.tokenCount).toBe(3);
    });

    it('should detect language', async () => {
      const result = await system.executeTool('nlp_processing_nlp_processing', {
        operation: 'language',
        params: { text: 'The quick brown fox jumps over the lazy dog' }
      });

      expect(result.success).toBe(true);
      expect(result.result.language).toBeDefined();
    });

    it('should extract entities', async () => {
      const result = await system.executeTool('nlp_processing_nlp_processing', {
        operation: 'entities',
        params: { text: 'John works at Google in New York' }
      });

      expect(result.success).toBe(true);
      expect(result.result.entities).toBeDefined();
    });
  });

  describe('Quality Assurance Skill Integration', () => {
    it('should calculate metrics', async () => {
      const result = await system.executeTool('quality_assurance_quality_assurance', {
        operation: 'metrics',
        params: { data: { field1: 'value1', field2: 'value2' } }
      });

      expect(result.success).toBe(true);
      expect(result.result.metrics).toBeDefined();
    });

    it('should detect anomalies', async () => {
      const result = await system.executeTool('quality_assurance_quality_assurance', {
        operation: 'anomalies',
        params: {
          data: [{ value: 10 }, { value: 12 }, { value: 11 }, { value: 100 }],
          field: 'value',
          threshold: 2
        }
      });

      expect(result.success).toBe(true);
    });

    it('should check duplicates', async () => {
      const result = await system.executeTool('quality_assurance_quality_assurance', {
        operation: 'duplicates',
        params: {
          data: [{ id: 1 }, { id: 2 }, { id: 1 }],
          field: 'id'
        }
      });

      expect(result.success).toBe(true);
      expect(result.result.duplicateCount).toBeGreaterThan(0);
    });
  });

  describe('Reporting Skill Integration', () => {
    it('should generate executive summary', async () => {
      const result = await system.executeTool('reporting_reporting', {
        operation: 'executiveSummary',
        params: { data: { title: 'Test Report', metric: 'value' } }
      });

      expect(result.success).toBe(true);
      expect(result.result.report).toContain('EXECUTIVE SUMMARY');
    });

    it('should analyze trends', async () => {
      const result = await system.executeTool('reporting_reporting', {
        operation: 'trends',
        params: {
          data: [{ value: 10 }, { value: 12 }, { value: 15 }],
          field: 'value',
          period: 'monthly'
        }
      });

      expect(result.success).toBe(true);
    });

    it('should compare datasets', async () => {
      const result = await system.executeTool('reporting_reporting', {
        operation: 'comparison',
        params: {
          dataset1: [{ value: 10 }, { value: 20 }],
          dataset2: [{ value: 15 }, { value: 25 }],
          field: 'value'
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool name', async () => {
      const result = await system.executeTool('invalid_tool', {
        operation: 'test',
        params: {}
      });

      expect(result.success).toBe(false);
    });

    it('should handle invalid operation', async () => {
      const result = await system.executeTool('analytics_analytics', {
        operation: 'invalidOp',
        params: { text: 'test' }
      });

      expect(result.success).toBe(false);
    });

    it('should handle missing parameters', async () => {
      const result = await system.executeTool('analytics_analytics', {
        operation: 'analyze',
        params: {}
      });

      expect(result.success).toBe(false);
    });
  });

  describe('System Status', () => {
    it('should report correct status', () => {
      const status = system.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.mcp.toolCount).toBeGreaterThanOrEqual(7);
      expect(status.registry.totalSkills).toBe(7);
    });

    it('should export to JSON', () => {
      const json = system.toJSON();
      expect(json.initialized).toBe(true);
      expect(json.registry).toBeDefined();
    });
  });

  describe('Performance Characteristics', () => {
    it('should execute skill within acceptable time', async () => {
      const start = Date.now();

      await system.executeTool('analytics_analytics', {
        operation: 'analyze',
        params: { text: 'Test text for performance measurement' }
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should handle multiple concurrent operations', async () => {
      const operations = [];

      for (let i = 0; i < 10; i++) {
        operations.push(
          system.executeTool('analytics_analytics', {
            operation: 'analyze',
            params: { text: `Test ${i}` }
          })
        );
      }

      const results = await Promise.all(operations);
      expect(results.every(r => r.success)).toBe(true);
    });
  });
});
