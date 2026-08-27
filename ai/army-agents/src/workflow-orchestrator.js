/**
 * Workflow Orchestrator
 * Executes multi-step workflows with agent coordination
 * Supports sequences, parallel steps, conditionals, and dependencies
 */

class WorkflowOrchestrator {
  constructor(armyAgents, config = {}) {
    this.armyAgents = armyAgents;
    this.config = config;
    this.workflows = new Map(); // workflowId -> workflow def
    this.executions = new Map(); // executionId -> execution state
    this.executionCounter = 0;
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflowId, definition) {
    if (this.workflows.has(workflowId)) {
      throw new Error(`Workflow already registered: ${workflowId}`);
    }

    // Validate workflow structure
    const validation = this._validateWorkflow(definition);
    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    this.workflows.set(workflowId, definition);

    console.log(`[Orchestrator] Registered workflow: ${workflowId}`);

    return { success: true, workflowId };
  }

  /**
   * Start workflow execution
   */
  async executeWorkflow(workflowId, inputs = {}) {
    const workflow = this.workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = this._generateExecutionId();
    const execution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      inputs,
      steps: {},
      state: { ...inputs },
      results: {},
      errors: []
    };

    this.executions.set(executionId, execution);

    try {
      // Execute workflow steps
      await this._executeSteps(execution, workflow.steps);

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();

      console.log(`[Orchestrator] Workflow completed: ${executionId}`);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();

      console.error(`[Orchestrator] Workflow failed: ${executionId} - ${error.message}`);
    }

    return {
      executionId,
      status: execution.status,
      results: execution.results,
      error: execution.error
    };
  }

  /**
   * Get execution status
   */
  getExecution(executionId) {
    return this.executions.get(executionId);
  }

  /**
   * Get execution results
   */
  getResults(executionId) {
    const execution = this.executions.get(executionId);

    if (!execution) {
      return null;
    }

    return {
      executionId,
      workflowId: execution.workflowId,
      status: execution.status,
      results: execution.results,
      state: execution.state,
      errors: execution.errors,
      duration: this._getDuration(execution)
    };
  }

  /**
   * List workflow executions
   */
  listExecutions(workflowId = null, limit = 50) {
    let executions = Array.from(this.executions.values());

    if (workflowId) {
      executions = executions.filter(e => e.workflowId === workflowId);
    }

    return executions
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, limit)
      .map(e => ({
        executionId: e.id,
        workflowId: e.workflowId,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        duration: this._getDuration(e)
      }));
  }

  /**
   * Get workflow statistics
   */
  getStatistics() {
    const executions = Array.from(this.executions.values());

    const byStatus = {
      running: 0,
      completed: 0,
      failed: 0
    };

    const durations = [];

    executions.forEach(execution => {
      byStatus[execution.status] = (byStatus[execution.status] || 0) + 1;

      const duration = this._getDuration(execution);
      if (duration > 0) {
        durations.push(duration);
      }
    });

    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    return {
      totalWorkflows: this.workflows.size,
      totalExecutions: executions.length,
      byStatus,
      averageDuration: Math.round(avgDuration),
      successRate: executions.length > 0
        ? Math.round((byStatus.completed / executions.length) * 100)
        : 0,
      timestamp: new Date().toISOString()
    };
  }

  // ============ Private Methods ============

  async _executeSteps(execution, steps) {
    const stepsArray = Array.isArray(steps) ? steps : Object.values(steps);

    for (const step of stepsArray) {
      // Check if step should execute
      if (step.condition && !this._evaluateCondition(step.condition, execution.state)) {
        console.log(`[Orchestrator] Skipping step (condition false): ${step.id}`);
        continue;
      }

      // Execute step
      const result = await this._executeStep(execution, step);

      // Store result
      execution.results[step.id] = result;

      // Update state
      if (step.output) {
        execution.state[step.output] = result;
      }

      // Check for errors
      if (result.error && step.stopOnError !== false) {
        throw new Error(`Step failed: ${step.id} - ${result.error}`);
      }
    }
  }

  async _executeStep(execution, step) {
    try {
      execution.steps[step.id] = { status: 'running', startedAt: new Date().toISOString() };

      let result;

      switch (step.type) {
        case 'agent-call':
          result = await this._callAgent(step, execution.state);
          break;

        case 'transform':
          result = this._transform(step, execution.state);
          break;

        case 'merge':
          result = this._merge(step, execution.state);
          break;

        case 'validate':
          result = this._validate(step, execution.state);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      execution.steps[step.id].status = 'completed';
      execution.steps[step.id].completedAt = new Date().toISOString();

      return result;
    } catch (error) {
      execution.steps[step.id].status = 'failed';
      execution.steps[step.id].error = error.message;
      execution.errors.push({ step: step.id, error: error.message });

      throw error;
    }
  }

  async _callAgent(step, state) {
    const { agentCapability, method, params } = step;

    // Interpolate params with state
    const interpolatedParams = this._interpolateParams(params, state);

    // Execute on agent with capability
    const result = await this.armyAgents.executeOnCapability(
      agentCapability,
      method,
      interpolatedParams
    );

    return { success: true, data: result };
  }

  _transform(step, state) {
    const { input, operation } = step;
    const inputValue = state[input];

    switch (operation) {
      case 'stringify':
        return { success: true, data: JSON.stringify(inputValue) };

      case 'parse':
        return { success: true, data: JSON.parse(inputValue) };

      case 'uppercase':
        return { success: true, data: inputValue.toUpperCase() };

      case 'lowercase':
        return { success: true, data: inputValue.toLowerCase() };

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  _merge(step, state) {
    const { inputs, output } = step;
    const merged = {};

    inputs.forEach(key => {
      merged[key] = state[key];
    });

    return { success: true, data: merged };
  }

  _validate(step, state) {
    const { input, rule } = step;
    const value = state[input];

    const isValid = this._evaluateCondition(rule, { value });

    if (!isValid) {
      throw new Error(`Validation failed: ${step.id}`);
    }

    return { success: true, data: value };
  }

  _evaluateCondition(condition, state) {
    if (typeof condition === 'function') {
      return condition(state);
    }

    if (typeof condition === 'object') {
      const { field, operator, value } = condition;
      const fieldValue = state[field];

      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'not-equals':
          return fieldValue !== value;
        case 'greater-than':
          return fieldValue > value;
        case 'less-than':
          return fieldValue < value;
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        default:
          return true;
      }
    }

    return true;
  }

  _interpolateParams(params, state) {
    if (typeof params !== 'object') {
      return params;
    }

    const interpolated = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Reference to state variable
        const stateKey = value.substring(1);
        interpolated[key] = state[stateKey];
      } else if (typeof value === 'object') {
        interpolated[key] = this._interpolateParams(value, state);
      } else {
        interpolated[key] = value;
      }
    }

    return interpolated;
  }

  _validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  _generateExecutionId() {
    return `exec-${Date.now()}-${++this.executionCounter}`;
  }

  _getDuration(execution) {
    if (!execution.startedAt || !execution.completedAt) return 0;
    return new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime();
  }
}

module.exports = WorkflowOrchestrator;
