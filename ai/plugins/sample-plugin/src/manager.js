/**
 * Plugin Manager Module
 * Manages plugin lifecycle and execution
 */

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.logger = console;
  }

  register(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin '${name}' is already registered`);
    }
    this.plugins.set(name, plugin);
    this.logger.log(`Plugin '${name}' registered successfully`);
  }

  unregister(name) {
    if (!this.plugins.has(name)) {
      return false;
    }
    this.plugins.delete(name);
    this.logger.log(`Plugin '${name}' unregistered`);
    return true;
  }

  async execute(name, command, params = {}) {
    if (!this.plugins.has(name)) {
      return {
        success: false,
        error: `Plugin '${name}' not found`
      };
    }

    const plugin = this.plugins.get(name);

    try {
      // Validate params
      const validation = await plugin.validate(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Execute plugin
      const result = await plugin.execute(command, params);
      return result;
    } catch (error) {
      this.logger.error(`Error executing plugin '${name}': ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    const plugins = [];
    this.plugins.forEach((plugin, name) => {
      plugins.push({
        name,
        metadata: plugin.getMetadata()
      });
    });
    return plugins;
  }

  on(event, callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.hooks.has(event)) return;
    const hooks = this.hooks.get(event);
    const index = hooks.indexOf(callback);
    if (index > -1) {
      hooks.splice(index, 1);
    }
  }

  async emit(event, data) {
    if (!this.hooks.has(event)) return;
    const hooks = this.hooks.get(event);
    for (const callback of hooks) {
      await callback(data);
    }
  }

  async initializeAll() {
    for (const [name, plugin] of this.plugins) {
      try {
        await plugin.initialize();
        this.logger.log(`Plugin '${name}' initialized`);
      } catch (error) {
        this.logger.error(`Failed to initialize plugin '${name}': ${error.message}`);
      }
    }
  }

  async shutdownAll() {
    for (const [name, plugin] of this.plugins) {
      try {
        await plugin.shutdown();
        this.logger.log(`Plugin '${name}' shutdown complete`);
      } catch (error) {
        this.logger.error(`Error shutting down plugin '${name}': ${error.message}`);
      }
    }
  }
}

module.exports = PluginManager;
