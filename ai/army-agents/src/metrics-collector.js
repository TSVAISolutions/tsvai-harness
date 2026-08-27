/**
 * Metrics Collector
 * Collects and analyzes performance metrics for Army-Agents operations
 * Tracks latency, throughput, error rates, and resource usage
 */

class MetricsCollector {
  constructor(config = {}) {
    this.config = {
      maxMetrics: config.maxMetrics || 5000,
      aggregationWindow: config.aggregationWindow || 60000, // 1 minute
      ...config
    };

    this.metrics = [];
    this.metricCounter = 0;
    this.aggregates = new Map(); // window -> aggregate stats
  }

  /**
   * Record a metric
   */
  recordMetric(name, value, tags = {}) {
    const metric = {
      id: this._generateMetricId(),
      timestamp: new Date().toISOString(),
      name,
      value,
      tags,
      unixTime: Date.now()
    };

    this.metrics.push(metric);

    // Keep bounded
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift();
    }

    return metric;
  }

  /**
   * Record workflow metrics
   */
  recordWorkflowMetric(executionId, metricName, value, tags = {}) {
    return this.recordMetric(metricName, value, {
      type: 'workflow',
      executionId,
      ...tags
    });
  }

  /**
   * Record agent metrics
   */
  recordAgentMetric(agentId, metricName, value, tags = {}) {
    return this.recordMetric(metricName, value, {
      type: 'agent',
      agentId,
      ...tags
    });
  }

  /**
   * Record task metrics
   */
  recordTaskMetric(taskId, metricName, value, tags = {}) {
    return this.recordMetric(metricName, value, {
      type: 'task',
      taskId,
      ...tags
    });
  }

  /**
   * Get metrics with filtering
   */
  getMetrics(filters = {}, limit = 100) {
    let filtered = [...this.metrics];

    if (filters.name) {
      filtered = filtered.filter(m => m.name === filters.name);
    }

    if (filters.tag) {
      const [key, value] = filters.tag;
      filtered = filtered.filter(m => m.tags[key] === value);
    }

    if (filters.startTime) {
      const start = new Date(filters.startTime).getTime();
      filtered = filtered.filter(m => m.unixTime >= start);
    }

    if (filters.endTime) {
      const end = new Date(filters.endTime).getTime();
      filtered = filtered.filter(m => m.unixTime <= end);
    }

    return filtered.slice(-limit);
  }

  /**
   * Calculate aggregate statistics
   */
  getAggregates(metricName, startTime = null, endTime = null) {
    let metrics = this.getMetrics({ name: metricName });

    if (startTime) {
      metrics = metrics.filter(m => new Date(m.timestamp) >= new Date(startTime));
    }

    if (endTime) {
      metrics = metrics.filter(m => new Date(m.timestamp) <= new Date(endTime));
    }

    if (metrics.length === 0) {
      return {
        name: metricName,
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        p50: 0,
        p95: 0,
        p99: 0
      };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);

    return {
      name: metricName,
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: this._percentile(values, 50),
      p95: this._percentile(values, 95),
      p99: this._percentile(values, 99)
    };
  }

  /**
   * Get per-minute aggregates
   */
  getTimeSeriesAggregates(metricName, windowSize = 60000) {
    const metrics = this.getMetrics({ name: metricName });

    if (metrics.length === 0) return [];

    const windows = new Map();

    metrics.forEach(metric => {
      const windowTime = Math.floor(metric.unixTime / windowSize) * windowSize;

      if (!windows.has(windowTime)) {
        windows.set(windowTime, []);
      }

      windows.get(windowTime).push(metric.value);
    });

    const result = [];

    for (const [windowTime, values] of windows.entries()) {
      values.sort((a, b) => a - b);

      result.push({
        timestamp: new Date(windowTime).toISOString(),
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        p95: this._percentile(values, 95)
      });
    }

    return result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Get latency percentiles
   */
  getLatencyPercentiles(metricName = 'latency') {
    const aggregates = this.getAggregates(metricName);

    return {
      metricName,
      p50: aggregates.p50,
      p95: aggregates.p95,
      p99: aggregates.p99,
      max: aggregates.max,
      count: aggregates.count
    };
  }

  /**
   * Calculate throughput
   */
  getThroughput(metricName, windowSeconds = 60) {
    const endTime = Date.now();
    const startTime = endTime - (windowSeconds * 1000);

    const metrics = this.metrics.filter(m =>
      m.name === metricName &&
      m.unixTime >= startTime &&
      m.unixTime <= endTime
    );

    const throughput = metrics.length / windowSeconds;

    return {
      metricName,
      windowSeconds,
      count: metrics.length,
      throughputPerSecond: Math.round(throughput * 100) / 100
    };
  }

  /**
   * Calculate error rate
   */
  getErrorRate(startTime = null, endTime = null) {
    let allMetrics = [...this.metrics];

    if (startTime) {
      const start = new Date(startTime).getTime();
      allMetrics = allMetrics.filter(m => m.unixTime >= start);
    }

    if (endTime) {
      const end = new Date(endTime).getTime();
      allMetrics = allMetrics.filter(m => m.unixTime <= end);
    }

    const errors = allMetrics.filter(m => m.tags.type === 'error').length;
    const total = allMetrics.length;

    return {
      totalMetrics: total,
      errors,
      errorRate: total > 0 ? Math.round((errors / total) * 10000) / 100 : 0
    };
  }

  /**
   * Get operation statistics
   */
  getOperationStats() {
    const byName = {};

    this.metrics.forEach(metric => {
      if (!byName[metric.name]) {
        byName[metric.name] = [];
      }
      byName[metric.name].push(metric.value);
    });

    const stats = {};

    for (const [name, values] of Object.entries(byName)) {
      values.sort((a, b) => a - b);
      stats[name] = {
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100
      };
    }

    return stats;
  }

  /**
   * Get health dashboard metrics
   */
  getHealthDashboard() {
    const stats = this.getStatistics();
    const errorRate = this.getErrorRate();
    const latency = this.getLatencyPercentiles();
    const throughput = this.getThroughput('operation', 60);

    return {
      timestamp: new Date().toISOString(),
      totalMetrics: stats.totalMetrics,
      errorRate: errorRate.errorRate,
      latency: {
        p50: latency.p50,
        p95: latency.p95,
        p99: latency.p99
      },
      throughput: throughput.throughputPerSecond,
      health: this._calculateHealth(errorRate, latency)
    };
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const byName = {};
    const byType = {};

    this.metrics.forEach(metric => {
      byName[metric.name] = (byName[metric.name] || 0) + 1;
      byType[metric.tags.type] = (byType[metric.tags.type] || 0) + 1;
    });

    return {
      totalMetrics: this.metrics.length,
      byName,
      byType,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear metrics
   */
  clear() {
    const count = this.metrics.length;
    this.metrics = [];
    this.aggregates.clear();

    return { success: true, clearedCount: count };
  }

  // ============ Private Methods ============

  _percentile(sortedValues, percentile) {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  _calculateHealth(errorRate, latency) {
    let score = 100;

    // Deduct for error rate
    if (errorRate.errorRate > 5) score -= 30;
    else if (errorRate.errorRate > 1) score -= 15;

    // Deduct for latency
    if (latency.p99 > 5000) score -= 20;
    else if (latency.p99 > 1000) score -= 10;

    // Status based on score
    if (score >= 90) return { status: 'healthy', score };
    if (score >= 70) return { status: 'degraded', score };
    return { status: 'unhealthy', score };
  }

  _generateMetricId() {
    return `metric-${Date.now()}-${++this.metricCounter}`;
  }
}

module.exports = MetricsCollector;
