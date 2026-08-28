/**
 * Data Collector
 * Collects data from multiple sources
 * Handles format discovery, normalization, and ingestion
 */

class DataCollector {
  constructor(config = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize || 1000,
      maxSources: config.maxSources || 100,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      ...config
    };

    this.sources = new Map(); // sourceId -> source config
    this.batches = new Map(); // batchId -> batch data
    this.collections = [];
    this.sourceCounter = 0;
    this.batchCounter = 0;
  }

  /**
   * Register a data source
   */
  registerSource(name, config = {}) {
    if (this.sources.size >= this.config.maxSources) {
      return { success: false, error: 'Max sources reached' };
    }

    const sourceId = `source-${++this.sourceCounter}`;

    const source = {
      id: sourceId,
      name,
      type: config.type || 'generic',
      config: {
        ...config,
        retries: config.retries || this.config.retries,
        timeout: config.timeout || this.config.timeout
      },
      registered: new Date().toISOString(),
      status: 'active',
      stats: {
        itemsCollected: 0,
        errors: 0,
        lastCollection: null
      }
    };

    this.sources.set(sourceId, source);

    return { success: true, sourceId };
  }

  /**
   * Collect data from source
   */
  async collectFromSource(sourceId, options = {}) {
    const source = this.sources.get(sourceId);

    if (!source) {
      return { success: false, error: `Source not found: ${sourceId}` };
    }

    const batchId = `batch-${++this.batchCounter}`;

    const batch = {
      id: batchId,
      sourceId,
      sourceName: source.name,
      status: 'collecting',
      items: [],
      errors: [],
      started: new Date().toISOString(),
      completed: null,
      itemCount: 0,
      errorCount: 0
    };

    this.batches.set(batchId, batch);

    try {
      // Simulate data collection (in real scenario, would call actual source)
      const items = await this._fetchFromSource(source, options);

      batch.items = items;
      batch.itemCount = items.length;
      batch.status = 'completed';
      batch.completed = new Date().toISOString();

      source.stats.itemsCollected += items.length;
      source.stats.lastCollection = new Date().toISOString();

      this.collections.push({
        batchId,
        sourceId,
        timestamp: batch.completed,
        itemCount: items.length
      });

      return {
        success: true,
        batchId,
        itemCount: items.length,
        items
      };
    } catch (error) {
      batch.status = 'failed';
      batch.errors.push(error.message);
      batch.errorCount = 1;
      batch.completed = new Date().toISOString();

      source.stats.errors++;

      return {
        success: false,
        batchId,
        error: error.message
      };
    }
  }

  /**
   * Collect from multiple sources
   */
  async collectFromSources(sourceIds, options = {}) {
    const results = [];

    for (const sourceId of sourceIds) {
      const result = await this.collectFromSource(sourceId, options);
      results.push(result);
    }

    return {
      success: true,
      totalSources: sourceIds.length,
      results,
      totalItems: results.reduce((sum, r) => sum + (r.itemCount || 0), 0)
    };
  }

  /**
   * Get batch
   */
  getBatch(batchId) {
    const batch = this.batches.get(batchId);

    if (!batch) {
      return null;
    }

    return batch;
  }

  /**
   * List batches
   */
  listBatches(sourceId = null, limit = 50) {
    let batches = Array.from(this.batches.values());

    if (sourceId) {
      batches = batches.filter(b => b.sourceId === sourceId);
    }

    return batches
      .sort((a, b) => new Date(b.started) - new Date(a.started))
      .slice(0, limit);
  }

  /**
   * Get collection history
   */
  getHistory(sourceId = null, limit = 100) {
    let history = this.collections;

    if (sourceId) {
      history = history.filter(h => h.sourceId === sourceId);
    }

    return history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get source statistics
   */
  getSourceStats(sourceId) {
    const source = this.sources.get(sourceId);

    if (!source) {
      return null;
    }

    const batches = Array.from(this.batches.values())
      .filter(b => b.sourceId === sourceId);

    const successCount = batches.filter(b => b.status === 'completed').length;

    return {
      sourceId,
      name: source.name,
      type: source.type,
      status: source.status,
      totalBatches: batches.length,
      successfulBatches: successCount,
      successRate: batches.length > 0
        ? Math.round((successCount / batches.length) * 100)
        : 0,
      stats: source.stats
    };
  }

  /**
   * Get overall statistics
   */
  getStatistics() {
    const sources = Array.from(this.sources.values());
    const batches = Array.from(this.batches.values());

    const byStatus = {
      active: 0,
      paused: 0,
      error: 0
    };

    sources.forEach(s => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });

    const totalItems = batches.reduce((sum, b) => sum + b.itemCount, 0);
    const totalErrors = batches.reduce((sum, b) => sum + b.errorCount, 0);

    return {
      totalSources: sources.length,
      totalBatches: batches.length,
      totalItemsCollected: totalItems,
      totalErrors,
      sourceStatus: byStatus,
      collections: this.collections.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old data
   */
  clearOldData(olderThanDays = 30) {
    const cutoff = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));

    const toDelete = [];

    for (const [batchId, batch] of this.batches.entries()) {
      if (new Date(batch.completed || batch.started) < cutoff) {
        toDelete.push(batchId);
      }
    }

    toDelete.forEach(id => this.batches.delete(id));

    return { success: true, clearedCount: toDelete.length };
  }

  // ============ Private Methods ============

  async _fetchFromSource(source, options) {
    // Simulate fetching from source
    // In real scenario, would call actual API/service
    const mockData = [
      { id: 1, value: 'data1', timestamp: new Date().toISOString() },
      { id: 2, value: 'data2', timestamp: new Date().toISOString() },
      { id: 3, value: 'data3', timestamp: new Date().toISOString() }
    ];

    return mockData;
  }
}

module.exports = DataCollector;
