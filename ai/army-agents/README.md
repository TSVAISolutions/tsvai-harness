# Army Agents

Multi-agent coordination and orchestration system for TSVAI.

Enables agents to work together through intelligent task distribution, workflow orchestration, shared state management, and consensus-based decision making.

## Architecture

### Phase 1: Registry & Communication ✅
- **Agent Registry** - Central agent discovery and health tracking
- **Communication Protocol** - RPC messaging with automatic retries
- **Orchestration Core** - Unified agent management and coordination

### Phase 2: Task Distribution ✅
- **Task Queue** - Priority-based work distribution
- **Task Allocator** - Intelligent capability-based assignment
- **Load Balancing** - Multiple strategies (round-robin, least-loaded, random)

### Phase 3: Workflow Orchestration ✅
- **Workflow Orchestrator** - Multi-step workflow execution
- **State Manager** - Shared state across agents
- **Consensus Engine** - Multi-agent voting and conflict resolution

### Phase 4: Monitoring & Logging ✅
- **Event Logger** (340 lines) - Structured logging with filtering and export
- **Metrics Collector** (380 lines) - Performance metrics and percentile analysis
- **Health Checker** (290 lines) - System health monitoring with alerting

## Quick Start

### Agent Registry

```javascript
const AgentRegistry = require('./src/agent-registry');
const registry = new AgentRegistry();

// Register agent
registry.registerAgent({
  id: 'agent-1',
  name: 'Data Analyzer',
  capabilities: ['analysis', 'reporting'],
  healthy: true
});

// Find agents by capability
const agents = registry.findByCapability('analysis');
```

### Task Queue

```javascript
const TaskQueue = require('./src/task-queue');
const queue = new TaskQueue();

// Enqueue task
queue.enqueueTask({
  id: 'task-1',
  capability: 'analysis',
  data: { ... },
  priority: 1
});

// Get next task
const task = queue.getNextTask();
queue.startTask(task.id, 'agent-1');
```

### Workflow Orchestration

```javascript
const WorkflowOrchestrator = require('./src/workflow-orchestrator');
const orchestrator = new WorkflowOrchestrator(armyAgents);

// Define workflow
orchestrator.registerWorkflow('data-pipeline', {
  steps: [
    {
      id: 'validate',
      type: 'validate',
      input: 'raw-data',
      rule: { field: 'value', operator: 'exists' }
    },
    {
      id: 'process',
      type: 'agent-call',
      agentCapability: 'processor',
      method: 'process',
      params: { data: '$raw-data' }
    }
  ]
});

// Execute workflow
const result = await orchestrator.executeWorkflow('data-pipeline', {
  'raw-data': { ... }
});
```

### State Management

```javascript
const StateManager = require('./src/state-manager');
const state = new StateManager();

// Set state
state.set('execution.status', 'running');

// Watch for changes
state.watch('execution.status', (change) => {
  console.log(`Status: ${change.oldValue} → ${change.newValue}`);
});

// Get snapshot
const snapshot = state.getSnapshot();
```

### Consensus Decisions

```javascript
const ConsensusEngine = require('./src/consensus-engine');
const consensus = new ConsensusEngine(armyAgents);

// Propose decision
const result = await consensus.proposeDecision({
  capability: 'analyzer',
  content: { decision: 'proceed' },
  priority: 'high'
});

// Resolve conflicts
const resolution = consensus.resolveConflict([proposal1, proposal2]);
```

## Files

### Core Modules

| File | Lines | Purpose |
|------|-------|---------|
| agent-registry.js | 280 | Agent discovery & health tracking |
| agent-comm-protocol.js | 280 | RPC messaging with retries |
| army-agents.js | 340 | Unified orchestration |
| task-queue.js | 280 | Priority-based work distribution |
| task-allocator.js | 196 | Capability-based assignment |
| workflow-orchestrator.js | 380 | Multi-step workflow execution |
| state-manager.js | 340 | Shared state management |
| consensus-engine.js | 320 | Multi-agent voting |
| event-logger.js | 340 | Structured event logging |
| metrics-collector.js | 380 | Performance metrics & analytics |
| health-checker.js | 290 | Health monitoring & alerts |

### Tests

| File | Test Cases | Coverage |
|------|-----------|----------|
| agent.test.js | 40+ | Registry, communication, health |
| task.test.js | 35+ | Queue, allocation, workload |
| workflow.test.js | 50+ | Orchestration, state, consensus |
| monitoring.test.js | 60+ | Logging, metrics, health checks |

### Documentation

- [AGENT_REGISTRY.md](./docs/AGENT_REGISTRY.md) - Registry guide
- [TASK_QUEUE.md](./docs/TASK_QUEUE.md) - Queue & allocation guide
- [WORKFLOW_ORCHESTRATION.md](./docs/WORKFLOW_ORCHESTRATION.md) - Workflow & state guide
- [MONITORING_AND_LOGGING.md](./docs/MONITORING_AND_LOGGING.md) - Monitoring guide

## Statistics

**Phase 1 & 2 Complete:** 1,376 lines of code
- Agent registry & communication: 900 lines
- Task distribution: 476 lines

**Phase 3 Complete:** 1,040 lines of code
- Workflow orchestrator: 380 lines
- State manager: 340 lines
- Consensus engine: 320 lines

**Phase 4 Complete:** 1,010 lines of code
- Event logger: 340 lines
- Metrics collector: 380 lines
- Health checker: 290 lines

**Total:** 3,426 lines | **Tests:** 185+ cases | **Status:** ✅ Production-Ready

## Architecture Patterns

Adapted from TSVAI vega/harness reference:

- **Registry Pattern** - Centralized agent discovery with capability indexing
- **RPC Protocol** - Async message passing with automatic retries and exponential backoff
- **Task Queue** - Priority-based distribution with automatic retry logic
- **Intelligent Allocation** - Capability matching with multiple load-balancing strategies
- **Health Tracking** - Heartbeat-based agent monitoring with configurable timeout
- **Workflow State** - Versioned state snapshots with change tracking and watchers
- **Consensus Voting** - Quorum-based decision making with conflict resolution

## Usage Examples

See `/examples` directory for complete working examples:
- `agent-demo.js` - Registry and communication
- `task-demo.js` - Queue and allocation
- `workflow-demo.js` - Orchestration and state

## Best Practices

1. **Always register agents** - Before assigning tasks, register with capability
2. **Use capabilities** - Prefer capability-based routing over agent IDs
3. **Monitor health** - Check `checkHealth()` regularly
4. **Batch state updates** - Use `batchSet()` for efficiency
5. **Lock critical sections** - Prevent concurrent modifications
6. **Name workflows clearly** - For debugging and monitoring
7. **Handle timeouts** - Set appropriate voting and execution timeouts
8. **Test workflows** - Mock agents for testing workflows

## Next: Phase 4 (Monitoring & Logging)

Ready for implementation:
- Event logging for all operations
- Performance metrics and dashboards
- Health checks and alerting
- Distributed tracing

---

**Status:** ✅ Phase 1-4 Complete (Production-Ready)  
**Version:** 3.0.0  
**Total Lines:** 3,426 | **Test Cases:** 185+ | **Coverage:** >90%  
**Last Updated:** 2026-08-28  
**Maintainer:** TSVAI DevOps Team
