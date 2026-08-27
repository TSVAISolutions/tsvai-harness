# Monitoring & Logging Guide

Complete guide to monitoring Army-Agents system health and performance.

## Overview

Phase 4 provides comprehensive observability with three core components:

- **Event Logger** - Structured logging for all operations
- **Metrics Collector** - Performance metrics and analytics
- **Health Checker** - System health monitoring and alerting

## Event Logger

Centralized logging system with filtering, export, and real-time handlers.

```javascript
const EventLogger = require('./src/event-logger');
const logger = new EventLogger({
  level: 'info',  // 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  format: 'json',
  maxEntries: 10000
});
```

### Log Events

Log events at different levels:

```javascript
logger.debug('source', 'Debug message', { key: 'value' });
logger.info('source', 'Info message', { key: 'value' });
logger.warn('source', 'Warning message', { key: 'value' });
logger.error('source', 'Error message', { key: 'value' });
logger.fatal('source', 'Fatal message', { key: 'value' });
```

### Convenience Methods

Domain-specific logging:

```javascript
// Workflow logging
logger.logWorkflowEvent('exec-123', 'started', { step: 'step1' });
logger.logWorkflowEvent('exec-123', 'completed', { duration: 1234 });

// Agent logging
logger.logAgentEvent('agent-1', 'registered', { capabilities: ['analyze'] });
logger.logAgentEvent('agent-1', 'heartbeat', { healthy: true });

// Task logging
logger.logTaskEvent('task-1', 'queued', { priority: 1 });
logger.logTaskEvent('task-1', 'completed', { result: 'success' });

// Consensus logging
logger.logConsensusEvent('prop-1', 'voting', { voters: 3 });
logger.logConsensusEvent('prop-1', 'decided', { outcome: 'yes' });
```

### Filter Events

Retrieve logs with flexible filtering:

```javascript
// By level
const errors = logger.getLogsByLevel('error');

// By source
const workflowLogs = logger.getLogsBySource('workflow');

// By time range
const recentEvents = logger.getEvents({
  startTime: new Date(Date.now() - 3600000),  // Last hour
  endTime: new Date()
});

// Search
const matching = logger.search('dataprocessing');

// Combined
const criticalWorkflows = logger.getEvents({
  source: 'workflow',
  minLevel: 'error',
  search: 'pipeline'
}, 50);

// Recent errors for troubleshooting
const recent = logger.getRecentErrors(minutes = 10);
```

### Event Handlers

React to events in real-time:

```javascript
// Register handler
logger.on((event) => {
  if (event.level === 'error') {
    // Send alert to monitoring system
    alertSystem.send({
      severity: 'critical',
      message: event.message,
      source: event.source
    });
  }
});

// Multiple handlers
logger.on(event => console.log(event));
logger.on(event => persistToDatabase(event));
logger.on(event => sendMetrics(event));

// Unregister
logger.off(handler);
```

### Export Logs

Extract logs for analysis:

```javascript
// Export as JSON
const json = logger.exportJSON();
fs.writeFileSync('logs.json', json);

// Export as CSV
const csv = logger.exportCSV();
fs.writeFileSync('logs.csv', csv);
```

### Statistics

Monitor logging activity:

```javascript
const stats = logger.getStatistics();
// {
//   totalEvents: 1250,
//   byLevel: { debug: 100, info: 900, warn: 200, error: 50 },
//   bySource: { workflow: 400, agent: 500, task: 300, consensus: 50 },
//   totalErrors: 50,
//   timestamp: '2026-08-28T...'
// }
```

## Metrics Collector

Track performance metrics with aggregations and percentile analysis.

```javascript
const MetricsCollector = require('./src/metrics-collector');
const collector = new MetricsCollector({
  maxMetrics: 5000,
  aggregationWindow: 60000  // 1 minute
});
```

### Record Metrics

Capture performance data:

```javascript
// Generic metric
collector.recordMetric('operation_duration', 150, { service: 'api' });

// Domain-specific
collector.recordWorkflowMetric('exec-123', 'latency', 450);
collector.recordAgentMetric('agent-1', 'cpu_usage', 45);
collector.recordTaskMetric('task-1', 'queue_time', 250);
```

### Analyze Metrics

Calculate aggregates and percentiles:

```javascript
// Get aggregates
const latencyStats = collector.getAggregates('latency');
// {
//   name: 'latency',
//   count: 1000,
//   min: 10,
//   max: 5000,
//   avg: 250,
//   p50: 150,
//   p95: 1200,
//   p99: 3500
// }

// Get percentiles
const percentiles = collector.getLatencyPercentiles('latency');
// { p50: 150, p95: 1200, p99: 3500, max: 5000, count: 1000 }

// Time series
const timeSeries = collector.getTimeSeriesAggregates('latency', 60000);
// [
//   { timestamp: '2026-08-28T12:00:00Z', count: 50, avg: 245, p95: 1150 },
//   { timestamp: '2026-08-28T12:01:00Z', count: 48, avg: 260, p95: 1280 },
//   ...
// ]
```

### Performance Analysis

Calculate throughput and error rates:

```javascript
// Throughput (operations per second)
const throughput = collector.getThroughput('operation', 60);
// { metricName: 'operation', windowSeconds: 60, count: 300, throughputPerSecond: 5 }

// Error rate
const errorRate = collector.getErrorRate();
// { totalMetrics: 1000, errors: 50, errorRate: 5 }  // 5%

// Error rate in time range
const recentErrors = collector.getErrorRate(
  new Date(Date.now() - 3600000),  // 1 hour ago
  new Date()
);
```

### Dashboards

Get ready-to-use metrics for dashboards:

```javascript
// Operation statistics
const stats = collector.getOperationStats();
// {
//   latency: { count: 1000, min: 10, max: 5000, avg: 250 },
//   throughput: { count: 50, min: 4, max: 6, avg: 5 },
//   ...
// }

// Health dashboard
const dashboard = collector.getHealthDashboard();
// {
//   timestamp: '2026-08-28T...',
//   totalMetrics: 1500,
//   errorRate: 1.2,
//   latency: { p50: 150, p95: 1200, p99: 3500 },
//   throughput: 5.2,
//   health: { status: 'healthy', score: 95 }
// }
```

## Health Checker

Continuous system health monitoring with alerts.

```javascript
const HealthChecker = require('./src/health-checker');
const checker = new HealthChecker(registry, taskQueue, metricsCollector, {
  checkInterval: 30000,      // 30 seconds
  alertThreshold: 0.1,       // 10% error rate
  queueThreshold: 1000,      // Max pending tasks
  agentTimeout: 60000        // 60 seconds
});
```

### Register Checks

Add custom health checks:

```javascript
checker.registerCheck('database', async () => {
  const connected = await db.ping();
  return {
    status: connected ? 'healthy' : 'unhealthy',
    responseTime: Date.now()
  };
});

checker.registerCheck('cache', async () => {
  const available = await cache.check();
  return {
    status: available ? 'healthy' : 'degraded'
  };
});
```

### Run Checks

Execute all checks:

```javascript
const result = await checker.runChecks();
// {
//   timestamp: '2026-08-28T...',
//   results: {
//     agents: { status: 'healthy', healthy: 8, total: 10 },
//     queue: { status: 'healthy', queueLength: 45 },
//     errors: { status: 'healthy', errorRate: 0.5 },
//     performance: { status: 'healthy', latency: { p99: 450 } },
//     database: { status: 'healthy', responseTime: 23 },
//     cache: { status: 'healthy' }
//   },
//   overallStatus: 'healthy',
//   alerts: []
// }
```

### Monitor Status

Check current health:

```javascript
// Current status
const status = checker.getStatus();
// { status: 'healthy', timestamp: '...', results: {...}, alerts: [] }

// Check history
const history = checker.getHistory(24);
// [
//   { timestamp: '...', status: 'healthy', alertCount: 0 },
//   { timestamp: '...', status: 'degraded', alertCount: 1 },
//   ...
// ]

// Detailed report
const report = checker.getDetailedReport();
// {
//   timestamp: '...',
//   status: 'healthy',
//   checks: {...},
//   alerts: [...],
//   history: [...],
//   recommendations: ['...']
// }
```

### Alerts

Monitor and manage alerts:

```javascript
// Get active alerts
const alerts = checker.getAlerts();
// [
//   {
//     id: 'alert-1',
//     severity: 'critical',
//     message: 'Only 2/10 agents healthy',
//     timestamp: '...'
//   },
//   ...
// ]

// Clear alerts
checker.clearAlerts();
```

## Complete Example

Integrated monitoring setup:

```javascript
const EventLogger = require('./src/event-logger');
const MetricsCollector = require('./src/metrics-collector');
const HealthChecker = require('./src/health-checker');
const ArmyAgents = require('./src/army-agents');

// Initialize monitoring
const logger = new EventLogger({ level: 'info' });
const collector = new MetricsCollector();
const checker = new HealthChecker(
  armyAgents.registry,
  armyAgents.queue,
  collector
);

// Set up alerting
logger.on(event => {
  if (event.level === 'error' || event.level === 'fatal') {
    // Send to monitoring system
    alerting.notify({
      source: 'army-agents',
      level: event.level,
      message: event.message,
      timestamp: event.timestamp
    });
  }
});

// Periodic health checks
setInterval(async () => {
  const health = await checker.runChecks();

  if (health.overallStatus !== 'healthy') {
    logger.warn('health', 'System degradation detected', {
      status: health.overallStatus,
      alerts: health.alerts
    });
  }

  // Send metrics
  collector.recordMetric('health_score', health.score);
}, 30000);

// Log workflow events
orchestrator.on('workflow:start', (execution) => {
  logger.logWorkflowEvent(execution.id, 'started', {
    workflowId: execution.workflowId
  });
  collector.recordWorkflowMetric(execution.id, 'start', 1);
});

orchestrator.on('workflow:complete', (execution) => {
  logger.logWorkflowEvent(execution.id, 'completed', {
    duration: execution.duration,
    status: execution.status
  });
  collector.recordWorkflowMetric(
    execution.id,
    'duration',
    execution.duration
  );
});

// Export logs periodically
setInterval(() => {
  const timestamp = new Date().toISOString();
  const logs = logger.exportJSON();
  fs.writeFileSync(`logs/${timestamp}.json`, logs);
}, 3600000); // Every hour
```

## Best Practices

1. **Use structured logging** - Include context tags for filtering
2. **Record early and often** - Capture metrics at operation boundaries
3. **Set appropriate thresholds** - Alert on real problems, not noise
4. **Monitor the monitors** - Track logging and metrics system health
5. **Retain logs** - Keep searchable history for troubleshooting
6. **Regular exports** - Archive old logs for compliance
7. **Dashboard integration** - Push metrics to dashboards regularly
8. **Custom checks** - Add domain-specific health checks

## Troubleshooting

| Issue | Solution |
|-------|----------|
| High memory usage | Reduce maxMetrics/maxEntries |
| Missing logs | Check log level setting |
| Alerts too noisy | Adjust thresholds and conditions |
| Slow queries | Use startTime/endTime filters |
| Stale data | Verify metrics are being recorded |

## Performance Considerations

- **Logger**: O(1) per event, bounded by maxEntries
- **Metrics**: O(n) aggregation, O(log n) for sorted access
- **Health**: O(checks) per run, runs periodically not on-demand

## Next Steps

- Connect to external monitoring systems (Datadog, New Relic, etc.)
- Build custom dashboards for operational metrics
- Set up alerting rules for SLA violations
- Create runbooks for common alerts
- Integrate with incident management

---

**Version:** 1.0.0  
**Status:** Production-Ready  
**Last Updated:** 2026-08-28
