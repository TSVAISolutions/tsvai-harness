/**
 * Plugin Lifecycle Hooks
 * Handle plugin initialization, execution, and shutdown events
 */

class PluginHooks {
  constructor() {
    this.hooks = {
      'preInitialize': [],
      'postInitialize': [],
      'preExecute': [],
      'postExecute': [],
      'preShutdown': [],
      'postShutdown': [],
      'onError': [],
      'onValidation': []
    };
  }

  /**
   * Register a hook callback
   * @param {string} event - Hook event name
   * @param {function} callback - Hook callback function
   */
  on(event, callback) {
    if (!this.hooks[event]) {
      throw new Error(`Unknown hook: ${event}`);
    }

    if (typeof callback !== 'function') {
      throw new Error('Hook callback must be a function');
    }

    this.hooks[event].push(callback);
  }

  /**
   * Unregister a hook callback
   * @param {string} event - Hook event name
   * @param {function} callback - Hook callback to remove
   */
  off(event, callback) {
    if (!this.hooks[event]) return;

    const index = this.hooks[event].indexOf(callback);
    if (index > -1) {
      this.hooks[event].splice(index, 1);
    }
  }

  /**
   * Emit a hook event
   * @param {string} event - Hook event name
   * @param {object} data - Event data
   */
  async emit(event, data = {}) {
    if (!this.hooks[event]) {
      throw new Error(`Unknown hook: ${event}`);
    }

    for (const callback of this.hooks[event]) {
      try {
        await callback(data);
      } catch (error) {
        console.error(`Error in hook ${event}:`, error.message);
        throw error;
      }
    }
  }

  /**
   * Clear all hooks for an event
   * @param {string} event - Hook event name
   */
  clear(event) {
    if (event) {
      this.hooks[event] = [];
    } else {
      Object.keys(this.hooks).forEach(key => {
        this.hooks[key] = [];
      });
    }
  }
}

// Export singleton instance
module.exports = new PluginHooks();

/**
 * Hook Usage Examples
 */

/*
// Pre-initialize hook - perform setup before plugin initialization
hooks.on('preInitialize', async (data) => {
  console.log('Setting up plugin environment...');
  process.env.PLUGIN_INITIALIZED = 'true';
});

// Post-initialize hook - verify initialization
hooks.on('postInitialize', async (data) => {
  console.log('Plugin initialized:', data.pluginName);
});

// Pre-execute hook - validate before execution
hooks.on('preExecute', async (data) => {
  const { command, params } = data;
  console.log(`Executing command: ${command}`);
  console.log('Parameters:', params);
});

// Post-execute hook - process results
hooks.on('postExecute', async (data) => {
  const { command, result } = data;
  console.log(`Command ${command} completed`);
  console.log('Result:', result);
});

// Error hook - handle errors
hooks.on('onError', async (data) => {
  const { error, context } = data;
  console.error(`Error in ${context}:`, error.message);
  // Log to monitoring/alerting system
});

// Validation hook - validate inputs
hooks.on('onValidation', async (data) => {
  const { params } = data;
  if (!params || Object.keys(params).length === 0) {
    throw new Error('Parameters cannot be empty');
  }
});

// Shutdown hook - cleanup
hooks.on('preShutdown', async (data) => {
  console.log('Cleaning up resources...');
});
*/
