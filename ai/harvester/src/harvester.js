/**
 * Harvester
 * Data collection and ingestion pipeline
 * Orchestrates collection, normalization, and deduplication
 */

const DataCollector = require('./data-collector');
const DataNormalizer = require('./data-normalizer');

class Harvester {
  constructor(config = {}) {
    this.config = config;

    this.collector = new DataCollector(config.collector || {});
    this.normalizer = new DataNormalizer(config.normalizer || {});

    this.pipelines = new Map(); // pipelineId -> pipeline config
    this.runs = []; // execution history
    this.pipelineCounter = 0;
  }

  /**
   * Define a harvest pipeline
   */
  definePipeline(name, config) {
    const pipelineId = `pipeline-${++this.pipelineCounter}`;

    const pipeline = {
      id: pipelineId,
      name,
      sources: config.sources || [],
      normalizeFormat: config.normalizeFormat || 'json',
      deduplicate: config.deduplicate !== false,
      validate: config.validate !== false,
      schedule: config.schedule || null,
      created: new Date().toISOString(),
      lastRun: null,
      runCount: 0
    };

    this.pipelines.set(pipelineId, pipeline);

    // Register sources
    config.sources?.forEach(source => {
      this.collector.registerSource(source.name, source);
    });

    return { success: true, pipelineId };
  }

  /**
   * Execute a harvest pipeline
   */
  async executePipeline(pipelineId) {
    const pipeline = this.pipelines.get(pipelineId);

    if (!pipeline) {
      return { success: false, error: `Pipeline not found: ${pipelineId}` };
    }

    const run = {
      id: `run-${Date.now()}`,
      pipelineId,
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      collected: 0,
      normalized: 0,
      deduplicated: 0,
      errors: []
    };

    try {
      // Collect from all sources
      const sourceIds = Array.from(this.collector.sources.keys());
      const collectionResult = await this.collector.collectFromSources(sourceIds);

      run.collected = collectionResult.totalItems;

      // Normalize data
      let normalizedItems = [];

      for (const collectionItem of collectionResult.results) {
        if (collectionItem.success && collectionItem.items) {
          const normalizationResult = this.normalizer.normalizeBatch(
            collectionItem.items,
            { format: pipeline.normalizeFormat }
          );

          if (normalizationResult.success) {
            normalizedItems.push(...normalizationResult.results);
            run.normalized += normalizationResult.statistics.success;
            run.deduplicated += normalizationResult.statistics.duplicates;
          }
        }
      }

      // Validate if enabled
      if (pipeline.validate) {
        const validationResults = normalizedItems.map(item => {
          if (item.success) {
            return this.normalizer.validate(item.normalized, pipeline.normalizeFormat);
          }

          return { valid: false };
        });

        const invalidCount = validationResults.filter(v => !v.valid).length;

        if (invalidCount > 0) {
          run.errors.push(`${invalidCount} items failed validation`);
        }
      }

      run.status = 'completed';
      run.completedAt = new Date().toISOString();

      pipeline.lastRun = new Date().toISOString();
      pipeline.runCount++;

      this.runs.push(run);

      return {
        success: true,
        runId: run.id,
        collected: run.collected,
        normalized: run.normalized,
        deduplicated: run.deduplicated,
        errors: run.errors
      };
    } catch (error) {
      run.status = 'failed';
      run.completedAt = new Date().toISOString();
      run.errors.push(error.message);

      this.runs.push(run);

      return {
        success: false,
        runId: run.id,
        error: error.message
      };
    }
  }

  /**
   * Register a schema for normalization
   */
  registerSchema(format, schema) {
    return this.normalizer.registerSchema(format, schema);
  }

  /**
   * Get pipeline
   */
  getPipeline(pipelineId) {
    return this.pipelines.get(pipelineId) || null;
  }

  /**
   * List pipelines
   */
  listPipelines() {
    return Array.from(this.pipelines.values());
  }

  /**
   * Get run history
   */
  getRunHistory(pipelineId = null, limit = 50) {
    let runs = this.runs;

    if (pipelineId) {
      runs = runs.filter(r => r.pipelineId === pipelineId);
    }

    return runs
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, limit);
  }

  /**
   * Get harvest statistics
   */
  getStatistics() {
    const runs = this.runs;

    const byStatus = {
      running: 0,
      completed: 0,
      failed: 0
    };

    let totalCollected = 0;
    let totalNormalized = 0;
    let totalDeduplicated = 0;

    runs.forEach(run => {
      byStatus[run.status] = (byStatus[run.status] || 0) + 1;
      totalCollected += run.collected;
      totalNormalized += run.normalized;
      totalDeduplicated += run.deduplicated;
    });

    return {
      totalPipelines: this.pipelines.size,
      totalRuns: runs.length,
      byStatus,
      totalItemsCollected: totalCollected,
      totalItemsNormalized: totalNormalized,
      totalDuplicatesDetected: totalDeduplicated,
      collectorStats: this.collector.getStatistics(),
      normalizerStats: this.normalizer.getStatistics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old data
   */
  clearOldData(olderThanDays = 30) {
    const collectorResult = this.collector.clearOldData(olderThanDays);

    this.runs = this.runs.filter(run => {
      const runDate = new Date(run.startedAt);
      const cutoff = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));

      return runDate >= cutoff;
    });

    return {
      success: true,
      clearedBatches: collectorResult.clearedCount,
      clearedRuns: this.runs.length
    };
  }
}

module.exports = Harvester;
