#!/usr/bin/env node

/**
 * Harness Factory Main Server
 * Central orchestration and API server
 */

const express = require('express');
const path = require('path');

// Try to load components - gracefully handle missing modules
let HarnessOrchestrator, workflows;

try {
  HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');
  workflows = require('./ai/integration/src/e2e-workflows');
} catch (error) {
  console.error('Warning: Could not load orchestrator components');
  console.error('Make sure to run: npm install');
  process.exit(1);
}

const app = express();
app.use(express.json());

let orchestrator;

/**
 * Initialize harness on startup
 */
async function initializeHarness() {
  try {
    console.log('Initializing Harness Factory...');

    orchestrator = new HarnessOrchestrator();

    // Try to load components - some may not be installed yet
    const componentModules = {};

    const components = [
      { name: 'army-agents', path: './ai/army-agents/src/army-agents' },
      { name: 'brain-wiki', path: './ai/brain-wiki/src/brain-wiki' },
      { name: 'consilient', path: './ai/consilient/src/consilient' },
      { name: 'harvester', path: './ai/harvester/src/harvester' },
      { name: 'curator', path: './ai/curator/src/curator' },
      { name: 'vi-dashboard', path: './ai/vi-dashboard/src/vi-dashboard' }
    ];

    for (const component of components) {
      try {
        componentModules[component.name] = require(component.path);
        console.log(`✓ ${component.name} loaded`);
      } catch (error) {
        console.log(`✗ ${component.name} not available (run: npm install in ai/${component.name})`);
      }
    }

    // Initialize orchestrator with available components
    await orchestrator.initialize(componentModules);

    // Register workflows
    if (workflows) {
      orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);
      orchestrator.registerWorkflow('agent-learning', workflows.agentLearningWorkflow);
      orchestrator.registerWorkflow('content-processing', workflows.contentProcessingWorkflow);
      orchestrator.registerWorkflow('decision-making', workflows.decisionMakingWorkflow);
      orchestrator.registerWorkflow('integration-test', workflows.fullSystemIntegrationTest);
      orchestrator.registerWorkflow('monitoring', workflows.monitoringWorkflow);
    }

    console.log('✓ Harness Factory initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize harness:', error.message);
    return false;
  }
}

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({ status: 'unavailable', message: 'Harness not initialized' });
  }
  const health = orchestrator.getSystemHealth();
  res.json(health);
});

// Readiness check
app.get('/api/ready', (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({ ready: false });
  }
  res.json({ ready: true });
});

// System status
app.get('/api/status', (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({ error: 'Harness not initialized' });
  }
  const status = orchestrator.getSystemStatus();
  res.json(status);
});

// List workflows
app.get('/api/workflows', (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({ error: 'Harness not initialized' });
  }
  const workflows = orchestrator.listWorkflows();
  res.json({ workflows });
});

// Execute workflow
app.post('/api/workflows/execute', async (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(503).json({ error: 'Harness not initialized' });
    }

    const { workflow, inputs } = req.body;

    if (!workflow) {
      return res.status(400).json({ error: 'workflow parameter required' });
    }

    const result = await orchestrator.executeWorkflow(workflow, inputs || {});
    res.json(result);
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Diagnostics
app.get('/api/diagnostics', async (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(503).json({ error: 'Harness not initialized' });
    }
    const diagnostics = await orchestrator.runDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event log
app.get('/api/events', (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({ error: 'Harness not initialized' });
  }
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  const events = orchestrator.getEventLog(limit);
  res.json({ events });
});

// Serve static dashboard (if available)
try {
  app.use(express.static(path.join(__dirname, 'ai/vi-dashboard/public')));
} catch (error) {
  console.log('Dashboard not available');
}

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Harness Factory',
    version: '1.0.0',
    status: orchestrator ? 'ready' : 'not initialized',
    endpoints: {
      health: '/api/health',
      ready: '/api/ready',
      status: '/api/status',
      workflows: '/api/workflows',
      execute: 'POST /api/workflows/execute',
      diagnostics: '/api/diagnostics',
      events: '/api/events'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.HARNESS_PORT || 3000;

initializeHarness().then(success => {
  if (!success) {
    console.warn('WARNING: Harness not fully initialized, but server starting anyway...');
    console.warn('Run: npm install to complete setup');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ Harness Factory API listening on port ${PORT}`);
    console.log(`\nAccess:`);
    console.log(`  API:       http://localhost:${PORT}/api/health`);
    console.log(`  Dashboard: http://localhost:${PORT}/ (if available)`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run: npm install`);
    console.log(`  2. Deploy: ./deploy.sh --full`);
    console.log(`\nDocumentation:`);
    console.log(`  QUICK_START.md - Get started in 5 minutes`);
    console.log(`  COMMANDS_REFERENCE.md - Common commands`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
