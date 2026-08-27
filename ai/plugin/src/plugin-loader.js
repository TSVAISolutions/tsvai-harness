/**
 * Plugin Loader Module
 * Discovers, loads, and manages skill plugins from the skills/ directory
 */

const fs = require('fs');
const path = require('path');
const PluginManager = require('./manager');

class PluginLoader {
  constructor(skillsDir) {
    this.skillsDir = skillsDir || path.join(__dirname, '../skills');
    this.manager = new PluginManager();
    this.skills = new Map(); // category -> { name, metadata, module }
    this.registry = new Map(); // skill-id -> skill info
  }

  /**
   * Discover all available skills from the skills/ directory
   * Expected structure: skills/{category}/SKILL.md and optional skill module
   */
  async discoverSkills() {
    console.log(`[PluginLoader] Discovering skills in ${this.skillsDir}`);

    try {
      const categories = fs.readdirSync(this.skillsDir);

      for (const category of categories) {
        const categoryPath = path.join(this.skillsDir, category);
        const stat = fs.statSync(categoryPath);

        if (!stat.isDirectory()) continue;

        // Check for SKILL.md
        const skillMdPath = path.join(categoryPath, 'SKILL.md');
        if (!fs.existsSync(skillMdPath)) {
          console.warn(`[PluginLoader] No SKILL.md found in ${category}, skipping`);
          continue;
        }

        // Parse skill metadata
        const skillMetadata = this._parseSkillMetadata(skillMdPath, category);

        // Store skill info
        if (!this.skills.has(category)) {
          this.skills.set(category, []);
        }

        this.skills.get(category).push(skillMetadata);
        this.registry.set(`${category}:${skillMetadata.name}`, skillMetadata);

        console.log(`[PluginLoader] Discovered skill: ${category}/${skillMetadata.name}`);
      }

      console.log(`[PluginLoader] Discovery complete: ${this.registry.size} skills found`);
      return this.getRegistry();
    } catch (error) {
      console.error(`[PluginLoader] Discovery failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load a specific skill module
   */
  async loadSkill(category, skillName) {
    const skillId = `${category}:${skillName}`;
    console.log(`[PluginLoader] Loading skill: ${skillId}`);

    try {
      // Check if skill exists in registry
      if (!this.registry.has(skillId)) {
        throw new Error(`Skill not found: ${skillId}`);
      }

      const skillInfo = this.registry.get(skillId);

      // Try to load skill module (if it exists)
      const skillModulePath = path.join(this.skillsDir, category, 'index.js');
      let skillModule = null;

      if (fs.existsSync(skillModulePath)) {
        try {
          // Clear require cache for fresh load
          delete require.cache[require.resolve(skillModulePath)];
          skillModule = require(skillModulePath);
          console.log(`[PluginLoader] Loaded skill module: ${skillId}`);
        } catch (error) {
          console.error(`[PluginLoader] Failed to load skill module: ${error.message}`);
          // Continue with metadata-only skill
        }
      }

      // Create skill instance
      const skillInstance = {
        id: skillId,
        name: skillName,
        category,
        metadata: skillInfo,
        module: skillModule,
        execute: skillModule?.execute || this._createDefaultExecutor(skillInfo)
      };

      // Register with plugin manager
      this.manager.register(skillId, skillInstance);

      return skillInstance;
    } catch (error) {
      console.error(`[PluginLoader] Load failed: ${skillId} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Load all discovered skills
   */
  async loadAllSkills() {
    console.log(`[PluginLoader] Loading all ${this.registry.size} skills...`);

    const loaded = [];
    const failed = [];

    for (const [skillId, skillInfo] of this.registry) {
      const [category, name] = skillId.split(':');
      try {
        const skill = await this.loadSkill(category, name);
        loaded.push(skill);
      } catch (error) {
        console.error(`[PluginLoader] Failed to load ${skillId}`);
        failed.push({ skillId, error: error.message });
      }
    }

    console.log(`[PluginLoader] Load complete: ${loaded.length} loaded, ${failed.length} failed`);
    return { loaded, failed };
  }

  /**
   * Initialize all loaded skills
   */
  async initializeAll() {
    console.log('[PluginLoader] Initializing all skills...');
    const results = await this.manager.initializeAll();
    console.log('[PluginLoader] Initialization complete');
    return results;
  }

  /**
   * Get skill by ID
   */
  getSkill(skillId) {
    return this.registry.get(skillId);
  }

  /**
   * Get all skills for a category
   */
  getSkillsByCategory(category) {
    return this.skills.get(category) || [];
  }

  /**
   * Get complete registry
   */
  getRegistry() {
    const registry = {};

    for (const [category, skills] of this.skills) {
      registry[category] = skills.map(s => ({
        name: s.name,
        displayName: s.displayName || s.name,
        description: s.description,
        capabilities: s.capabilities || [],
        version: s.version || '1.0.0'
      }));
    }

    return registry;
  }

  /**
   * Get all registered skills as MCP tools
   */
  getMcpTools() {
    const tools = [];

    for (const [skillId, skillInfo] of this.registry) {
      tools.push({
        name: skillId.replace(':', '_'),
        description: skillInfo.description,
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: `Operation to perform (${(skillInfo.capabilities || []).join(', ')})`
            },
            params: {
              type: 'object',
              description: 'Operation parameters'
            }
          },
          required: ['operation', 'params']
        }
      });
    }

    return tools;
  }

  /**
   * Execute a skill via the manager
   */
  async executeSkill(skillId, operation, params) {
    return this.manager.execute(skillId, operation, params);
  }

  /**
   * Parse SKILL.md to extract metadata
   */
  _parseSkillMetadata(skillMdPath, category) {
    const content = fs.readFileSync(skillMdPath, 'utf8');

    // Extract title and description
    const titleMatch = content.match(/^#\s+(.+?)$/m);
    const descMatch = content.match(/^>\s+(.+?)$/m);

    // Extract capabilities section
    let capabilities = [];
    const capMatch = content.match(/##\s+Capabilities\s+([\s\S]*?)(?=##|$)/);
    if (capMatch) {
      capabilities = capMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s+/, '').replace(/:.*/,  '').trim())
        .filter(Boolean);
    }

    // Extract version
    const versionMatch = content.match(/Skill Version:\s+(\d+\.\d+\.\d+)/);

    return {
      name: category,
      displayName: titleMatch ? titleMatch[1].trim() : category,
      description: descMatch ? descMatch[1].trim() : 'No description available',
      category,
      capabilities,
      version: versionMatch ? versionMatch[1] : '1.0.0',
      path: path.dirname(skillMdPath)
    };
  }

  /**
   * Create default executor for skills without module
   */
  _createDefaultExecutor(skillInfo) {
    return async (operation, params) => {
      return {
        success: false,
        error: `Skill '${skillInfo.name}' does not have an implementation for operation '${operation}'`,
        metadata: skillInfo
      };
    };
  }

  /**
   * Shutdown all skills
   */
  async shutdownAll() {
    console.log('[PluginLoader] Shutting down all skills...');
    return this.manager.shutdownAll();
  }

  /**
   * Get plugin manager for direct access
   */
  getManager() {
    return this.manager;
  }
}

module.exports = PluginLoader;
