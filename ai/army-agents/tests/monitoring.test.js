/**
 * Monitoring & Logging Tests
 * Tests for EventLogger, MetricsCollector, and HealthChecker
 */

const EventLogger = require('../src/event-logger');
const MetricsCollector = require('../src/metrics-collector');
const HealthChecker = require('../src/health-checker');
const AgentRegistry = require('../src/agent-registry');
const TaskQueue = require('../src/task-queue');

describe('EventLogger', () => {
  let logger;

  beforeEach(() => {
    logger = new EventLogger();
  });

  describe('Basic Logging', () => {
    it('logs events with correct structure', () => {
      const event = logger.info('test', 'Test message', { key: 'value' });

      expect(event.id).toBeDefined();
      expect(event.level).toBe('info');
      expect(event.source).toBe('test');
      expect(event.message).toBe('Test message');
      expect(event.data.key).toBe('value');
      expect(event.timestamp).toBeDefined();
    });

    it('respects log level filtering', () => {
      logger.setLevel('warn');

      logger.debug('test', 'Debug message');
      logger.info('test', 'Info message');
      logger.warn('test', 'Warning message');

      const events = logger.getEvents();

      expect(events.length).toBe(1);
      expect(events[0].level).toBe('warn');
    });

    it('logs all severity levels', () => {
      logger.setLevel('debug');

      logger.debug('test', 'Debug');
      logger.info('test', 'Info');
      logger.warn('test', 'Warn');
      logger.error('test', 'Error');
      logger.fatal('test', 'Fatal');

      const events = logger.getEvents({}, 10);

      expect(events.length).toBe(5);
    });
  });

  describe('Convenience Methods', () => {
    it('logs workflow events', () => {
      logger.logWorkflowEvent('exec-123', 'started', { step: 'step1' });

      const events = logger.getEvents({ source: 'workflow' });

      expect(events.length).toBe(1);
      expect(events[0].data.executionId).toBe('exec-123');
    });

    it('logs agent events', () => {
      logger.logAgentEvent('agent-1', 'registered', { capability: 'test' });

      const events = logger.getEvents({ source: 'agent' });

      expect(events.length).toBe(1);
      expect(events[0].data.agentId).toBe('agent-1');
    });

    it('logs task events', () => {
      logger.logTaskEvent('task-1', 'completed', { result: 'success' });

      const events = logger.getEvents({ source: 'task' });

      expect(events.length).toBe(1);
      expect(events[0].data.taskId).toBe('task-1');
    });

    it('logs consensus events', () => {
      logger.logConsensusEvent('prop-1', 'voting', { votes: 3 });

      const events = logger.getEvents({ source: 'consensus' });

      expect(events.length).toBe(1);
    });
  });

  describe('Event Filtering', () => {
    beforeEach(() => {
      logger.setLevel('debug');
      logger.info('source1', 'Message 1');
      logger.info('source2', 'Message 2');
      logger.warn('source1', 'Warning');
      logger.error('source2', 'Error');
    });

    it('filters by level', () => {
      const events = logger.getEvents({ level: 'warn' });

      expect(events.length).toBe(1);
      expect(events[0].level).toBe('warn');
    });

    it('filters by source', () => {
      const events = logger.getEvents({ source: 'source1' });

      expect(events.length).toBe(2);
    });

    it('filters by minimum level', () => {
      const events = logger.getEvents({ minLevel: 'warn' });

      expect(events.length).toBe(2); // warn + error
    });

    it('searches by text', () => {
      const events = logger.getEvents({ search: 'Message 1' });

      expect(events.length).toBe(1);
    });
  });

  describe('Event Export', () => {
    beforeEach(() => {
      logger.info('test', 'Event 1');
      logger.info('test', 'Event 2');
    });

    it('exports as JSON', () => {
      const json = logger.exportJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('exports as CSV', () => {
      const csv = logger.exportCSV();

      expect(csv).toContain('timestamp');
      expect(csv).toContain('Event 1');
      expect(csv).toContain('Event 2');
    });
  });

  describe('Event Handlers', () => {
    it('notifies handlers on log', () => {
      const captured = [];

      logger.on(event => {
        captured.push(event);
      });

      logger.info('test', 'Message');

      expect(captured.length).toBe(1);
      expect(captured[0].message).toBe('Message');
    });

    it('supports multiple handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      logger.on(handler1);
      logger.on(handler2);

      logger.info('test', 'Message');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('unregisters handlers', () => {
      const handler = jest.fn();

      logger.on(handler);
      logger.info('test', 'Message 1');

      logger.off(handler);
      logger.info('test', 'Message 2');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      logger.setLevel('debug');
      logger.debug('src1', 'Msg');
      logger.info('src1', 'Msg');
      logger.warn('src2', 'Msg');
      logger.error('src2', 'Msg');
    });

    it('returns statistics', () => {
      const stats = logger.getStatistics();

      expect(stats.totalEvents).toBe(4);
      expect(stats.byLevel.debug).toBe(1);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.bySource.src1).toBe(2);
      expect(stats.bySource.src2).toBe(2);
    });
  });
});

describe('MetricsCollector', () => {
  let collector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  describe('Recording Metrics', () => {
    it('records metrics', () => {
      const metric = collector.recordMetric('latency', 150, { service: 'api' });

      expect(metric.name).toBe('latency');
      expect(metric.value).toBe(150);
      expect(metric.tags.service).toBe('api');
    });

    it('records workflow metrics', () => {
      const metric = collector.recordWorkflowMetric('exec-1', 'duration', 500);

      expect(metric.tags.type).toBe('workflow');
      expect(metric.tags.executionId).toBe('exec-1');
    });

    it('records agent metrics', () => {
      const metric = collector.recordAgentMetric('agent-1', 'uptime', 3600);

      expect(metric.tags.type).toBe('agent');
      expect(metric.tags.agentId).toBe('agent-1');
    });

    it('records task metrics', () => {
      const metric = collector.recordTaskMetric('task-1', 'latency', 250);

      expect(metric.tags.type).toBe('task');
      expect(metric.tags.taskId).toBe('task-1');
    });
  });

  describe('Metric Aggregation', () => {
    beforeEach(() => {
      collector.recordMetric('latency', 100);
      collector.recordMetric('latency', 200);
      collector.recordMetric('latency', 300);
      collector.recordMetric('latency', 400);
      collector.recordMetric('latency', 500);
    });

    it('calculates aggregates', () => {
      const agg = collector.getAggregates('latency');

      expect(agg.name).toBe('latency');
      expect(agg.count).toBe(5);
      expect(agg.min).toBe(100);
      expect(agg.max).toBe(500);
      expect(agg.avg).toBe(300);
      expect(agg.p50).toBe(300);
      expect(agg.p95).toBe(500);
      expect(agg.p99).toBe(500);
    });

    it('calculates percentiles', () => {
      const perc = collector.getLatencyPercentiles('latency');

      expect(perc.p50).toBeGreaterThanOrEqual(0);
      expect(perc.p95).toBeGreaterThanOrEqual(perc.p50);
      expect(perc.p99).toBeGreaterThanOrEqual(perc.p95);
    });
  });

  describe('Time Series Analysis', () => {
    it('generates time series aggregates', () => {
      for (let i = 0; i < 10; i++) {
        collector.recordMetric('latency', 100 + i * 10);
      }

      const timeSeries = collector.getTimeSeriesAggregates('latency', 60000);

      expect(timeSeries.length).toBeGreaterThan(0);
      expect(timeSeries[0].timestamp).toBeDefined();
      expect(timeSeries[0].avg).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('calculates throughput', () => {
      for (let i = 0; i < 60; i++) {
        collector.recordMetric('operation', 1);
      }

      const throughput = collector.getThroughput('operation', 60);

      expect(throughput.throughputPerSecond).toBe(1);
    });

    it('calculates error rate', () => {
      collector.recordMetric('op', 1, { type: 'success' });
      collector.recordMetric('op', 1, { type: 'success' });
      collector.recordMetric('op', 1, { type: 'error' });

      const errorRate = collector.getErrorRate();

      expect(errorRate.errorRate).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      collector.recordMetric('latency', 100);
      collector.recordMetric('latency', 200);
      collector.recordMetric('throughput', 50);
    });

    it('returns operation statistics', () => {
      const stats = collector.getOperationStats();

      expect(stats.latency).toBeDefined();
      expect(stats.latency.count).toBe(2);
      expect(stats.throughput).toBeDefined();
      expect(stats.throughput.count).toBe(1);
    });

    it('returns collector statistics', () => {
      const stats = collector.getStatistics();

      expect(stats.totalMetrics).toBe(3);
      expect(stats.byName.latency).toBe(2);
      expect(stats.byName.throughput).toBe(1);
    });

    it('returns health dashboard', () => {
      const dashboard = collector.getHealthDashboard();

      expect(dashboard.totalMetrics).toBeGreaterThanOrEqual(0);
      expect(dashboard.errorRate).toBeDefined();
      expect(dashboard.latency).toBeDefined();
      expect(dashboard.throughput).toBeDefined();
      expect(dashboard.health).toBeDefined();
    });
  });
});

describe('HealthChecker', () => {
  let checker;
  let registry;
  let queue;
  let collector;

  beforeEach(() => {
    registry = new AgentRegistry();
    queue = new TaskQueue();
    collector = new MetricsCollector();
    checker = new HealthChecker(registry, queue, collector);
  });

  describe('Health Checks', () => {
    beforeEach(() => {
      registry.registerAgent({
        id: 'agent-1',
        name: 'Agent 1',
        capabilities: ['test'],
        healthy: true
      });
      registry.registerAgent({
        id: 'agent-2',
        name: 'Agent 2',
        capabilities: ['test'],
        healthy: true
      });
    });

    it('checks agent health', async () => {
      const result = await checker.runChecks();

      expect(result.results.agents).toBeDefined();
      expect(result.results.agents.healthy).toBe(2);
      expect(result.results.agents.total).toBe(2);
    });

    it('checks queue health', async () => {
      queue.enqueueTask({ capability: 'test', priority: 0 });

      const result = await checker.runChecks();

      expect(result.results.queue).toBeDefined();
      expect(result.results.queue.queueLength).toBe(1);
    });

    it('checks error rate', async () => {
      collector.recordMetric('op', 1, { type: 'success' });
      collector.recordMetric('op', 1, { type: 'error' });

      const result = await checker.runChecks();

      expect(result.results.errors).toBeDefined();
      expect(result.results.errors.status).toBeDefined();
    });

    it('checks performance', async () => {
      collector.recordMetric('latency', 100);
      collector.recordMetric('latency', 200);

      const result = await checker.runChecks();

      expect(result.results.performance).toBeDefined();
      expect(result.results.performance.latency).toBeDefined();
    });
  });

  describe('Custom Checks', () => {
    it('registers custom checks', () => {
      const result = checker.registerCheck('custom', () => ({
        status: 'healthy',
        value: 42
      }));

      expect(result.success).toBe(true);
    });

    it('runs custom checks', async () => {
      checker.registerCheck('custom', () => ({ status: 'healthy', value: 42 }));

      const result = await checker.runChecks();

      expect(result.results.custom).toBeDefined();
      expect(result.results.custom.value).toBe(42);
    });
  });

  describe('Alert Generation', () => {
    it('generates alerts for unhealthy status', async () => {
      registry.registerAgent({ id: 'a1', name: 'A1', capabilities: ['t'], healthy: false });

      const result = await checker.runChecks();

      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('retrieves active alerts', async () => {
      registry.registerAgent({ id: 'a1', name: 'A1', capabilities: ['t'], healthy: false });

      await checker.runChecks();

      const alerts = checker.getAlerts();

      expect(alerts.length).toBeGreaterThan(0);
    });

    it('clears alerts', async () => {
      registry.registerAgent({ id: 'a1', name: 'A1', capabilities: ['t'], healthy: false });

      await checker.runChecks();

      const result = checker.clearAlerts();

      expect(result.success).toBe(true);
    });
  });

  describe('Status and Reports', () => {
    it('returns current status', () => {
      const status = checker.getStatus();

      expect(status.status).toBeDefined();
    });

    it('returns check history', async () => {
      await checker.runChecks();
      await checker.runChecks();

      const history = checker.getHistory();

      expect(history.length).toBe(2);
    });

    it('generates detailed report', async () => {
      await checker.runChecks();

      const report = checker.getDetailedReport();

      expect(report.status).toBeDefined();
      expect(report.checks).toBeDefined();
      expect(report.history).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('Overall Status Calculation', () => {
    it('marks system healthy when all checks pass', async () => {
      registry.registerAgent({
        id: 'agent-1',
        name: 'Agent 1',
        capabilities: ['test'],
        healthy: true
      });

      const result = await checker.runChecks();

      expect(result.overallStatus).toBe('healthy');
    });

    it('marks system degraded on warnings', async () => {
      registry.registerAgent({ id: 'a1', name: 'A1', capabilities: ['t'], healthy: true });
      registry.registerAgent({ id: 'a2', name: 'A2', capabilities: ['t'], healthy: false });

      const result = await checker.runChecks();

      expect(result.overallStatus).toBe('degraded');
    });
  });
});

describe('Integration: Logging + Metrics + Monitoring', () => {
  let logger;
  let collector;
  let checker;
  let registry;
  let queue;

  beforeEach(() => {
    logger = new EventLogger();
    registry = new AgentRegistry();
    queue = new TaskQueue();
    collector = new MetricsCollector();
    checker = new HealthChecker(registry, queue, collector);
  });

  it('logs metrics collection', () => {
    collector.recordMetric('latency', 100);

    logger.info('metrics', 'Latency recorded', { latency: 100 });

    const events = logger.getEvents({ source: 'metrics' });

    expect(events.length).toBe(1);
  });

  it('logs health check results', async () => {
    registry.registerAgent({ id: 'a1', name: 'A1', capabilities: ['t'], healthy: true });

    const result = await checker.runChecks();

    logger.info('health', 'Health check completed', { status: result.overallStatus });

    const events = logger.getEvents({ source: 'health' });

    expect(events.length).toBe(1);
  });

  it('correlates logs and metrics', () => {
    const timestamp = new Date().toISOString();

    logger.info('test', 'Operation started', { timestamp });
    collector.recordMetric('operation_duration', 500, { timestamp });

    const logs = logger.getEvents({ search: 'Operation' });
    const metrics = collector.getMetrics({ name: 'operation_duration' });

    expect(logs.length).toBe(1);
    expect(metrics.length).toBe(1);
  });
});
