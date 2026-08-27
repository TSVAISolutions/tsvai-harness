# Workflow Orchestration Guide

Complete guide to building and executing multi-agent workflows in TSVAI Army-Agents system.

## Overview

The Workflow Orchestration system enables:
- **Sequential execution** - Steps run one after another with state passing
- **Conditional logic** - Skip or execute steps based on state conditions
- **State management** - Shared state across agents and steps
- **Consensus decisions** - Multi-agent voting and conflict resolution
- **Error handling** - Retry logic and failure recovery

## Core Components

### 1. WorkflowOrchestrator

Executes multi-step workflows and manages execution state.

```javascript
const WorkflowOrchestrator = require('../src/workflow-orchestrator');
const orchestrator = new WorkflowOrchestrator(armyAgents);
```

#### Register Workflow

Define a workflow with steps:

```javascript
orchestrator.registerWorkflow('data-pipeline', {
  steps: [
    {
      id: 'validate-input',
      type: 'validate',
      input: 'raw-data',
      rule: { field: 'value', operator: 'exists' },
      output: 'validated-data'
    },
    {
      id: 'transform-data',
      type: 'transform',
      input: 'validated-data',
      operation: 'uppercase',
      output: 'transformed'
    },
    {
      id: 'call-processor',
      type: 'agent-call',
      agentCapability: 'data-processor',
      method: 'process',
      params: { data: '$transformed' },
      output: 'processed-result'
    }
  ]
});
```

#### Execute Workflow

Start a workflow with inputs:

```javascript
const result = await orchestrator.executeWorkflow('data-pipeline', {
  'raw-data': { value: 'hello' }
});

console.log(result.executionId);  // Track execution
console.log(result.status);       // 'completed' | 'failed'
console.log(result.results);      // All step results
```

#### Get Results

Retrieve execution details:

```javascript
const results = orchestrator.getResults(executionId);

console.log(results.status);      // 'completed' | 'running' | 'failed'
console.log(results.results);     // Output from each step
console.log(results.state);       // Final state
console.log(results.duration);    // Execution time in ms
```

#### List Executions

Get execution history:

```javascript
const executions = orchestrator.listExecutions('workflow-id', limit);
// [
//   { executionId, workflowId, status, startedAt, completedAt, duration },
//   ...
// ]
```

### 2. StateManager

Manages shared state across workflow steps and agents.

```javascript
const StateManager = require('../src/state-manager');
const stateManager = new StateManager();
```

#### Get/Set State

Access state values:

```javascript
// Set value
stateManager.set('users.count', 42);

// Get value
const count = stateManager.get('users.count');  // 42

// Get nested value
stateManager.set('config.database.host', 'localhost');
const host = stateManager.get('config.database.host');
```

#### Batch Operations

Update multiple values efficiently:

```javascript
stateManager.batchSet({
  'execution.id': 'exec-123',
  'execution.status': 'running',
  'execution.startTime': new Date().toISOString()
});
```

#### Snapshots & History

Track state changes over time:

```javascript
// Create snapshot
const snapshot = stateManager.getSnapshot();
console.log(snapshot.version);   // Current version
console.log(snapshot.data);      // All state

// Get history
const history = stateManager.getHistory(limit);
// [
//   { version, timestamp, changes },
//   ...
// ]

// Restore to previous version
stateManager.restoreVersion(versionNumber);
```

#### Locking

Prevent concurrent modifications:

```javascript
// Acquire lock (30s TTL default)
const lock = stateManager.lock('critical.data', 'agent-1');

if (lock.success) {
  // Modify protected state
  stateManager.set('critical.data', newValue);

  // Release lock
  stateManager.unlock('critical.data', 'agent-1');
}
```

#### Watching

React to state changes:

```javascript
stateManager.watch('users.count', (change) => {
  console.log(`Users changed from ${change.oldValue} to ${change.newValue}`);
});

stateManager.set('users.count', 100);  // Triggers watcher

// Stop watching
stateManager.unwatch('users.count', callback);
```

#### Merging State

Combine state from multiple sources:

```javascript
// Merge strategy: 'merge' (default), 'replace', 'deep-merge'
stateManager.merge({
  users: { alice: { role: 'admin' } },
  settings: { theme: 'dark' }
}, 'deep-merge');
```

#### Validation

Verify state schema:

```javascript
const valid = stateManager.validate({
  users: { type: 'object', required: true },
  config: { type: 'object', required: false }
});

if (!valid.valid) {
  console.log(valid.errors);
}
```

### 3. ConsensusEngine

Enable multi-agent decision making.

```javascript
const ConsensusEngine = require('../src/consensus-engine');
const consensus = new ConsensusEngine(armyAgents);
```

#### Propose Decision

Request votes from agents:

```javascript
const result = await consensus.proposeDecision({
  capability: 'analyzer',      // Target agents with this capability
  content: { data: 'analyze' }, // Data to analyze
  priority: 'high',             // Optional priority
  deadline: futureDate          // Optional deadline
});

console.log(result.proposalId);   // Track proposal
console.log(result.decided);      // true if quorum reached
console.log(result.decision);     // 'yes' | 'no' | etc
console.log(result.consensus);    // % agreement
```

#### Record Votes

Agents submit votes (usually automatic):

```javascript
consensus.recordVote(
  proposalId,
  agentId,
  'yes',  // Vote value
  'Reasoning explanation'  // Optional
);
```

#### Resolve Conflicts

Choose best option when agents disagree:

```javascript
const resolution = consensus.resolveConflict(
  [
    { id: '1', confidence: 0.95, priority: 'high' },
    { id: '2', confidence: 0.70, priority: 'low' }
  ],
  { deadline: futureDate }  // Optional context
);

console.log(resolution.outcome);       // Winning proposal
console.log(resolution.confidence);    // Support level
console.log(resolution.conflictLevel); // Disagreement severity
console.log(resolution.allProposals);  // Ranked all options
```

#### Statistics

Monitor consensus patterns:

```javascript
const stats = consensus.getStatistics();
// {
//   totalProposals,
//   byStatus: { voting, 'quorum-reached', decided, failed },
//   averageConsensus,      // % agreement
//   averageConflictLevel,  // Disagreement % when conflicts exist
//   timestamp
// }
```

## Step Types

### transform

Transform a state value.

```javascript
{
  id: 'uppercase-names',
  type: 'transform',
  input: 'user.name',
  operation: 'uppercase',  // 'uppercase' | 'lowercase' | 'stringify' | 'parse'
  output: 'processed-name'
}
```

### validate

Validate state against a rule.

```javascript
{
  id: 'check-count',
  type: 'validate',
  input: 'results.count',
  rule: { field: 'value', operator: 'greater-than', value: 0 },
  stopOnError: false  // Continue even if validation fails
}
```

Operators: `equals`, `not-equals`, `greater-than`, `less-than`, `exists`

### merge

Combine multiple state values.

```javascript
{
  id: 'merge-results',
  type: 'merge',
  inputs: ['step1', 'step2', 'step3'],
  output: 'combined'
}
```

### agent-call

Call an agent with capability.

```javascript
{
  id: 'analyze-data',
  type: 'agent-call',
  agentCapability: 'analyzer',
  method: 'analyze',
  params: {
    data: '$input-data',      // Reference state with $
    threshold: 0.8,           // Or literal values
    options: '$config'        // Nested references work too
  },
  output: 'analysis-result'
}
```

## Conditions

Skip steps based on state:

```javascript
{
  id: 'conditional-step',
  type: 'transform',
  input: 'status',
  operation: 'uppercase',
  condition: {
    field: 'status',
    operator: 'equals',
    value: 'active'
  }
}
```

Operators: `equals`, `not-equals`, `greater-than`, `less-than`, `exists`

Or use custom function:

```javascript
condition: (state) => state.count > 10 && state.status === 'ready'
```

## Complete Example

```javascript
// Setup
const orchestrator = new WorkflowOrchestrator(armyAgents);
const stateManager = new StateManager();
const consensus = new ConsensusEngine(armyAgents);

// Define workflow
orchestrator.registerWorkflow('ml-pipeline', {
  steps: [
    {
      id: 'load-data',
      type: 'agent-call',
      agentCapability: 'data-loader',
      method: 'load',
      params: { source: '$dataSource' },
      output: 'raw-data'
    },
    {
      id: 'validate-data',
      type: 'validate',
      input: 'raw-data',
      rule: { field: 'value', operator: 'exists' }
    },
    {
      id: 'propose-preprocessing',
      type: 'agent-call',
      agentCapability: 'processor',
      method: 'preprocess',
      params: { data: '$raw-data' },
      output: 'preprocessed'
    },
    {
      id: 'get-consensus',
      type: 'merge',
      inputs: ['preprocessed', 'dataSource'],
      output: 'model-input',
      condition: { field: 'preprocessed', operator: 'exists' }
    }
  ]
});

// Initialize state
stateManager.set('execution.dataSource', '/data/input.csv');
stateManager.set('execution.timestamp', new Date().toISOString());

// Watch execution
stateManager.watch('execution.status', (change) => {
  console.log(`Status: ${change.oldValue} → ${change.newValue}`);
});

// Execute
const result = await orchestrator.executeWorkflow('ml-pipeline', {
  dataSource: '/data/input.csv'
});

// Check results
const finalResults = orchestrator.getResults(result.executionId);
console.log('Workflow complete:', finalResults.status);
console.log('Duration:', finalResults.duration, 'ms');
console.log('Results:', finalResults.results);
```

## Error Handling

### Step Failures

```javascript
{
  id: 'risky-step',
  type: 'agent-call',
  agentCapability: 'risky-capability',
  method: 'attempt',
  params: { ... },
  stopOnError: false  // Continue workflow even if this fails
}
```

### Execution Errors

```javascript
const result = await orchestrator.executeWorkflow(workflowId, inputs);

if (result.status === 'failed') {
  const execution = orchestrator.getExecution(result.executionId);
  console.log(execution.error);      // What failed
  console.log(execution.errors);     // All step failures
}
```

### Fallback Steps

Chain steps to handle failures:

```javascript
{
  steps: [
    { id: 'primary', type: 'agent-call', ... },
    {
      id: 'fallback',
      type: 'agent-call',
      condition: (state) => state.primary?.error !== undefined,
      ...
    }
  ]
}
```

## Performance Tips

1. **Batch state updates** - Use `batchSet()` instead of multiple `set()` calls
2. **Use snapshots** - For complex debugging, capture full state snapshots
3. **Limit history** - StateManager auto-bounds history at 1,000 entries
4. **Lock strategically** - Only lock critical sections to avoid blocking
5. **Condition early** - Skip expensive steps with conditions

## Best Practices

1. **Name steps clearly** - Use descriptive IDs for debugging
2. **Document state schema** - Comment expected state structure
3. **Use agent capabilities** - Prefer `agentCapability` over hard-coding agent IDs
4. **Track progress** - Use `watch()` to monitor long workflows
5. **Validate early** - Add validate steps after data loads
6. **Handle timeouts** - Set voting timeouts for consensus
7. **Monitor performance** - Use `getStatistics()` to track issues

## Testing

```javascript
// Mock agent for testing
registry.registerAgent({
  id: 'test-agent',
  name: 'Test Agent',
  capabilities: ['test-capability'],
  healthy: true
});

// Test workflow
const result = await orchestrator.executeWorkflow('test-workflow', {
  testData: 'value'
});

expect(result.status).toBe('completed');
expect(result.results.stepId.data).toBe('expected');
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Step not executing | Check conditions, verify step.id |
| State not updated | Use correct namespace.key path |
| Agent not found | Verify agentCapability matches registered agents |
| Lock timeout | Increase TTL or check for deadlocks |
| Workflow timeout | Check for infinite loops in conditions |

## Next: Phase 4 - Monitoring & Logging

The Monitoring & Logging phase adds:
- Event logging for all workflow operations
- Performance dashboards
- Health checks and alerting
- Distributed tracing

---

**Version:** 1.0.0  
**Status:** Production-Ready  
**Last Updated:** 2026-08-28
