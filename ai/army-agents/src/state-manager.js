/**
 * State Manager
 * Manages shared state across agents in workflows
 * Provides snapshots, versioning, and change tracking
 */

class StateManager {
  constructor(config = {}) {
    this.config = config;
    this.state = new Map(); // namespace -> state object
    this.history = []; // versioned state snapshots
    this.watchers = new Map(); // path -> callback functions
    this.locks = new Map(); // path -> lock holder
    this.version = 0;
  }

  /**
   * Get state value
   */
  get(path) {
    const [namespace, ...keys] = path.split('.');
    let value = this.state.get(namespace);

    if (!value) return undefined;

    for (const key of keys) {
      value = value[key];
      if (value === undefined) return undefined;
    }

    return value;
  }

  /**
   * Set state value with change tracking
   */
  set(path, value) {
    const [namespace, ...keys] = path.split('.');

    // Initialize namespace if needed
    if (!this.state.has(namespace)) {
      this.state.set(namespace, {});
    }

    const state = this.state.get(namespace);
    const oldValue = this._getNestedValue(state, keys);

    // Set new value
    if (keys.length === 0) {
      this.state.set(namespace, value);
    } else {
      this._setNestedValue(state, keys, value);
    }

    // Track change
    this._recordChange(path, oldValue, value);

    // Notify watchers
    this._notifyWatchers(path, value, oldValue);

    return { success: true, path, value };
  }

  /**
   * Batch update multiple state values
   */
  batchSet(updates) {
    const changes = [];

    for (const [path, value] of Object.entries(updates)) {
      const [namespace, ...keys] = path.split('.');

      if (!this.state.has(namespace)) {
        this.state.set(namespace, {});
      }

      const state = this.state.get(namespace);
      const oldValue = this._getNestedValue(state, keys);

      if (keys.length === 0) {
        this.state.set(namespace, value);
      } else {
        this._setNestedValue(state, keys, value);
      }

      changes.push({ path, oldValue, newValue: value });
      this._notifyWatchers(path, value, oldValue);
    }

    this._recordBatchChange(changes);

    return { success: true, changes: changes.length };
  }

  /**
   * Get entire state snapshot
   */
  getSnapshot() {
    const snapshot = {};

    for (const [namespace, value] of this.state.entries()) {
      snapshot[namespace] = JSON.parse(JSON.stringify(value));
    }

    return {
      version: this.version,
      timestamp: new Date().toISOString(),
      data: snapshot
    };
  }

  /**
   * Lock state path for exclusive access
   */
  lock(path, holderId, ttl = 30000) {
    if (this.locks.has(path) && this.locks.get(path).holderId !== holderId) {
      return {
        success: false,
        error: `Path already locked by ${this.locks.get(path).holderId}`
      };
    }

    this.locks.set(path, {
      holderId,
      acquiredAt: Date.now(),
      ttl
    });

    // Auto-release after TTL
    setTimeout(() => {
      if (this.locks.get(path)?.holderId === holderId) {
        this.locks.delete(path);
      }
    }, ttl);

    return { success: true, path, holderId };
  }

  /**
   * Unlock state path
   */
  unlock(path, holderId) {
    const lock = this.locks.get(path);

    if (!lock || lock.holderId !== holderId) {
      return {
        success: false,
        error: 'Lock not held by this holder'
      };
    }

    this.locks.delete(path);

    return { success: true, path };
  }

  /**
   * Watch for state changes
   */
  watch(path, callback) {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }

    this.watchers.get(path).push(callback);

    return {
      success: true,
      watchId: `watch-${path}-${this.watchers.get(path).length}`,
      watching: path
    };
  }

  /**
   * Unwatch state path
   */
  unwatch(path, callback) {
    if (!this.watchers.has(path)) return { success: false };

    const callbacks = this.watchers.get(path);
    const idx = callbacks.indexOf(callback);

    if (idx === -1) return { success: false };

    callbacks.splice(idx, 1);

    if (callbacks.length === 0) {
      this.watchers.delete(path);
    }

    return { success: true };
  }

  /**
   * Get state history
   */
  getHistory(limit = 50) {
    return this.history.slice(-limit).map(entry => ({
      version: entry.version,
      timestamp: entry.timestamp,
      changes: entry.changes
    }));
  }

  /**
   * Restore state to previous version
   */
  restoreVersion(version) {
    const snapshot = this.history.find(h => h.version === version);

    if (!snapshot) {
      return { success: false, error: `Version not found: ${version}` };
    }

    // Clear current state
    this.state.clear();

    // Restore from snapshot
    for (const [namespace, value] of Object.entries(snapshot.data)) {
      this.state.set(namespace, JSON.parse(JSON.stringify(value)));
    }

    return { success: true, version };
  }

  /**
   * Merge external state
   */
  merge(externalState, strategy = 'merge') {
    const changes = [];

    for (const [namespace, value] of Object.entries(externalState)) {
      const existing = this.state.get(namespace) || {};

      let merged;
      if (strategy === 'merge') {
        merged = { ...existing, ...value };
      } else if (strategy === 'replace') {
        merged = value;
      } else if (strategy === 'deep-merge') {
        merged = this._deepMerge(existing, value);
      }

      this.state.set(namespace, merged);
      changes.push({ namespace, strategy });
    }

    this._recordMerge(changes);

    return { success: true, mergedNamespaces: changes.length };
  }

  /**
   * Validate state against schema
   */
  validate(schema) {
    const errors = [];

    for (const [namespace, spec] of Object.entries(schema)) {
      const value = this.state.get(namespace);

      if (spec.required && value === undefined) {
        errors.push(`Missing required namespace: ${namespace}`);
        continue;
      }

      if (value && spec.type && typeof value !== spec.type) {
        errors.push(
          `Invalid type for ${namespace}: expected ${spec.type}, got ${typeof value}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear all state
   */
  clear() {
    this.state.clear();
    this.watchers.clear();
    this.locks.clear();
    this._recordChange('*', null, null, 'clear');

    return { success: true };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const namespaces = Array.from(this.state.keys());
    const totalEntries = Array.from(this.state.values()).reduce(
      (sum, obj) => sum + Object.keys(obj).length,
      0
    );

    return {
      totalNamespaces: namespaces.length,
      totalEntries,
      version: this.version,
      historySize: this.history.length,
      activeLocks: this.locks.size,
      activeWatchers: this.watchers.size,
      namespaces,
      timestamp: new Date().toISOString()
    };
  }

  // ============ Private Methods ============

  _getNestedValue(obj, keys) {
    let value = obj;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  _setNestedValue(obj, keys, value) {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  _recordChange(path, oldValue, newValue, operation = 'set') {
    this.version++;

    this.history.push({
      version: this.version,
      timestamp: new Date().toISOString(),
      operation,
      changes: [{ path, oldValue, newValue }]
    });

    // Keep history bounded
    if (this.history.length > 1000) {
      this.history.shift();
    }
  }

  _recordBatchChange(changes) {
    this.version++;

    this.history.push({
      version: this.version,
      timestamp: new Date().toISOString(),
      operation: 'batch',
      changes
    });

    // Keep history bounded
    if (this.history.length > 1000) {
      this.history.shift();
    }
  }

  _recordMerge(changes) {
    this.version++;

    this.history.push({
      version: this.version,
      timestamp: new Date().toISOString(),
      operation: 'merge',
      changes
    });

    // Keep history bounded
    if (this.history.length > 1000) {
      this.history.shift();
    }
  }

  _notifyWatchers(path, newValue, oldValue) {
    const callbacks = this.watchers.get(path) || [];

    callbacks.forEach(callback => {
      try {
        callback({ path, newValue, oldValue, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error(`Error in watcher for ${path}:`, error);
      }
    });
  }

  _deepMerge(target, source) {
    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && typeof result[key] === 'object') {
        result[key] = this._deepMerge(result[key], value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

module.exports = StateManager;
