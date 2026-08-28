/**
 * Harvester Tests
 * Tests for data collection, normalization, and pipeline
 */

const Harvester = require('../src/harvester');
const DataCollector = require('../src/data-collector');
const DataNormalizer = require('../src/data-normalizer');

describe('DataCollector', () => {
  let collector;

  beforeEach(() => {
    collector = new DataCollector();
  });

  describe('Source Registration', () => {
    it('registers a source', () => {
      const result = collector.registerSource('test-api', {
        type: 'api',
        endpoint: 'https://api.example.com'
      });

      expect(result.success).toBe(true);
      expect(result.sourceId).toBeDefined();
    });

    it('tracks source statistics', () => {
      const sourceId = collector.registerSource('source1').sourceId;

      const stats = collector.getSourceStats(sourceId);

      expect(stats.sourceId).toBe(sourceId);
      expect(stats.totalBatches).toBe(0);
    });
  });

  describe('Data Collection', () => {
    it('collects from a source', async () => {
      const sourceId = collector.registerSource('test-source').sourceId;

      const result = await collector.collectFromSource(sourceId);

      expect(result.success).toBe(true);
      expect(result.batchId).toBeDefined();
      expect(result.itemCount).toBeGreaterThanOrEqual(0);
    });

    it('collects from multiple sources', async () => {
      const id1 = collector.registerSource('source1').sourceId;
      const id2 = collector.registerSource('source2').sourceId;

      const result = await collector.collectFromSources([id1, id2]);

      expect(result.success).toBe(true);
      expect(result.totalSources).toBe(2);
    });
  });

  describe('Batch Management', () => {
    it('retrieves batch', async () => {
      const sourceId = collector.registerSource('test').sourceId;
      const collection = await collector.collectFromSource(sourceId);

      const batch = collector.getBatch(collection.batchId);

      expect(batch).toBeDefined();
      expect(batch.sourceId).toBe(sourceId);
    });

    it('lists batches', async () => {
      const sourceId = collector.registerSource('test').sourceId;
      await collector.collectFromSource(sourceId);

      const batches = collector.listBatches();

      expect(batches.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('provides collection statistics', async () => {
      const sourceId = collector.registerSource('test').sourceId;
      await collector.collectFromSource(sourceId);

      const stats = collector.getStatistics();

      expect(stats.totalSources).toBeGreaterThan(0);
      expect(stats.totalBatches).toBeGreaterThan(0);
    });
  });
});

describe('DataNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  describe('Format Detection', () => {
    it('detects JSON format', () => {
      const format = normalizer.detectFormat('{"key": "value"}');

      expect(format).toBe('json');
    });

    it('detects CSV format', () => {
      const format = normalizer.detectFormat('header1,header2\nvalue1,value2');

      expect(format).toBe('csv');
    });

    it('detects object format', () => {
      const format = normalizer.detectFormat({ key: 'value' });

      expect(format).toBe('object');
    });
  });

  describe('Normalization', () => {
    it('normalizes data', () => {
      const result = normalizer.normalize({ id: 1, name: 'Test' });

      expect(result.success).toBe(true);
      expect(result.normalized).toBeDefined();
    });

    it('handles batch normalization', () => {
      const items = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' }
      ];

      const result = normalizer.normalizeBatch(items);

      expect(result.success).toBe(true);
      expect(result.results.length).toBe(2);
    });
  });

  describe('Deduplication', () => {
    it('detects duplicates', () => {
      const item = { id: 1, name: 'Test' };

      const result1 = normalizer.normalize(item);
      const result2 = normalizer.normalize(item);

      expect(result1.isDuplicate).toBe(false);
      expect(result2.isDuplicate).toBe(true);
    });

    it('provides deduplication statistics', () => {
      normalizer.normalize({ id: 1 });
      normalizer.normalize({ id: 1 });
      normalizer.normalize({ id: 2 });

      const stats = normalizer.getDeduplicationStats();

      expect(stats.duplicates).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('validates against schema', () => {
      normalizer.registerSchema('test', {
        id: 'number',
        name: 'string'
      });

      const result = normalizer.validate(
        { id: 1, name: 'Test' },
        'test'
      );

      expect(result.valid).toBe(true);
    });

    it('detects invalid data', () => {
      normalizer.registerSchema('test', {
        id: 'number'
      });

      const result = normalizer.validate(
        { id: 'not-a-number' },
        'test'
      );

      expect(result.valid).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('provides normalization statistics', () => {
      normalizer.normalize({ id: 1 });

      const stats = normalizer.getStatistics();

      expect(stats.totalNormalizations).toBe(1);
      expect(stats.successRate).toBeGreaterThan(0);
    });
  });
});

describe('Harvester', () => {
  let harvester;

  beforeEach(() => {
    harvester = new Harvester();
  });

  describe('Pipeline Definition', () => {
    it('defines a pipeline', () => {
      const result = harvester.definePipeline('test-pipeline', {
        sources: [{ name: 'source1', type: 'api' }]
      });

      expect(result.success).toBe(true);
      expect(result.pipelineId).toBeDefined();
    });

    it('retrieves pipeline', () => {
      const pipeline = harvester.definePipeline('test', {
        sources: []
      });

      const retrieved = harvester.getPipeline(pipeline.pipelineId);

      expect(retrieved.name).toBe('test');
    });

    it('lists pipelines', () => {
      harvester.definePipeline('pipeline1', { sources: [] });
      harvester.definePipeline('pipeline2', { sources: [] });

      const pipelines = harvester.listPipelines();

      expect(pipelines.length).toBe(2);
    });
  });

  describe('Pipeline Execution', () => {
    it('executes a pipeline', async () => {
      const pipelineId = harvester.definePipeline('test', {
        sources: [{ name: 'source1', type: 'api' }]
      }).pipelineId;

      const result = await harvester.executePipeline(pipelineId);

      expect(result.success).toBe(true);
      expect(result.runId).toBeDefined();
    });

    it('tracks collection metrics', async () => {
      const pipelineId = harvester.definePipeline('test', {
        sources: [{ name: 'source1', type: 'api' }]
      }).pipelineId;

      const result = await harvester.executePipeline(pipelineId);

      expect(result.collected).toBeGreaterThanOrEqual(0);
      expect(result.normalized).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Schema Registration', () => {
    it('registers a schema', () => {
      const result = harvester.registerSchema('test-format', {
        id: 'number',
        data: 'string'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Run History', () => {
    it('retrieves run history', async () => {
      const pipelineId = harvester.definePipeline('test', {
        sources: [{ name: 'source1' }]
      }).pipelineId;

      await harvester.executePipeline(pipelineId);

      const history = harvester.getRunHistory();

      expect(history.length).toBeGreaterThan(0);
    });

    it('filters history by pipeline', async () => {
      const id1 = harvester.definePipeline('p1', {
        sources: [{ name: 's1' }]
      }).pipelineId;

      const id2 = harvester.definePipeline('p2', {
        sources: [{ name: 's2' }]
      }).pipelineId;

      await harvester.executePipeline(id1);
      await harvester.executePipeline(id2);

      const history = harvester.getRunHistory(id1);

      expect(history.every(r => r.pipelineId === id1)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('provides harvest statistics', async () => {
      const pipelineId = harvester.definePipeline('test', {
        sources: [{ name: 'source1' }]
      }).pipelineId;

      await harvester.executePipeline(pipelineId);

      const stats = harvester.getStatistics();

      expect(stats.totalPipelines).toBeGreaterThan(0);
      expect(stats.totalRuns).toBeGreaterThan(0);
    });
  });

  describe('Data Cleanup', () => {
    it('clears old data', () => {
      const result = harvester.clearOldData(0); // Clear everything

      expect(result.success).toBe(true);
    });
  });
});

describe('Integration: Full Harvest Pipeline', () => {
  let harvester;

  beforeEach(() => {
    harvester = new Harvester();
  });

  it('handles complete harvest workflow', async () => {
    // Define pipeline
    const pipelineId = harvester.definePipeline('complete-test', {
      sources: [
        { name: 'api-source', type: 'api' },
        { name: 'db-source', type: 'database' }
      ],
      normalizeFormat: 'json',
      deduplicate: true,
      validate: true
    }).pipelineId;

    // Register schema
    harvester.registerSchema('json', {
      id: 'number',
      data: 'string'
    });

    // Execute pipeline
    const result = await harvester.executePipeline(pipelineId);

    expect(result.success).toBe(true);

    // Check statistics
    const stats = harvester.getStatistics();

    expect(stats.totalPipelines).toBe(1);
    expect(stats.totalRuns).toBeGreaterThan(0);
    expect(stats.totalItemsCollected).toBeGreaterThanOrEqual(0);

    // Check history
    const history = harvester.getRunHistory(pipelineId);

    expect(history.length).toBeGreaterThan(0);
  });
});
