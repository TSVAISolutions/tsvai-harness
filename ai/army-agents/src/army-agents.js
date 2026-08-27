/**
 * Army-Agents System
 * Unified multi-agent coordination framework
 */

const AgentRegistry = require('./agent-registry');
const AgentCommProtocol = require('./agent-comm-protocol');

class ArmyAgents {
  constructor(config = {}) {
    this.config = config;
    this.registry = new AgentRegistry(config);
    this.protocol = new AgentCommProtocol(config);
    this.transports = new Map(); // agentId -> transport
    this.initialized = false;
  }

  /**
   * Initialize Army-Agents system
   */
  async initialize() {
    console.log('[ArmyAgents] Initializing...');

    // Register default message handlers
    this._registerDefaultHandlers();

    this.initialized = true;
    console.log('[ArmyAgents] Initialized');

    return { success: true };
  }

  /**
   * Register an agent with the system
   */
  registerAgent(agentId, agentInfo, transport = null) {
    if (!this.initialized) {
      throw new Error('System not initialized');
    }

    // Register in registry
    const result = this.registry.registerAgent(agentId, agentInfo);

    // Store transport if provided
    if (transport) {
      this.transports.set(agentId, transport);
    }

    return result;
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId) {
    this.registry.unregisterAgent(agentId);
    this.transports.delete(agentId);

    return { success: true };
  }

  /**
   * Send RPC call to agent
   */
  async callAgent(agentId, method, params = {}) {
    const agent = this.registry.getAgent(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (!agent.healthy) {
      throw new Error(`Agent unhealthy: ${agentId}`);
    }

    const transport = this.transports.get(agentId);
    if (!transport) {
      throw new Error(`No transport for agent: ${agentId}`);
    }

    const message = this.protocol.createMessage(`agent:${method}`, params, {
      from: 'system',
      to: agentId
    });

    try {
      return await this.protocol.sendRPC(message, transport);
    } catch (error) {
      // Mark agent as unhealthy on timeout
      if (error.message.includes('timeout')) {
        this.registry.updateStatus(agentId, 'unhealthy');
      }
      throw error;
    }
  }

  /**
   * Send message to agent (async, no response)
   */
  async sendToAgent(agentId, data) {
    const agent = this.registry.getAgent(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const transport = this.transports.get(agentId);
    if (!transport) {
      throw new Error(`No transport for agent: ${agentId}`);
    }

    const message = this.protocol.createMessage('agent:message', data, {
      from: 'system',
      to: agentId
    });

    return this.protocol.sendMessage(message, transport);
  }

  /**
   * Find agents with capability
   */
  findAgentsByCapability(capability, healthyOnly = true) {
    const agents = this.registry.findByCapability(capability);

    if (healthyOnly) {
      return agents.filter(a => a.healthy);
    }

    return agents;
  }

  /**
   * Find agents with status
   */
  findAgentsByStatus(status) {
    return this.registry.findByStatus(status);
  }

  /**
   * List all agents
   */
  listAgents(filter = {}) {
    return this.registry.listAgents(filter);
  }

  /**
   * Get system statistics
   */
  getStatistics() {
    return {
      registry: this.registry.getStatistics(),
      protocol: this.protocol.getStatistics(),
      transports: this.transports.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check health of all agents
   */
  checkHealth(heartbeatTimeout = 30000) {
    return this.registry.checkHealth(heartbeatTimeout);
  }

  /**
   * Prune unhealthy agents
   */
  pruneUnhealthy(heartbeatTimeout = 30000) {
    return this.registry.pruneUnhealthy(heartbeatTimeout);
  }

  /**
   * Broadcast message to multiple agents
   */
  async broadcastToCapability(capability, data) {
    const agents = this.findAgentsByCapability(capability, true);

    const results = await Promise.allSettled(
      agents.map(agent => this.sendToAgent(agent.id, data))
    );

    return {
      totalAgents: agents.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  /**
   * Execute method on first available agent with capability
   */
  async executeOnCapability(capability, method, params = {}) {
    const agents = this.findAgentsByCapability(capability, true);

    if (agents.length === 0) {
      throw new Error(`No agents available with capability: ${capability}`);
    }

    // Try each agent until one succeeds
    for (const agent of agents) {
      try {
        return await this.callAgent(agent.id, method, params);
      } catch (error) {
        console.warn(`[ArmyAgents] Failed on ${agent.id}: ${error.message}`);
        continue;
      }
    }

    throw new Error(`No agents succeeded for capability: ${capability}`);
  }

  /**
   * Register message handler
   */
  registerHandler(type, handler) {
    this.protocol.registerHandler(type, handler);
  }

  /**
   * Handle incoming message from agent
   */
  async handleAgentMessage(message) {
    return this.protocol.handleMessage(message);
  }

  /**
   * Shutdown system
   */
  async shutdown() {
    console.log('[ArmyAgents] Shutting down...');

    // Notify all agents
    const agents = this.listAgents();
    for (const agent of agents) {
      try {
        await this.sendToAgent(agent.id, { type: 'shutdown' });
      } catch (error) {
        console.error(`[ArmyAgents] Error shutting down agent ${agent.id}`);
      }
    }

    // Clear transports
    this.transports.clear();

    this.initialized = false;
    console.log('[ArmyAgents] Shutdown complete');

    return { success: true };
  }

  // ============ Private Methods ============

  _registerDefaultHandlers() {
    // Heartbeat handler
    this.registerHandler('system:heartbeat', async (msg) => {
      const { from } = msg;
      if (from) {
        this.registry.recordHeartbeat(from, msg.payload);
      }
      return { success: true, timestamp: new Date().toISOString() };
    });

    // Status update handler
    this.registerHandler('system:status', async (msg) => {
      const { from, payload } = msg;
      if (from && payload.status) {
        this.registry.updateStatus(from, payload.status);
      }
      return { success: true };
    });

    // Ping handler
    this.registerHandler('system:ping', async (msg) => {
      return { pong: true, timestamp: new Date().toISOString() };
    });

    // Info handler
    this.registerHandler('system:info', async (msg) => {
      const { from } = msg;
      if (from) {
        const agent = this.registry.getAgent(from);
        if (agent) {
          return agent;
        }
      }
      return { error: 'Agent not found' };
    });
  }

  /**
   * Export as JSON
   */
  toJSON() {
    return {
      initialized: this.initialized,
      timestamp: new Date().toISOString(),
      registry: this.registry.toJSON(),
      protocol: this.protocol.getStatistics()
    };
  }
}

module.exports = ArmyAgents;
