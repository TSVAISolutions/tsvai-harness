/**
 * Agent Registry
 * Central registry for discovering and managing available agents
 */

class AgentRegistry {
  constructor(config = {}) {
    this.config = config;
    this.agents = new Map(); // agentId -> agent info
    this.byName = new Map(); // agentName -> agentId
    this.byCapability = new Map(); // capability -> [agentIds]
    this.byStatus = new Map(); // status -> [agentIds]
    this.heartbeats = new Map(); // agentId -> lastHeartbeat
  }

  /**
   * Register an agent in the registry
   */
  registerAgent(agentId, agentInfo) {
    if (this.agents.has(agentId)) {
      throw new Error(`Agent already registered: ${agentId}`);
    }

    const normalized = this._normalizeAgent(agentId, agentInfo);

    // Store agent info
    this.agents.set(agentId, normalized);

    // Index by name
    if (normalized.name) {
      this.byName.set(normalized.name, agentId);
    }

    // Index by capabilities
    (normalized.capabilities || []).forEach(cap => {
      if (!this.byCapability.has(cap)) {
        this.byCapability.set(cap, []);
      }
      this.byCapability.get(cap).push(agentId);
    });

    // Index by status
    const status = normalized.status || 'idle';
    if (!this.byStatus.has(status)) {
      this.byStatus.set(status, []);
    }
    this.byStatus.get(status).push(agentId);

    // Initialize heartbeat
    this.heartbeats.set(agentId, Date.now());

    console.log(`[AgentRegistry] Registered agent: ${agentId}`);

    return {
      success: true,
      agentId,
      registered: new Date().toISOString()
    };
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId) {
    if (!this.agents.has(agentId)) {
      return { success: false, error: 'Agent not found' };
    }

    const agent = this.agents.get(agentId);

    // Remove from all indexes
    this.agents.delete(agentId);
    this.byName.delete(agent.name);
    this.heartbeats.delete(agentId);

    // Remove from capability index
    (agent.capabilities || []).forEach(cap => {
      const agents = this.byCapability.get(cap);
      if (agents) {
        const idx = agents.indexOf(agentId);
        if (idx !== -1) agents.splice(idx, 1);
      }
    });

    // Remove from status index
    const status = agent.status || 'idle';
    const statusAgents = this.byStatus.get(status);
    if (statusAgents) {
      const idx = statusAgents.indexOf(agentId);
      if (idx !== -1) statusAgents.splice(idx, 1);
    }

    console.log(`[AgentRegistry] Unregistered agent: ${agentId}`);

    return {
      success: true,
      agentId,
      unregistered: new Date().toISOString()
    };
  }

  /**
   * Update agent status
   */
  updateStatus(agentId, newStatus) {
    if (!this.agents.has(agentId)) {
      return { success: false, error: 'Agent not found' };
    }

    const agent = this.agents.get(agentId);
    const oldStatus = agent.status;

    // Update status
    agent.status = newStatus;
    agent.lastUpdated = new Date().toISOString();

    // Update status index
    if (oldStatus && this.byStatus.has(oldStatus)) {
      const agents = this.byStatus.get(oldStatus);
      const idx = agents.indexOf(agentId);
      if (idx !== -1) agents.splice(idx, 1);
    }

    if (!this.byStatus.has(newStatus)) {
      this.byStatus.set(newStatus, []);
    }
    this.byStatus.get(newStatus).push(agentId);

    // Update heartbeat
    this.heartbeats.set(agentId, Date.now());

    return {
      success: true,
      agentId,
      oldStatus,
      newStatus,
      timestamp: agent.lastUpdated
    };
  }

  /**
   * Record heartbeat from agent
   */
  recordHeartbeat(agentId, metadata = {}) {
    if (!this.agents.has(agentId)) {
      return { success: false, error: 'Agent not found' };
    }

    const now = Date.now();
    this.heartbeats.set(agentId, now);

    const agent = this.agents.get(agentId);
    agent.lastHeartbeat = new Date(now).toISOString();
    agent.metadata = { ...agent.metadata, ...metadata };

    return {
      success: true,
      agentId,
      heartbeat: agent.lastHeartbeat
    };
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    return {
      ...agent,
      healthy: this._isHealthy(agentId)
    };
  }

  /**
   * Get agent by name
   */
  getAgentByName(name) {
    const agentId = this.byName.get(name);
    if (!agentId) return null;
    return this.getAgent(agentId);
  }

  /**
   * Find agents with specific capability
   */
  findByCapability(capability) {
    const agentIds = this.byCapability.get(capability) || [];
    return agentIds
      .map(id => this.getAgent(id))
      .filter(a => a && a.healthy);
  }

  /**
   * Find agents with specific status
   */
  findByStatus(status) {
    const agentIds = this.byStatus.get(status) || [];
    return agentIds.map(id => this.getAgent(id)).filter(a => a);
  }

  /**
   * List all agents
   */
  listAgents(filter = {}) {
    let agents = Array.from(this.agents.values()).map(agent => {
      const agentId = Array.from(this.agents.entries()).find(([, a]) => a === agent)?.[0];
      return { ...agent, id: agentId, healthy: this._isHealthy(agentId) };
    });

    // Apply filters
    if (filter.status) {
      agents = agents.filter(a => a.status === filter.status);
    }

    if (filter.capability) {
      agents = agents.filter(a =>
        (a.capabilities || []).includes(filter.capability)
      );
    }

    if (filter.healthyOnly) {
      agents = agents.filter(a => a.healthy);
    }

    return agents;
  }

  /**
   * Get agent count statistics
   */
  getStatistics() {
    const agents = Array.from(this.agents.values());

    const byStatus = {};
    this.byStatus.forEach((ids, status) => {
      byStatus[status] = ids.length;
    });

    const capabilities = Array.from(this.byCapability.keys());
    const capabilityCount = {};
    capabilities.forEach(cap => {
      capabilityCount[cap] = this.byCapability.get(cap).length;
    });

    const healthy = agents.filter((_, i) => {
      const id = Array.from(this.agents.keys())[i];
      return this._isHealthy(id);
    }).length;

    return {
      totalAgents: agents.length,
      healthyAgents: healthy,
      unhealthyAgents: agents.length - healthy,
      byStatus,
      capabilities: capabilities.length,
      capabilityDistribution: capabilityCount
    };
  }

  /**
   * Check health of all agents
   */
  checkHealth(heartbeatTimeout = 30000) {
    const now = Date.now();
    const unhealthy = [];

    this.heartbeats.forEach((lastHeartbeat, agentId) => {
      if (now - lastHeartbeat > heartbeatTimeout) {
        unhealthy.push(agentId);
      }
    });

    return {
      healthy: this.agents.size - unhealthy.length,
      unhealthy: unhealthy.length,
      unhealthyAgents: unhealthy,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Remove unhealthy agents
   */
  pruneUnhealthy(heartbeatTimeout = 30000) {
    const health = this.checkHealth(heartbeatTimeout);

    health.unhealthyAgents.forEach(agentId => {
      this.unregisterAgent(agentId);
    });

    return {
      pruned: health.unhealthyAgents.length,
      remaining: this.agents.size
    };
  }

  /**
   * Export registry as JSON
   */
  toJSON() {
    const agents = {};
    this.agents.forEach((agent, id) => {
      agents[id] = {
        ...agent,
        healthy: this._isHealthy(id)
      };
    });

    return {
      timestamp: new Date().toISOString(),
      totalAgents: this.agents.size,
      agents,
      statistics: this.getStatistics()
    };
  }

  // ============ Private Methods ============

  _normalizeAgent(agentId, info) {
    return {
      id: agentId,
      name: info.name || agentId,
      type: info.type || 'generic',
      version: info.version || '1.0.0',
      capabilities: info.capabilities || [],
      endpoint: info.endpoint,
      status: info.status || 'idle',
      metadata: info.metadata || {},
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString()
    };
  }

  _isHealthy(agentId, timeout = 30000) {
    const lastHb = this.heartbeats.get(agentId);
    if (!lastHb) return false;
    return Date.now() - lastHb < timeout;
  }
}

module.exports = AgentRegistry;
