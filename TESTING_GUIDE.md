# TSVAI Harness Testing Guide

Complete guide for testing the integrated TSVAI Harness system before deployment.

## Prerequisites

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# For testing (optional but recommended)
npm install -g jest
```

## Phase 1: Unit Testing

### 1.1 Run All Tests

```bash
cd /Users/kbuchepalli/tsvai-harness

# Install dependencies
npm install

# Run complete test suite
npm test

# Expected output:
# PASS  ai/plugin/tests/plugin.test.js
# PASS  ai/army-agents/tests/agents.test.js
# PASS  ai/brain-wiki/tests/brain-wiki.test.js
# PASS  ai/consilient/tests/consilient.test.js
# PASS  ai/harvester/tests/harvester.test.js
# PASS  ai/curator/tests/curator.test.js
# PASS  ai/vi-dashboard/tests/dashboard.test.js
# PASS  ai/integration/tests/e2e.test.js
#
# Test Suites: 8 passed, 8 total
# Tests:       400+ passed, 400+ total
```

### 1.2 Run Specific Component Tests

```bash
# Test Brain-Wiki
npm test -- ai/brain-wiki/tests/brain-wiki.test.js

# Test Consilient
npm test -- ai/consilient/tests/consilient.test.js

# Test Harvester
npm test -- ai/harvester/tests/harvester.test.js

# Test Curator
npm test -- ai/curator/tests/curator.test.js

# Test VI-Dashboard
npm test -- ai/vi-dashboard/tests/dashboard.test.js

# Test Integration (Phase 10)
npm test -- ai/integration/tests/e2e.test.js
```

### 1.3 Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# View coverage for specific component
npm test -- --coverage ai/brain-wiki
```

---

## Phase 2: Manual Integration Testing

### 2.1 Initialize System

Create test file: `test-harness-init.js`

```javascript
const HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');
const ArmyAgents = require('./ai/army-agents/src/army-agents');
const BrainWiki = require('./ai/brain-wiki/src/brain-wiki');
const Consilient = require('./ai/consilient/src/consilient');
const Harvester = require('./ai/harvester/src/harvester');
const Curator = require('./ai/curator/src/curator');
const VIDashboard = require('./ai/vi-dashboard/src/vi-dashboard');

async function testInitialization() {
  console.log('=== TSVAI Harness Initialization Test ===\n');

  try {
    // Step 1: Create orchestrator
    console.log('1. Creating HarnessOrchestrator...');
    const orchestrator = new HarnessOrchestrator();
    console.log('   ✓ Orchestrator created\n');

    // Step 2: Initialize components
    console.log('2. Initializing components...');
    const result = await orchestrator.initialize({
      'army-agents': ArmyAgents,
      'brain-wiki': BrainWiki,
      'consilient': Consilient,
      'harvester': Harvester,
      'curator': Curator,
      'vi-dashboard': VIDashboard
    });

    if (!result.success) {
      throw new Error(`Initialization failed: ${result.error}`);
    }

    console.log(`   ✓ ${result.componentsInitialized} components initialized\n`);

    // Step 3: Get system health
    console.log('3. Checking system health...');
    const health = orchestrator.getSystemHealth();
    console.log(`   Overall Status: ${health.overall}`);
    console.log(`   Components: ${Object.keys(health.components).length}`);
    Object.entries(health.components).forEach(([name, status]) => {
      console.log(`     - ${name}: ${status.status}`);
    });
    console.log();

    // Step 4: Get system status
    console.log('4. Getting system status...');
    const status = orchestrator.getSystemStatus();
    console.log(`   Initialized: ${status.initialized}`);
    console.log(`   Components: ${status.componentsCount}`);
    console.log(`   Integrations: ${status.integrations}`);
    console.log(`   Event Log: ${status.eventLog} events\n`);

    // Step 5: Run diagnostics
    console.log('5. Running diagnostics...');
    const diagnostics = await orchestrator.runDiagnostics();
    console.log(`   Components tested: ${Object.keys(diagnostics.components).length}`);
    Object.entries(diagnostics.components).forEach(([name, result]) => {
      console.log(`     - ${name}: ${result.status}`);
    });
    console.log();

    console.log('✅ INITIALIZATION TEST PASSED\n');
    return true;

  } catch (error) {
    console.error('❌ INITIALIZATION TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testInitialization().then(success => {
  process.exit(success ? 0 : 1);
});
```

Run test:
```bash
node test-harness-init.js
```

### 2.2 Test Data Ingestion Workflow

Create test file: `test-data-ingestion.js`

```javascript
const HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');
const workflows = require('./ai/integration/src/e2e-workflows');
// ... import components ...

async function testDataIngestion() {
  console.log('=== Data Ingestion Workflow Test ===\n');

  const orchestrator = new HarnessOrchestrator();
  await orchestrator.initialize({
    // ... components ...
  });

  try {
    console.log('Registering data-ingestion workflow...');
    orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);

    console.log('Executing data-ingestion workflow...\n');
    const result = await orchestrator.executeWorkflow('data-ingestion', {
      pipelineId: 'test-pipeline'
    });

    if (!result.success) {
      throw new Error(`Workflow failed: ${result.error}`);
    }

    console.log('Workflow Execution Result:');
    console.log(`  Execution ID: ${result.executionId}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Harvested: ${result.result.harvested} items`);
    console.log(`  Curated: ${result.result.curated} items`);
    console.log(`  Learned: ${result.result.learned} items\n`);

    console.log('✅ DATA INGESTION TEST PASSED\n');
    return true;

  } catch (error) {
    console.error('❌ DATA INGESTION TEST FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

testDataIngestion().then(success => process.exit(success ? 0 : 1));
```

Run test:
```bash
node test-data-ingestion.js
```

### 2.3 Test All Workflows

Create test file: `test-all-workflows.js`

```javascript
const HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');
const workflows = require('./ai/integration/src/e2e-workflows');

async function testAllWorkflows() {
  console.log('=== All Workflows Test ===\n');

  const orchestrator = new HarnessOrchestrator();
  await orchestrator.initialize({
    // ... components ...
  });

  const workflowTests = [
    {
      name: 'data-ingestion',
      fn: workflows.dataIngestionWorkflow,
      inputs: { pipelineId: 'test-pipeline' }
    },
    {
      name: 'agent-learning',
      fn: workflows.agentLearningWorkflow,
      inputs: { tasks: [{ id: 'task1' }] }
    },
    {
      name: 'content-processing',
      fn: workflows.contentProcessingWorkflow,
      inputs: { sources: ['source1'], source: 'test' }
    },
    {
      name: 'decision-making',
      fn: workflows.decisionMakingWorkflow,
      inputs: { question: 'Test question?', minConfidence: 0.7 }
    },
    {
      name: 'integration-test',
      fn: workflows.fullSystemIntegrationTest,
      inputs: {}
    },
    {
      name: 'monitoring',
      fn: workflows.monitoringWorkflow,
      inputs: {}
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of workflowTests) {
    try {
      console.log(`Testing ${test.name}...`);
      orchestrator.registerWorkflow(test.name, test.fn);
      const result = await orchestrator.executeWorkflow(test.name, test.inputs);

      if (result.success) {
        console.log(`  ✓ ${test.name} passed (${result.duration}ms)\n`);
        passed++;
      } else {
        console.log(`  ✗ ${test.name} failed: ${result.error}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ${test.name} error: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passed}/${workflowTests.length}`);
  console.log(`Failed: ${failed}/${workflowTests.length}`);

  return failed === 0;
}

testAllWorkflows().then(success => process.exit(success ? 0 : 1));
```

Run test:
```bash
node test-all-workflows.js
```

---

## Phase 3: API Testing

### 3.1 Start Harness Server

Create file: `server.js`

```javascript
const express = require('express');
const HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');
const workflows = require('./ai/integration/src/e2e-workflows');

const app = express();
app.use(express.json());

let orchestrator;

// Initialize on startup
async function start() {
  orchestrator = new HarnessOrchestrator();
  
  await orchestrator.initialize({
    // ... components ...
  });

  // Register workflows
  orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);
  orchestrator.registerWorkflow('agent-learning', workflows.agentLearningWorkflow);
  orchestrator.registerWorkflow('content-processing', workflows.contentProcessingWorkflow);
  orchestrator.registerWorkflow('decision-making', workflows.decisionMakingWorkflow);
  orchestrator.registerWorkflow('integration-test', workflows.fullSystemIntegrationTest);
  orchestrator.registerWorkflow('monitoring', workflows.monitoringWorkflow);

  console.log('✓ Harness initialized');
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  const health = orchestrator.getSystemHealth();
  res.json(health);
});

// System status
app.get('/api/status', (req, res) => {
  const status = orchestrator.getSystemStatus();
  res.json(status);
});

// Diagnostics
app.get('/api/diagnostics', async (req, res) => {
  try {
    const diagnostics = await orchestrator.runDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List workflows
app.get('/api/workflows', (req, res) => {
  const workflows = orchestrator.listWorkflows();
  res.json({ workflows });
});

// Execute workflow
app.post('/api/workflows/execute', async (req, res) => {
  try {
    const { workflow, inputs } = req.body;
    const result = await orchestrator.executeWorkflow(workflow, inputs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event log
app.get('/api/events', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  const events = orchestrator.getEventLog(limit);
  res.json({ events });
});

// Start server
start().then(() => {
  app.listen(3000, () => {
    console.log('Harness API server listening on port 3000');
    console.log('Dashboard on port 3001');
  });
});
```

### 3.2 Test API Endpoints

```bash
# Start server
node server.js

# In another terminal, test endpoints:

# 1. Health check
curl http://localhost:3000/api/health | jq

# 2. System status
curl http://localhost:3000/api/status | jq

# 3. List workflows
curl http://localhost:3000/api/workflows | jq

# 4. Execute data ingestion
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "data-ingestion",
    "inputs": {"pipelineId": "test-pipeline"}
  }' | jq

# 5. Execute decision making
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "decision-making",
    "inputs": {"question": "Should we scale?", "minConfidence": 0.8}
  }' | jq

# 6. Get diagnostics
curl http://localhost:3000/api/diagnostics | jq

# 7. Get event log
curl http://localhost:3000/api/events?limit=50 | jq
```

---

## Phase 4: Performance Testing

### 4.1 Throughput Test

Create file: `test-throughput.js`

```javascript
async function testThroughput() {
  console.log('=== Throughput Test ===\n');

  const orchestrator = new HarnessOrchestrator();
  await orchestrator.initialize({
    // ... components ...
  });

  orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);

  console.log('Executing 10 workflows sequentially...\n');
  const startTime = Date.now();
  let totalDuration = 0;

  for (let i = 0; i < 10; i++) {
    const result = await orchestrator.executeWorkflow('data-ingestion', {
      pipelineId: `test-${i}`
    });

    if (result.success) {
      totalDuration += result.duration;
      console.log(`${i + 1}. Duration: ${result.duration}ms`);
    }
  }

  const totalTime = Date.now() - startTime;
  const avgDuration = totalDuration / 10;
  const throughput = (10 / (totalTime / 1000)).toFixed(2);

  console.log(`\nResults:`);
  console.log(`  Total Time: ${totalTime}ms`);
  console.log(`  Average Duration: ${avgDuration.toFixed(0)}ms`);
  console.log(`  Throughput: ${throughput} workflows/sec`);
}
```

### 4.2 Memory Test

```bash
# Run with profiling
NODE_OPTIONS="--expose-gc" node server.js

# In another terminal, trigger workflows and monitor
watch -n 1 'node -e "console.log(process.memoryUsage())"'
```

---

## Phase 5: Integration Test Checklist

Run through these verification steps:

### 5.1 Component Integration Checks

- [ ] Brain-Wiki stores and retrieves entries
- [ ] Consilient discovers patterns from decisions
- [ ] Harvester collects data from sources
- [ ] Curator validates and filters content
- [ ] VI-Dashboard receives metrics
- [ ] Army-Agents execute tasks

### 5.2 Workflow Checks

- [ ] Data Ingestion: Harvest → Curate → Learn
- [ ] Agent Learning: Execute → Mine → Learn
- [ ] Content Processing: Collect → Curate → Learn
- [ ] Decision Making: Query → Pattern → Decide
- [ ] System Test: All components healthy
- [ ] Monitoring: Metrics collected and reported

### 5.3 API Checks

- [ ] Health endpoint responds
- [ ] Status endpoint returns full status
- [ ] Diagnostics runs without errors
- [ ] Workflows can be executed via API
- [ ] Event log is maintained
- [ ] Errors are handled gracefully

### 5.4 Performance Checks

- [ ] Workflows complete in <10s
- [ ] Memory usage stays <500MB
- [ ] CPU usage stays <50%
- [ ] Throughput >1 workflow/sec

---

## Testing Commands Summary

```bash
# 1. Run full test suite
npm test

# 2. Run component tests
npm test -- ai/integration/tests/e2e.test.js

# 3. Generate coverage
npm test -- --coverage

# 4. Initialize system
node test-harness-init.js

# 5. Test workflows
node test-all-workflows.js

# 6. Start API server
node server.js

# 7. Test API
curl http://localhost:3000/api/health

# 8. Performance test
node test-throughput.js
```

---

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

```bash
# Solution: Install dependencies
npm install
```

### Issue: Component initialization fails

```bash
# Check logs
npm run logs

# Verify configuration
cat .env

# Run diagnostics
curl http://localhost:3000/api/diagnostics
```

### Issue: Workflow timeout

```bash
# Increase timeout
WORKFLOW_TIMEOUT=60000 node server.js

# Check system health
curl http://localhost:3000/api/health
```

### Issue: High memory usage

```bash
# Enable profiling
NODE_OPTIONS="--prof" node server.js

# Generate profile
node --prof-process isolate-*.log > profile.txt
```

---

## Next Steps

After successful testing:

1. **Deploy to Kubernetes** - See KUBERNETES_DEPLOYMENT.md
2. **Monitor in Production** - Use VI-Dashboard
3. **Scale Horizontally** - Add more replicas
4. **Backup Data** - Regular backup of brain-wiki

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-28
