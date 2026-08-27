/**
 * MCP Server Integration
 * Exposes skills as MCP tools that Claude can invoke
 */

const PluginLoader = require('./plugin-loader');

class McpServer {
  constructor(config = {}) {
    this.config = config;
    this.loader = new PluginLoader(config.skillsDir);
    this.tools = new Map();
    this.initialized = false;
  }

  /**
   * Initialize MCP server
   * 1. Discover all skills
   * 2. Load skill modules
   * 3. Register as MCP tools
   */
  async initialize() {
    console.log('[McpServer] Initializing...');

    try {
      // Step 1: Discover skills
      console.log('[McpServer] Step 1: Discovering skills...');
      await this.loader.discoverSkills();

      // Step 2: Load all skills
      console.log('[McpServer] Step 2: Loading skills...');
      const { loaded, failed } = await this.loader.loadAllSkills();
      console.log(`[McpServer] Loaded: ${loaded.length}, Failed: ${failed.length}`);

      // Step 3: Register MCP tools
      console.log('[McpServer] Step 3: Registering MCP tools...');
      const mcpTools = this.loader.getMcpTools();
      for (const tool of mcpTools) {
        this.tools.set(tool.name, tool);
      }

      // Step 4: Initialize all skills
      console.log('[McpServer] Step 4: Initializing skills...');
      await this.loader.initializeAll();

      this.initialized = true;
      console.log(`[McpServer] Initialization complete: ${this.tools.size} tools registered`);

      return {
        success: true,
        toolCount: this.tools.size,
        skillRegistry: this.loader.getRegistry()
      };
    } catch (error) {
      console.error(`[McpServer] Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all registered MCP tools
   */
  getTools() {
    const toolsList = [];
    for (const [name, tool] of this.tools) {
      toolsList.push(tool);
    }
    return toolsList;
  }

  /**
   * Execute an MCP tool call
   * Tool name format: {category}_{skillName}
   * Input: { operation, params }
   */
  async executeTool(toolName, toolInput) {
    console.log(`[McpServer] Executing tool: ${toolName}`);

    try {
      // Validate input
      if (!toolInput || typeof toolInput !== 'object') {
        return {
          success: false,
          error: 'Invalid tool input'
        };
      }

      const { operation, params } = toolInput;

      if (!operation) {
        return {
          success: false,
          error: 'Missing operation parameter'
        };
      }

      // Convert tool name back to skill ID
      // {category}_{skillName} -> {category}:{skillName}
      const skillId = toolName.replace('_', ':');

      // Execute via loader
      const result = await this.loader.executeSkill(skillId, operation, params || {});

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error(`[McpServer] Tool execution failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get skill registry (available skills organized by category)
   */
  getSkillRegistry() {
    return this.loader.getRegistry();
  }

  /**
   * Get skill metadata
   */
  getSkillMetadata(skillId) {
    return this.loader.getSkill(skillId);
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category) {
    return this.loader.getSkillsByCategory(category);
  }

  /**
   * Shutdown MCP server
   */
  async shutdown() {
    console.log('[McpServer] Shutting down...');
    await this.loader.shutdownAll();
    this.initialized = false;
    console.log('[McpServer] Shutdown complete');
  }

  /**
   * Check if server is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      toolCount: this.tools.size,
      skillCount: this.loader.registry.size,
      skills: this.getSkillRegistry()
    };
  }
}

module.exports = McpServer;
