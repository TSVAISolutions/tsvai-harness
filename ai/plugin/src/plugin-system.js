/**
 * TSVAI Plugin System
 * Unified interface for plugin/skill management
 *
 * Usage:
 *   const system = new PluginSystem();
 *   await system.initialize();
 *   const tools = system.getMcpTools();
 *   await system.executeTool('analytics_analyze', { operation: 'text', params: {...} });
 */

const PluginLoader = require('./plugin-loader');
const McpServer = require('./mcp-server');
const PluginRegistry = require('./registry');

class PluginSystem {
  constructor(config = {}) {
    this.config = {
      skillsDir: config.skillsDir,
      debug: config.debug || false,
      ...config
    };

    this.loader = new PluginLoader(this.config.skillsDir);
    this.mcp = new McpServer(this.config);
    this.registry = new PluginRegistry(this.loader);
    this.initialized = false;
  }

  /**
   * Initialize the plugin system
   * 1. Discover skills
   * 2. Load plugins
   * 3. Initialize MCP server
   * 4. Build registry
   */
  async initialize() {
    console.log('[PluginSystem] Initializing...');

    try {
      // Initialize MCP server (which handles discovery and loading)
      const mcpResult = await this.mcp.initialize();

      // Build registry indexes
      await this.registry.build();

      this.initialized = true;

      console.log('[PluginSystem] Initialization complete');
      return {
        success: true,
        systemStatus: this.getStatus()
      };
    } catch (error) {
      console.error(`[PluginSystem] Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all MCP tools (for Claude integration)
   */
  getMcpTools() {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.mcp.getTools();
  }

  /**
   * Execute a tool via MCP
   */
  async executeTool(toolName, toolInput) {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.mcp.executeTool(toolName, toolInput);
  }

  /**
   * Get skill registry (discovery)
   */
  getSkillRegistry() {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.listAll();
  }

  /**
   * Find skills by query
   */
  searchSkills(query) {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.search(query);
  }

  /**
   * Find skills by category
   */
  getSkillsByCategory(category) {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.findByCategory(category);
  }

  /**
   * Find skills by capability
   */
  getSkillsByCapability(capability) {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.findByCapability(capability);
  }

  /**
   * Get detailed skill information
   */
  getSkillInfo(skillId) {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.getSkillInfo(skillId);
  }

  /**
   * Get registry summary
   */
  getRegistrySummary() {
    if (!this.initialized) {
      throw new Error('PluginSystem not initialized');
    }
    return this.registry.summary();
  }

  /**
   * Check if system is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      mcp: this.mcp.getStatus(),
      registry: this.initialized ? this.registry.summary() : null
    };
  }

  /**
   * Shutdown the system
   */
  async shutdown() {
    console.log('[PluginSystem] Shutting down...');
    await this.mcp.shutdown();
    this.initialized = false;
    console.log('[PluginSystem] Shutdown complete');
  }

  /**
   * Get direct access to components (for advanced use)
   */
  getComponents() {
    return {
      loader: this.loader,
      mcp: this.mcp,
      registry: this.registry
    };
  }

  /**
   * Export as JSON (for debugging/inspection)
   */
  toJSON() {
    return {
      config: this.config,
      initialized: this.initialized,
      status: this.getStatus(),
      registry: this.initialized ? this.registry.toJSON() : null
    };
  }
}

module.exports = PluginSystem;
