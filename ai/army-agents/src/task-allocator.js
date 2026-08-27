/**
 * Task Allocator
 * Intelligent task assignment to agents based on capability matching
 * Pattern inspired by vega/army allocation strategy
 */

class TaskAllocator {
  constructor(registry, config = {}) {
    this.registry = registry;
    this.config = {
      loadBalancing: config.loadBalancing || 'round-robin',
      preferHealthy: config.preferHealthy !== false,
      ...config
    };

    this.allocationLog = [];
    this.agentWorkload = new Map(); // agentId -> current task count
  }

  /**
   * Allocate task to best available agent
   */
  allocateTask(task) {
    if (!task.capability) {
      throw new Error('Task must specify required capability');
    }

    // Find agents with capability
    const candidates = this.registry.findByCapability(task.capability);

    if (candidates.length === 0) {
      return {
        success: false,
        error: `No agents available with capability: ${task.capability}`
      };
    }

    // Filter by health if enabled
    const filtered = this.config.preferHealthy
      ? candidates.filter(a => a.healthy)
      : candidates;

    if (filtered.length === 0) {
      return {
        success: false,
        error: `No healthy agents with capability: ${task.capability}`
      };
    }

    // Select agent based on strategy
    const agent = this._selectAgent(filtered);

    // Track workload
    const current = this.agentWorkload.get(agent.id) || 0;
    this.agentWorkload.set(agent.id, current + 1);

    this._logAllocation(task, agent);

    return {
      success: true,
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name
    };
  }

  /**
   * Update agent workload after task completion
   */
  completeTask(agentId) {
    const current = this.agentWorkload.get(agentId) || 0;
    if (current > 0) {
      this.agentWorkload.set(agentId, current - 1);
    }
  }

  /**
   * Get agent workload
   */
  getWorkload(agentId) {
    return this.agentWorkload.get(agentId) || 0;
  }

  /**
   * Get workload statistics
   */
  getWorkloadStats() {
    const workloads = Array.from(this.agentWorkload.values());

    if (workloads.length === 0) {
      return {
        totalWorkload: 0,
        averageWorkload: 0,
        maxWorkload: 0,
        minWorkload: 0,
        agents: {}
      };
    }

    const agents = {};
    this.agentWorkload.forEach((workload, agentId) => {
      const agent = this.registry.getAgent(agentId);
      agents[agentId] = {
        name: agent?.name || agentId,
        workload
      };
    });

    return {
      totalWorkload: workloads.reduce((a, b) => a + b, 0),
      averageWorkload: Math.round(workloads.reduce((a, b) => a + b, 0) / workloads.length),
      maxWorkload: Math.max(...workloads),
      minWorkload: Math.min(...workloads),
      agents
    };
  }

  /**
   * Get allocation history
   */
  getAllocationLog(limit = 100) {
    return this.allocationLog.slice(-limit);
  }

  // ============ Private Methods ============

  _selectAgent(candidates) {
    switch (this.config.loadBalancing) {
      case 'least-loaded':
        return this._selectLeastLoaded(candidates);

      case 'round-robin':
      default:
        return this._selectRoundRobin(candidates);

      case 'random':
        return this._selectRandom(candidates);
    }
  }

  _selectLeastLoaded(candidates) {
    let bestAgent = candidates[0];
    let lowestLoad = this.agentWorkload.get(bestAgent.id) || 0;

    for (const agent of candidates.slice(1)) {
      const load = this.agentWorkload.get(agent.id) || 0;
      if (load < lowestLoad) {
        bestAgent = agent;
        lowestLoad = load;
      }
    }

    return bestAgent;
  }

  _selectRoundRobin(candidates) {
    if (!this._rrIndex) {
      this._rrIndex = 0;
    }

    const index = this._rrIndex % candidates.length;
    this._rrIndex++;

    return candidates[index];
  }

  _selectRandom(candidates) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  _logAllocation(task, agent) {
    this.allocationLog.push({
      timestamp: new Date().toISOString(),
      taskId: task.id,
      taskCapability: task.capability,
      agentId: agent.id,
      agentName: agent.name,
      strategy: this.config.loadBalancing,
      agentWorkload: this.agentWorkload.get(agent.id) || 0
    });

    // Keep log bounded
    if (this.allocationLog.length > 1000) {
      this.allocationLog.shift();
    }
  }
}

module.exports = TaskAllocator;
