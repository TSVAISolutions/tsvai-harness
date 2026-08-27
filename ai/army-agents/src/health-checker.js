/**
 * Health Checker
 * Monitors system health and raises alerts
 * Checks agent status, queue depth, error rates, and performance
 */

class HealthChecker {
  constructor(registry, taskQueue, metricsCollector, config = {}) {
    this.registry = registry;
    this.taskQueue = taskQueue;
    this.metricsCollector = metricsCollector;
    this.config = {
      checkInterval: config.checkInterval || 30000, // 30 seconds
      alertThreshold: config.alertThreshold || 0.1, // 10% error rate
      queueThreshold: config.queueThreshold || 1000,
      agentTimeout: config.agentTimeout || 60000, // 60 seconds
      ...config
    };

    this.checks = new Map();
    this.alerts = [];
    this.alertCounter = 0;
    this.checkResults = [];
  }

  /**
   * Register a health check
   */
  registerCheck(name, checkFn) {
    this.checks.set(name, checkFn);

    return { success: true, checkName: name };
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    const timestamp = new Date().toISOString();
    const results = {};

    for (const [name, checkFn] of this.checks.entries()) {
      try {
        results[name] = await checkFn();
      } catch (error) {
        results[name] = {
          status: 'failed',
          error: error.message
        };
      }
    }

    // Built-in checks
    results.agents = this._checkAgentHealth();
    results.queue = this._checkQueueHealth();
    results.errors = this._checkErrorRate();
    results.performance = this._checkPerformance();

    const checkResult = {
      timestamp,
      results,
      overallStatus: this._calculateOverallStatus(results),
      alerts: this._generateAlerts(results)
    };

    this.checkResults.push(checkResult);

    // Keep history bounded
    if (this.checkResults.length > 100) {
      this.checkResults.shift();
    }

    return checkResult;
  }

  /**
   * Get current health status
   */
  getStatus() {
    if (this.checkResults.length === 0) {
      return { status: 'unknown', message: 'No checks run yet' };
    }

    const latest = this.checkResults[this.checkResults.length - 1];

    return {
      status: latest.overallStatus,
      timestamp: latest.timestamp,
      results: latest.results,
      alerts: latest.alerts
    };
  }

  /**
   * Get active alerts
   */
  getAlerts(limit = 50) {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    const count = this.alerts.length;
    this.alerts = [];

    return { success: true, clearedCount: count };
  }

  /**
   * Get check history
   */
  getHistory(limit = 50) {
    return this.checkResults
      .slice(-limit)
      .map(result => ({
        timestamp: result.timestamp,
        status: result.overallStatus,
        alertCount: result.alerts.length
      }));
  }

  /**
   * Get detailed report
   */
  getDetailedReport() {
    const latest = this.checkResults[this.checkResults.length - 1] || {};

    return {
      timestamp: new Date().toISOString(),
      status: latest.overallStatus,
      checks: latest.results,
      alerts: this.alerts,
      history: this.getHistory(24),
      recommendations: this._generateRecommendations(latest.results)
    };
  }

  // ============ Private Methods ============

  _checkAgentHealth() {
    const agents = this.registry.listAgents();
    const healthy = agents.filter(a => a.healthy).length;
    const total = agents.length;

    const status = healthy === total
      ? 'healthy'
      : healthy >= Math.ceil(total * 0.8)
        ? 'degraded'
        : 'unhealthy';

    return {
      status,
      healthy,
      total,
      healthyPercentage: Math.round((healthy / total) * 100)
    };
  }

  _checkQueueHealth() {
    const stats = this.taskQueue.getStatistics();
    const queueLength = stats.queueLength;

    const status = queueLength <= this.config.queueThreshold
      ? 'healthy'
      : queueLength <= this.config.queueThreshold * 2
        ? 'degraded'
        : 'unhealthy';

    return {
      status,
      queueLength,
      threshold: this.config.queueThreshold,
      byStatus: stats.byStatus
    };
  }

  _checkErrorRate() {
    const errorStats = this.metricsCollector.getErrorRate();
    const errorRate = errorStats.errorRate / 100;

    const status = errorRate <= this.config.alertThreshold
      ? 'healthy'
      : errorRate <= this.config.alertThreshold * 2
        ? 'degraded'
        : 'unhealthy';

    return {
      status,
      errorRate: Math.round(errorStats.errorRate * 100) / 100,
      threshold: this.config.alertThreshold * 100,
      recentErrors: errorStats.errors
    };
  }

  _checkPerformance() {
    const latency = this.metricsCollector.getLatencyPercentiles();

    const status = latency.p99 < 1000
      ? 'healthy'
      : latency.p99 < 5000
        ? 'degraded'
        : 'unhealthy';

    return {
      status,
      latency: {
        p50: latency.p50,
        p95: latency.p95,
        p99: latency.p99
      }
    };
  }

  _calculateOverallStatus(results) {
    const statuses = Object.values(results)
      .filter(r => r.status)
      .map(r => r.status);

    const hasUnhealthy = statuses.includes('unhealthy');
    const hasDegraded = statuses.includes('degraded');

    return hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
  }

  _generateAlerts(results) {
    const alerts = [];

    if (results.agents?.status === 'unhealthy') {
      alerts.push({
        id: `alert-${++this.alertCounter}`,
        severity: 'critical',
        message: `Only ${results.agents.healthy}/${results.agents.total} agents healthy`,
        timestamp: new Date().toISOString()
      });
      this.alerts.push(alerts[alerts.length - 1]);
    }

    if (results.queue?.status === 'unhealthy') {
      alerts.push({
        id: `alert-${++this.alertCounter}`,
        severity: 'warning',
        message: `Task queue exceeds threshold: ${results.queue.queueLength} > ${results.queue.threshold}`,
        timestamp: new Date().toISOString()
      });
      this.alerts.push(alerts[alerts.length - 1]);
    }

    if (results.errors?.status === 'unhealthy') {
      alerts.push({
        id: `alert-${++this.alertCounter}`,
        severity: 'critical',
        message: `Error rate exceeds threshold: ${results.errors.errorRate}% > ${results.errors.threshold}%`,
        timestamp: new Date().toISOString()
      });
      this.alerts.push(alerts[alerts.length - 1]);
    }

    if (results.performance?.status === 'unhealthy') {
      alerts.push({
        id: `alert-${++this.alertCounter}`,
        severity: 'warning',
        message: `P99 latency exceeds threshold: ${results.performance.latency.p99}ms`,
        timestamp: new Date().toISOString()
      });
      this.alerts.push(alerts[alerts.length - 1]);
    }

    // Keep history bounded
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    return alerts;
  }

  _generateRecommendations(results) {
    const recommendations = [];

    if (results.agents?.status === 'unhealthy') {
      recommendations.push('Investigate unhealthy agents and restart failed instances');
      recommendations.push('Check agent logs for errors');
    }

    if (results.queue?.status === 'unhealthy') {
      recommendations.push('Scale up agent count to process queue faster');
      recommendations.push('Review task allocation strategy');
    }

    if (results.errors?.status === 'unhealthy') {
      recommendations.push('Review error logs to identify root cause');
      recommendations.push('Consider implementing retry logic');
    }

    if (results.performance?.status === 'unhealthy') {
      recommendations.push('Optimize agent processing speed');
      recommendations.push('Consider caching frequently accessed data');
    }

    return recommendations;
  }
}

module.exports = HealthChecker;
