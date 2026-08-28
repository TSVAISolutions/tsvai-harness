/**
 * Harness Orchestrator
 * Central orchestration system tying all TSVAI components together
 * Provides unified interface for complete system operation
 */

class HarnessOrchestrator {
  constructor(config = {}) {
    this.config = config;

    // Initialize all components
    this.components = new Map();
    this.workflows = new Map();
    this.integrations = new Map();
    this.systemState = {};
    this.eventBus = [];
    this.initialized = false;
  }

  /**
   * Initialize complete harness
   */
  async initialize(componentModules) {
    try {
      // Register all components
      for (const [name, Module] of Object.entries(componentModules)) {
        const instance = new Module(this.config[name] || {});

        this.components.set(name, instance);

        this._logEvent('component_initialized', { component: name });
      }

      // Setup cross-component integrations
      this._setupIntegrations();

      // Initialize system state
      this._initializeSystemState();

      this.initialized = true;

      return {
        success: true,
        componentsInitialized: this.components.size,
        status: 'ready'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Get component
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * Register an end-to-end workflow
   */
  registerWorkflow(name, workflowFn, config = {}) {
    this.workflows.set(name, {
      name,
      fn: workflowFn,
      config,
      registered: new Date().toISOString(),
      runs: 0,
      lastRun: null
    });

    return { success: true, workflowName: name };
  }

  /**
   * Execute end-to-end workflow
   */
  async executeWorkflow(name, inputs = {}) {
    const workflow = this.workflows.get(name);

    if (!workflow) {
      return { success: false, error: `Workflow not found: ${name}` };
    }

    const executionId = `workflow-${Date.now()}`;

    this._logEvent('workflow_started', { workflow: name, executionId });

    try {
      const result = await workflow.fn(this, inputs);

      workflow.runs++;
      workflow.lastRun = new Date().toISOString();

      this._logEvent('workflow_completed', { workflow: name, executionId, duration: result.duration });

      return {
        success: true,
        executionId,
        workflow: name,
        result,
        duration: result.duration
      };
    } catch (error) {
      this._logEvent('workflow_failed', { workflow: name, executionId, error: error.message });

      return {
        success: false,
        executionId,
        workflow: name,
        error: error.message
      };
    }
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      components: {},
      stats: {}
    };

    // Gather component health
    for (const [name, component] of this.components.entries()) {
      if (component.getHealth) {
        health.components[name] = component.getHealth();
      }

      if (component.getStatistics) {
        health.stats[name] = component.getStatistics();
      }
    }

    // Determine overall health
    const unhealthyComponents = Object.values(health.components).filter(c => c?.status === 'unhealthy');

    if (unhealthyComponents.length > 0) {
      health.overall = 'degraded';
    }

    return health;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      initialized: this.initialized,
      componentsCount: this.components.size,
      workflowsCount: this.workflows.size,
      health: this.getSystemHealth(),
      integrations: this.integrations.size,
      eventLog: this.eventBus.length
    };
  }

  /**
   * Run system diagnostics
   */
  async runDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      components: {},
      connectivity: {},
      performance: {}
    };

    // Test each component
    for (const [name, component] of this.components.entries()) {
      try {
        if (component.getStatistics) {
          diagnostics.components[name] = {
            status: 'ok',
            stats: component.getStatistics()
          };
        } else {
          diagnostics.components[name] = { status: 'ok' };
        }
      } catch (error) {
        diagnostics.components[name] = {
          status: 'error',
          error: error.message
        };
      }
    }

    // Test connectivity between components
    try {
      const armyAgents = this.components.get('army-agents');
      const brainWiki = this.components.get('brain-wiki');

      if (armyAgents && brainWiki) {
        diagnostics.connectivity['army-agents→brain-wiki'] = 'connected';
      }
    } catch {
      diagnostics.connectivity['army-agents→brain-wiki'] = 'error';
    }

    return diagnostics;
  }

  /**
   * Get event log
   */
  getEventLog(limit = 100) {
    return this.eventBus.slice(-limit);
  }

  /**
   * List workflows
   */
  listWorkflows() {
    return Array.from(this.workflows.values()).map(w => ({
      name: w.name,
      registered: w.registered,
      runs: w.runs,
      lastRun: w.lastRun
    }));
  }

  // ============ Private Methods ============

  _setupIntegrations() {
    // Plugin System → Army-Agents
    this.integrations.set('plugin→agents', {
      from: 'plugin-system',
      to: 'army-agents',
      type: 'skill-to-agent'
    });

    // Army-Agents → Brain-Wiki
    this.integrations.set('agents→knowledge', {
      from: 'army-agents',
      to: 'brain-wiki',
      type: 'learning'
    });

    // Harvester → Curator
    this.integrations.set('data→curator', {
      from: 'harvester',
      to: 'curator',
      type: 'quality-check'
    });

    // Curator → Brain-Wiki
    this.integrations.set('curator→knowledge', {
      from: 'curator',
      to: 'brain-wiki',
      type: 'ingestion'
    });

    // Brain-Wiki → Consilient
    this.integrations.set('knowledge→consensus', {
      from: 'brain-wiki',
      to: 'consilient',
      type: 'pattern-mining'
    });

    // All → VI-Dashboard
    this.integrations.set('all→dashboard', {
      from: 'all-components',
      to: 'vi-dashboard',
      type: 'telemetry'
    });
  }

  _initializeSystemState() {
    this.systemState = {
      startedAt: new Date().toISOString(),
      uptime: 0,
      workflowsExecuted: 0,
      eventsLogged: 0,
      componentsHealthy: this.components.size
    };
  }

  _logEvent(type, data) {
    this.eventBus.push({
      timestamp: new Date().toISOString(),
      type,
      data
    });

    // Keep log bounded
    if (this.eventBus.length > 1000) {
      this.eventBus.shift();
    }
  }
}

module.exports = HarnessOrchestrator;
