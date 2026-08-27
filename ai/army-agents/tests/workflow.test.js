/**
 * Workflow Orchestration Tests
 * Tests for WorkflowOrchestrator, StateManager, and ConsensusEngine
 */

const WorkflowOrchestrator = require('../src/workflow-orchestrator');
const StateManager = require('../src/state-manager');
const ConsensusEngine = require('../src/consensus-engine');
const ArmyAgents = require('../src/army-agents');
const AgentRegistry = require('../src/agent-registry');

describe('WorkflowOrchestrator', () => {
  let orchestrator;
  let armyAgents;
  let registry;

  beforeEach(() => {
    registry = new AgentRegistry();
    armyAgents = new ArmyAgents(registry);
    orchestrator = new WorkflowOrchestrator(armyAgents);
  });

  describe('Workflow Registration', () => {
    it('registers a valid workflow', () => {
      const workflow = {
        steps: [
          { id: 'step1', type: 'transform', input: 'data', operation: 'uppercase' }
        ]
      };

      const result = orchestrator.registerWorkflow('test-workflow', workflow);

      expect(result.success).toBe(true);
      expect(result.workflowId).toBe('test-workflow');
    });

    it('rejects duplicate workflow registration', () => {
      const workflow = { steps: [{ id: 'step1', type: 'transform' }] };

      orchestrator.registerWorkflow('test-workflow', workflow);

      expect(() => {
        orchestrator.registerWorkflow('test-workflow', workflow);
      }).toThrow();
    });

    it('validates workflow structure', () => {
      const invalidWorkflow = { steps: [] };

      expect(() => {
        orchestrator.registerWorkflow('invalid', invalidWorkflow);
      }).toThrow();
    });
  });

  describe('Workflow Execution', () => {
    beforeEach(() => {
      const workflow = {
        steps: [
          {
            id: 'step1',
            type: 'transform',
            input: 'data',
            operation: 'uppercase',
            output: 'result1'
          }
        ]
      };
      orchestrator.registerWorkflow('test-workflow', workflow);
    });

    it('executes a workflow', async () => {
      const result = await orchestrator.executeWorkflow('test-workflow', { data: 'hello' });

      expect(result.status).toBe('completed');
      expect(result.executionId).toBeDefined();
    });

    it('handles transform operations', async () => {
      const result = await orchestrator.executeWorkflow('test-workflow', { data: 'hello' });

      expect(result.status).toBe('completed');
      expect(result.results.step1.data).toBe('HELLO');
    });

    it('passes state between steps', async () => {
      const workflow = {
        steps: [
          {
            id: 'step1',
            type: 'transform',
            input: 'data',
            operation: 'uppercase',
            output: 'result1'
          },
          {
            id: 'step2',
            type: 'transform',
            input: 'result1',
            operation: 'lowercase',
            output: 'result2'
          }
        ]
      };
      orchestrator.registerWorkflow('multi-step', workflow);

      const result = await orchestrator.executeWorkflow('multi-step', { data: 'Hello' });

      expect(result.status).toBe('completed');
      expect(result.results.step1.data).toBe('HELLO');
    });

    it('handles conditional execution', async () => {
      const workflow = {
        steps: [
          {
            id: 'step1',
            type: 'transform',
            input: 'value',
            operation: 'uppercase',
            output: 'result'
          },
          {
            id: 'step2',
            type: 'merge',
            inputs: ['result'],
            condition: { field: 'value', operator: 'equals', value: 'skip' }
          }
        ]
      };
      orchestrator.registerWorkflow('conditional', workflow);

      const result = await orchestrator.executeWorkflow('conditional', { value: 'execute' });

      expect(result.status).toBe('completed');
      expect(result.results.step2).toBeUndefined();
    });
  });

  describe('Execution Management', () => {
    beforeEach(() => {
      const workflow = { steps: [{ id: 'step1', type: 'transform', input: 'x', operation: 'uppercase' }] };
      orchestrator.registerWorkflow('test', workflow);
    });

    it('retrieves execution status', async () => {
      const result = await orchestrator.executeWorkflow('test', { x: 'hi' });

      const execution = orchestrator.getExecution(result.executionId);

      expect(execution).toBeDefined();
      expect(execution.status).toBe('completed');
    });

    it('gets execution results', async () => {
      const result = await orchestrator.executeWorkflow('test', { x: 'hi' });

      const results = orchestrator.getResults(result.executionId);

      expect(results.status).toBe('completed');
      expect(results.duration).toBeGreaterThanOrEqual(0);
    });

    it('lists executions', async () => {
      await orchestrator.executeWorkflow('test', { x: 'hi' });
      await orchestrator.executeWorkflow('test', { x: 'bye' });

      const executions = orchestrator.listExecutions();

      expect(executions.length).toBe(2);
      expect(executions[0].status).toBe('completed');
    });

    it('returns statistics', () => {
      const stats = orchestrator.getStatistics();

      expect(stats.totalWorkflows).toBeDefined();
      expect(stats.totalExecutions).toBeDefined();
      expect(stats.byStatus).toBeDefined();
    });
  });
});

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('State Get/Set', () => {
    it('sets and gets state values', () => {
      stateManager.set('namespace.key', 'value');

      const value = stateManager.get('namespace.key');

      expect(value).toBe('value');
    });

    it('handles nested state', () => {
      stateManager.set('config.database.host', 'localhost');

      expect(stateManager.get('config.database.host')).toBe('localhost');
    });

    it('returns undefined for missing values', () => {
      const value = stateManager.get('nonexistent.key');

      expect(value).toBeUndefined();
    });

    it('returns undefined for missing nested keys', () => {
      stateManager.set('config.database', { host: 'localhost' });

      const value = stateManager.get('config.database.missing');

      expect(value).toBeUndefined();
    });
  });

  describe('Batch Operations', () => {
    it('sets multiple values', () => {
      stateManager.batchSet({
        'ns1.key1': 'value1',
        'ns2.key2': 'value2',
        'ns3.key3': 'value3'
      });

      expect(stateManager.get('ns1.key1')).toBe('value1');
      expect(stateManager.get('ns2.key2')).toBe('value2');
      expect(stateManager.get('ns3.key3')).toBe('value3');
    });

    it('increments version on batch set', () => {
      const initialVersion = stateManager.getStatistics().version;

      stateManager.batchSet({ 'a.x': 1, 'b.y': 2 });

      expect(stateManager.getStatistics().version).toBeGreaterThan(initialVersion);
    });
  });

  describe('Snapshots and History', () => {
    it('creates state snapshots', () => {
      stateManager.set('data.user', { name: 'Alice' });
      stateManager.set('data.status', 'active');

      const snapshot = stateManager.getSnapshot();

      expect(snapshot.data.data.user.name).toBe('Alice');
      expect(snapshot.version).toBeDefined();
    });

    it('restores previous version', () => {
      stateManager.set('data.x', 1);
      const snapshot1 = stateManager.getSnapshot();

      stateManager.set('data.x', 2);
      stateManager.set('data.y', 3);

      stateManager.restoreVersion(snapshot1.version);

      expect(stateManager.get('data.x')).toBe(1);
    });

    it('tracks history', () => {
      stateManager.set('a.x', 1);
      stateManager.set('a.y', 2);

      const history = stateManager.getHistory();

      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Locking', () => {
    it('locks a state path', () => {
      const result = stateManager.lock('data.critical', 'agent1');

      expect(result.success).toBe(true);
    });

    it('prevents lock by different holder', () => {
      stateManager.lock('data.critical', 'agent1');

      const result = stateManager.lock('data.critical', 'agent2');

      expect(result.success).toBe(false);
    });

    it('unlocks a path', () => {
      stateManager.lock('data.critical', 'agent1');

      const result = stateManager.unlock('data.critical', 'agent1');

      expect(result.success).toBe(true);
    });

    it('auto-releases lock after TTL', async () => {
      stateManager.lock('data.critical', 'agent1', 100);

      await new Promise(resolve => setTimeout(resolve, 150));

      const result = stateManager.lock('data.critical', 'agent2');

      expect(result.success).toBe(true);
    });
  });

  describe('Watchers', () => {
    it('watches state changes', () => {
      const changes = [];

      stateManager.watch('data.x', (change) => {
        changes.push(change);
      });

      stateManager.set('data.x', 1);
      stateManager.set('data.x', 2);

      expect(changes.length).toBe(2);
    });

    it('notifies watchers with old and new values', () => {
      let notified = null;

      stateManager.set('data.x', 'old');
      stateManager.watch('data.x', (change) => {
        notified = change;
      });

      stateManager.set('data.x', 'new');

      expect(notified.oldValue).toBe('old');
      expect(notified.newValue).toBe('new');
    });

    it('unwatches changes', () => {
      const changes = [];
      const callback = (change) => changes.push(change);

      stateManager.watch('data.x', callback);
      stateManager.set('data.x', 1);
      stateManager.unwatch('data.x', callback);
      stateManager.set('data.x', 2);

      expect(changes.length).toBe(1);
    });
  });

  describe('Merge Operations', () => {
    it('merges external state', () => {
      stateManager.set('config.old', 'value');

      stateManager.merge({ config: { new: 'value' } });

      expect(stateManager.get('config.old')).toBe('value');
      expect(stateManager.get('config.new')).toBe('value');
    });

    it('supports different merge strategies', () => {
      stateManager.set('data.a', 1);
      stateManager.set('data.b', 2);

      stateManager.merge({ data: { a: 10 } }, 'replace');

      expect(stateManager.get('data.a')).toBe(10);
      expect(stateManager.get('data.b')).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('validates state against schema', () => {
      stateManager.set('users', { count: 5 });

      const result = stateManager.validate({
        users: { type: 'object', required: true }
      });

      expect(result.valid).toBe(true);
    });

    it('detects missing required fields', () => {
      const result = stateManager.validate({
        missing: { required: true }
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('returns state statistics', () => {
      stateManager.set('ns1.key1', 'value1');
      stateManager.set('ns2.key2', 'value2');

      const stats = stateManager.getStatistics();

      expect(stats.totalNamespaces).toBe(2);
      expect(stats.version).toBeGreaterThan(0);
    });
  });
});

describe('ConsensusEngine', () => {
  let consensusEngine;
  let armyAgents;
  let registry;

  beforeEach(() => {
    registry = new AgentRegistry();
    armyAgents = new ArmyAgents(registry);
    consensusEngine = new ConsensusEngine(armyAgents);
  });

  describe('Proposal Management', () => {
    it('creates proposals', async () => {
      const proposal = {
        capability: 'analyzer',
        content: { data: 'test' },
        priority: 'high'
      };

      const result = await consensusEngine.proposeDecision(proposal);

      expect(result.proposalId).toBeDefined();
    });

    it('retrieves proposals', async () => {
      const proposal = {
        capability: 'analyzer',
        content: { data: 'test' }
      };

      const result = await consensusEngine.proposeDecision(proposal);
      const retrieved = consensusEngine.getProposal(result.proposalId);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(result.proposalId);
    });

    it('lists proposals', async () => {
      const proposal = { capability: 'test', content: {} };

      await consensusEngine.proposeDecision(proposal);
      await consensusEngine.proposeDecision(proposal);

      const proposals = consensusEngine.listProposals();

      expect(proposals.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Vote Recording', () => {
    it('records votes for proposals', async () => {
      const proposal = { capability: 'analyzer', content: {} };

      const result = await consensusEngine.proposeDecision(proposal);

      const voteResult = consensusEngine.recordVote(
        result.proposalId,
        'agent1',
        'yes',
        'Looks good'
      );

      expect(voteResult.success).toBe(true);
    });

    it('prevents voting on non-voting proposals', async () => {
      const proposal = { capability: 'analyzer', content: {} };

      const result = await consensusEngine.proposeDecision(proposal);

      // Wait for proposal to finish voting
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(() => {
        consensusEngine.recordVote(result.proposalId, 'agent1', 'yes');
      }).toThrow();
    });
  });

  describe('Conflict Resolution', () => {
    it('resolves single proposal', () => {
      const proposals = [{ id: '1', confidence: 0.9 }];

      const result = consensusEngine.resolveConflict(proposals);

      expect(result.success).toBe(true);
      expect(result.resolved).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('resolves multiple proposals', () => {
      const proposals = [
        { id: '1', confidence: 0.9, priority: 'high' },
        { id: '2', confidence: 0.7, priority: 'low' }
      ];

      const result = consensusEngine.resolveConflict(proposals);

      expect(result.success).toBe(true);
      expect(result.allProposals.length).toBe(2);
    });

    it('calculates conflict level', () => {
      const proposals = [
        { id: '1', confidence: 0.95, votes: {} },
        { id: '2', confidence: 0.50, votes: {} }
      ];

      const result = consensusEngine.resolveConflict(proposals);

      expect(result.conflictLevel).toBeGreaterThan(0);
    });

    it('handles empty proposals', () => {
      const result = consensusEngine.resolveConflict([]);

      expect(result.success).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('returns consensus statistics', () => {
      const stats = consensusEngine.getStatistics();

      expect(stats.totalProposals).toBeDefined();
      expect(stats.byStatus).toBeDefined();
      expect(stats.averageConsensus).toBeDefined();
    });
  });
});

describe('Integration: Workflow + State + Consensus', () => {
  let orchestrator;
  let stateManager;
  let consensusEngine;
  let armyAgents;
  let registry;

  beforeEach(() => {
    registry = new AgentRegistry();
    armyAgents = new ArmyAgents(registry);
    orchestrator = new WorkflowOrchestrator(armyAgents);
    stateManager = new StateManager();
    consensusEngine = new ConsensusEngine(armyAgents);
  });

  it('executes workflow with state management', async () => {
    stateManager.set('workflow.input', 'hello');

    const workflow = {
      steps: [
        {
          id: 'step1',
          type: 'transform',
          input: 'workflow.input',
          operation: 'uppercase',
          output: 'workflow.output'
        }
      ]
    };

    orchestrator.registerWorkflow('integrated', workflow);

    const result = await orchestrator.executeWorkflow('integrated', {
      'workflow.input': 'hello'
    });

    expect(result.status).toBe('completed');
  });

  it('uses consensus for workflow decisions', async () => {
    const proposal = {
      capability: 'decision-maker',
      content: { workflow: 'test' }
    };

    const result = await consensusEngine.proposeDecision(proposal);

    expect(result.proposalId).toBeDefined();
  });

  it('tracks state through workflow execution', async () => {
    stateManager.batchSet({
      'execution.workflowId': 'test',
      'execution.status': 'running'
    });

    const workflow = {
      steps: [
        {
          id: 'step1',
          type: 'merge',
          inputs: ['status'],
          output: 'result'
        }
      ]
    };

    orchestrator.registerWorkflow('tracked', workflow);

    const result = await orchestrator.executeWorkflow('tracked', { status: 'processing' });

    expect(result.status).toBe('completed');
  });
});
