/**
 * End-to-End Integration Tests
 * Tests for complete harness workflows
 */

const HarnessOrchestrator = require('../src/harness-orchestrator');
const workflows = require('../src/e2e-workflows');

describe('Harness Orchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new HarnessOrchestrator();
  });

  describe('Initialization', () => {
    it('initializes with components', async () => {
      const mockComponents = {
        'army-agents': class { getHealth() { return { status: 'healthy' }; } },
        'brain-wiki': class { getHealth() { return { status: 'healthy' }; } }
      };

      const result = await orchestrator.initialize(mockComponents);

      expect(result.success).toBe(true);
      expect(result.componentsInitialized).toBe(2);
    });

    it('marks as initialized', async () => {
      await orchestrator.initialize({});

      expect(orchestrator.initialized).toBe(true);
    });

    it('sets up integrations', async () => {
      await orchestrator.initialize({});

      expect(orchestrator.integrations.size).toBeGreaterThan(0);
    });
  });

  describe('Workflow Management', () => {
    beforeEach(async () => {
      await orchestrator.initialize({});
    });

    it('registers a workflow', () => {
      const result = orchestrator.registerWorkflow('test', async () => ({}));

      expect(result.success).toBe(true);
    });

    it('lists registered workflows', () => {
      orchestrator.registerWorkflow('workflow1', async () => ({}));
      orchestrator.registerWorkflow('workflow2', async () => ({}));

      const workflows = orchestrator.listWorkflows();

      expect(workflows.length).toBe(2);
    });

    it('executes a workflow', async () => {
      orchestrator.registerWorkflow('test', async () => ({
        success: true,
        result: 'ok'
      }));

      const result = await orchestrator.executeWorkflow('test', {});

      expect(result.success).toBe(true);
      expect(result.execution).toBeDefined();
    });
  });

  describe('System Health', () => {
    beforeEach(async () => {
      await orchestrator.initialize({
        'army-agents': class {
          getHealth() { return { status: 'healthy' }; }
          getStatistics() { return { agents: 5 }; }
        },
        'brain-wiki': class {
          getHealth() { return { status: 'healthy' }; }
          getStatistics() { return { entries: 100 }; }
        }
      });
    });

    it('gets system health', () => {
      const health = orchestrator.getSystemHealth();

      expect(health.overall).toBeDefined();
      expect(health.components).toBeDefined();
      expect(health.stats).toBeDefined();
    });

    it('gets system status', () => {
      const status = orchestrator.getSystemStatus();

      expect(status.initialized).toBe(true);
      expect(status.componentsCount).toBeGreaterThan(0);
      expect(status.health).toBeDefined();
    });

    it('runs diagnostics', async () => {
      const diagnostics = await orchestrator.runDiagnostics();

      expect(diagnostics.components).toBeDefined();
      expect(diagnostics.connectivity).toBeDefined();
    });
  });

  describe('Event Logging', () => {
    beforeEach(async () => {
      await orchestrator.initialize({});
    });

    it('logs events', () => {
      orchestrator.registerWorkflow('test', async () => ({}));

      const log = orchestrator.getEventLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log[0].type).toBeDefined();
    });

    it('bounds event log', async () => {
      for (let i = 0; i < 1100; i++) {
        orchestrator.registerWorkflow(`workflow-${i}`, async () => ({}));
      }

      const log = orchestrator.getEventLog(1000);

      expect(log.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Component Access', () => {
    beforeEach(async () => {
      await orchestrator.initialize({
        'test-component': class { getName() { return 'test'; } }
      });
    });

    it('gets component by name', () => {
      const component = orchestrator.getComponent('test-component');

      expect(component).toBeDefined();
    });

    it('returns null for missing component', () => {
      const component = orchestrator.getComponent('nonexistent');

      expect(component).toBeNull();
    });
  });
});

describe('End-to-End Workflows', () => {
  let orchestrator;

  beforeEach(async () => {
    orchestrator = new HarnessOrchestrator();

    // Mock all components
    const mockComponents = {
      'harvester': class {
        async executePipeline(id) { return { success: true, items: [{ text: 'data' }] }; }
        async collectFromSources(sources) { return { success: true, items: [{ text: 'content' }] }; }
      },
      'curator': class {
        curate(item) { return { accepted: true, content: item.text, score: 0.9, classification: { tags: ['test'] } }; }
        curateBatch(items) { return { acceptedItems: items.length, results: items.map(i => ({ accepted: true, content: i, score: 0.9, classification: { tags: [] } })) }; }
      },
      'brain-wiki': class {
        learn(content, meta) { return { success: true, id: 'entry-1' }; }
        ask(question) { return { question, explanation: { definition: 'answer', confidence: 0.8 }, confidence: 0.8 }; }
      },
      'consilient': class {
        recordDecision(decision) { return { success: true }; }
        minePatterns() { return { patternsFound: 5, patterns: [{ id: 'p1', confidence: 0.9, successRate: 0.95, output: 'result' }] }; }
        resolveConflict(proposals) { return { outcome: proposals[0], confidence: 0.9 }; }
      },
      'army-agents': class {
        async executeTask(task) { return { success: true, result: 'executed' }; }
      },
      'vi-dashboard': class {
        feedData(source, data) { return { success: true }; }
      }
    };

    await orchestrator.initialize(mockComponents);
  });

  describe('Data Ingestion Workflow', () => {
    it('executes data ingestion workflow', async () => {
      orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);

      const result = await orchestrator.executeWorkflow('data-ingestion', {
        pipelineId: 'test-pipeline'
      });

      expect(result.success).toBe(true);
      expect(result.result.harvested).toBeGreaterThan(0);
      expect(result.result.learned).toBeGreaterThan(0);
    });
  });

  describe('Agent Learning Workflow', () => {
    it('executes agent learning workflow', async () => {
      orchestrator.registerWorkflow('agent-learning', workflows.agentLearningWorkflow);

      const result = await orchestrator.executeWorkflow('agent-learning', {
        tasks: [{ id: 'task1' }, { id: 'task2' }]
      });

      expect(result.success).toBe(true);
      expect(result.result.tasksExecuted).toBeGreaterThan(0);
    });
  });

  describe('Content Processing Workflow', () => {
    it('executes content processing workflow', async () => {
      orchestrator.registerWorkflow('content-processing', workflows.contentProcessingWorkflow);

      const result = await orchestrator.executeWorkflow('content-processing', {
        sources: ['source1', 'source2'],
        source: 'test'
      });

      expect(result.success).toBe(true);
      expect(result.result.duration).toBeGreaterThan(0);
    });
  });

  describe('Decision Making Workflow', () => {
    it('executes decision making workflow', async () => {
      orchestrator.registerWorkflow('decision-making', workflows.decisionMakingWorkflow);

      const result = await orchestrator.executeWorkflow('decision-making', {
        question: 'What should we do?',
        minConfidence: 0.7
      });

      expect(result.success).toBe(true);
      expect(result.result.decision).toBeDefined();
    });
  });

  describe('Full System Integration Test', () => {
    it('tests all components together', async () => {
      orchestrator.registerWorkflow('integration-test', workflows.fullSystemIntegrationTest);

      const result = await orchestrator.executeWorkflow('integration-test', {});

      expect(result.success).toBe(true);
      expect(result.result.componentsReady).toBeGreaterThan(0);
      expect(result.result.health).toBeDefined();
    });
  });

  describe('Monitoring Workflow', () => {
    it('executes monitoring workflow', async () => {
      orchestrator.registerWorkflow('monitoring', workflows.monitoringWorkflow);

      const result = await orchestrator.executeWorkflow('monitoring', {});

      expect(result.success).toBe(true);
      expect(result.result.metricsCollected).toBeGreaterThan(0);
    });
  });
});

describe('Component Integration', () => {
  let orchestrator;

  beforeEach(async () => {
    orchestrator = new HarnessOrchestrator();
    await orchestrator.initialize({});
  });

  it('tracks integrations', () => {
    expect(orchestrator.integrations.size).toBeGreaterThan(0);
  });

  it('lists all integrations', () => {
    const integrations = Array.from(orchestrator.integrations.entries());

    expect(integrations.length).toBeGreaterThan(0);
    expect(integrations[0][0]).toBeDefined();
  });
});
