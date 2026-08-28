/**
 * End-to-End Workflows
 * Complete workflows demonstrating harness integration
 */

/**
 * Data Ingestion Workflow
 * Harvester → Normalizer → Curator → Brain-Wiki
 */
async function dataIngestionWorkflow(orchestrator, inputs) {
  const startTime = Date.now();

  const harvester = orchestrator.getComponent('harvester');
  const curator = orchestrator.getComponent('curator');
  const brainWiki = orchestrator.getComponent('brain-wiki');

  // Step 1: Harvest data from sources
  const harvestResult = await harvester.executePipeline(inputs.pipelineId);

  if (!harvestResult.success) {
    throw new Error(`Harvest failed: ${harvestResult.error}`);
  }

  // Step 2: Curate data quality
  const curatedItems = [];

  for (const item of harvestResult.items) {
    const curationResult = curator.curate(item);

    if (curationResult.accepted) {
      curatedItems.push(curationResult);
    }
  }

  // Step 3: Ingest into knowledge base
  const learnedFacts = [];

  for (const item of curatedItems) {
    const learnResult = brainWiki.learn(item.content, {
      source: inputs.pipelineId,
      confidence: item.score,
      tags: item.classification?.tags || []
    });

    learnedFacts.push(learnResult);
  }

  return {
    harvested: harvestResult.items?.length || 0,
    curated: curatedItems.length,
    learned: learnedFacts.length,
    duration: Date.now() - startTime
  };
}

/**
 * Agent Learning Workflow
 * Task execution → Pattern mining → Knowledge updates
 */
async function agentLearningWorkflow(orchestrator, inputs) {
  const startTime = Date.now();

  const armyAgents = orchestrator.getComponent('army-agents');
  const consilient = orchestrator.getComponent('consilient');
  const brainWiki = orchestrator.getComponent('brain-wiki');

  // Step 1: Execute tasks through agents
  const executionResults = [];

  for (const task of inputs.tasks) {
    const result = await armyAgents.executeTask(task);

    executionResults.push(result);
    consilient.recordDecision(result);
  }

  // Step 2: Mine patterns from executions
  const patterns = consilient.minePatterns();

  // Step 3: Learn patterns into knowledge base
  for (const pattern of patterns.patterns) {
    brainWiki.learn(`Pattern: ${pattern.id}`, {
      source: 'agent-learning',
      type: 'pattern',
      confidence: pattern.confidence,
      tags: ['learned', 'pattern']
    });
  }

  return {
    tasksExecuted: executionResults.length,
    patternsDiscovered: patterns.patternsFound,
    successRate: patterns.patterns.filter(p => p.successRate > 0.8).length,
    duration: Date.now() - startTime
  };
}

/**
 * Content Processing Workflow
 * Process → Filter → Classify → Learn
 */
async function contentProcessingWorkflow(orchestrator, inputs) {
  const startTime = Date.now();

  const harvester = orchestrator.getComponent('harvester');
  const curator = orchestrator.getComponent('curator');
  const brainWiki = orchestrator.getComponent('brain-wiki');

  // Step 1: Collect content from sources
  const collection = await harvester.collectFromSources(inputs.sources);

  if (!collection.success) {
    throw new Error(`Collection failed: ${collection.error}`);
  }

  // Step 2: Batch curate
  const curationBatch = curator.curateBatch(collection.items);

  // Step 3: Process accepted content
  const processed = [];

  for (const result of curationBatch.results) {
    if (result.accepted) {
      // Classify content
      const classification = result.classification;

      // Learn with full context
      const learned = brainWiki.learn(result.content, {
        source: inputs.source,
        type: classification.categories[0]?.name || 'uncategorized',
        confidence: result.score,
        tags: classification.tags,
        sentiment: classification.sentiment
      });

      processed.push(learned);
    }
  }

  return {
    collected: collection.items?.length || 0,
    curated: curationBatch.acceptedItems,
    processed: processed.length,
    acceptanceRate: curationBatch.acceptanceRate,
    duration: Date.now() - startTime
  };
}

/**
 * Decision Making Workflow
 * Query knowledge → Mine patterns → Make decision with consensus
 */
async function decisionMakingWorkflow(orchestrator, inputs) {
  const startTime = Date.now();

  const brainWiki = orchestrator.getComponent('brain-wiki');
  const consilient = orchestrator.getComponent('consilient');
  const armyAgents = orchestrator.getComponent('army-agents');

  // Step 1: Query knowledge base
  const knowledge = brainWiki.ask(inputs.question);

  // Step 2: Get relevant patterns
  const patterns = consilient.minePatterns();
  const relevantPatterns = patterns.patterns.filter(p =>
    p.successRate > inputs.minConfidence
  );

  // Step 3: Check for conflicts
  let decision = knowledge.explanation.definition;
  let confidence = knowledge.confidence;

  if (relevantPatterns.length > 0) {
    // Use highest-confidence pattern
    const best = relevantPatterns[0];
    decision = best.output;
    confidence = best.confidence;
  }

  // Step 4: Validate with consensus
  const proposedOptions = [knowledge.explanation, ...relevantPatterns];
  const resolution = consilient.resolveConflict(proposedOptions);

  return {
    question: inputs.question,
    decision: resolution.outcome,
    confidence: resolution.confidence,
    patternsConsidered: relevantPatterns.length,
    duration: Date.now() - startTime
  };
}

/**
 * Full System Integration Test
 * Test all components working together
 */
async function fullSystemIntegrationTest(orchestrator, inputs) {
  const startTime = Date.now();

  const results = {
    componentsReady: [],
    workflowsExecuted: [],
    errors: []
  };

  // Check all components
  const components = [
    'plugin-system',
    'army-agents',
    'brain-wiki',
    'consilient',
    'harvester',
    'curator',
    'vi-dashboard'
  ];

  for (const componentName of components) {
    const component = orchestrator.getComponent(componentName);

    if (component) {
      results.componentsReady.push(componentName);
    } else {
      results.errors.push(`Component not found: ${componentName}`);
    }
  }

  // Get system health
  const health = orchestrator.getSystemHealth();
  results.health = health;

  // Run diagnostics
  const diagnostics = await orchestrator.runDiagnostics();
  results.diagnostics = diagnostics;

  return {
    success: results.errors.length === 0,
    componentsReady: results.componentsReady.length,
    totalComponents: components.length,
    health: health.overall,
    diagnostics: diagnostics,
    errors: results.errors,
    duration: Date.now() - startTime
  };
}

/**
 * Monitoring & Alerting Workflow
 * Continuous system monitoring
 */
async function monitoringWorkflow(orchestrator, inputs) {
  const startTime = Date.now();

  const dashboard = orchestrator.getComponent('vi-dashboard');
  const metrics = [];

  // Collect metrics from all components
  const health = orchestrator.getSystemHealth();

  for (const [componentName, componentHealth] of Object.entries(health.components)) {
    const metric = {
      component: componentName,
      status: componentHealth.status,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    // Feed to dashboard
    if (dashboard) {
      dashboard.feedData('monitoring', metric);
    }
  }

  // Check for alerts
  const alerts = [];

  for (const metric of metrics) {
    if (metric.status === 'unhealthy') {
      alerts.push({
        severity: 'critical',
        component: metric.component,
        message: `Component ${metric.component} is unhealthy`,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    metricsCollected: metrics.length,
    alerts: alerts.length,
    healthySystems: metrics.filter(m => m.status === 'healthy').length,
    duration: Date.now() - startTime
  };
}

module.exports = {
  dataIngestionWorkflow,
  agentLearningWorkflow,
  contentProcessingWorkflow,
  decisionMakingWorkflow,
  fullSystemIntegrationTest,
  monitoringWorkflow
};
