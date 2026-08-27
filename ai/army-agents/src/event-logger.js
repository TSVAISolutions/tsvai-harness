/**
 * Event Logger
 * Centralized logging for all Army-Agents operations
 * Supports multiple log levels, formatting, and persistence
 */

class EventLogger {
  constructor(config = {}) {
    this.config = {
      level: config.level || 'info',
      format: config.format || 'json',
      maxEntries: config.maxEntries || 10000,
      persistence: config.persistence || null,
      ...config
    };

    this.events = [];
    this.eventCounter = 0;
    this.levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    this.handlers = []; // Custom event handlers
    this.startTime = Date.now();
  }

  /**
   * Log an event
   */
  log(level, source, message, data = {}) {
    if (!this._shouldLog(level)) {
      return;
    }

    const event = {
      id: this._generateEventId(),
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data,
      duration: Date.now() - this.startTime
    };

    this.events.push(event);

    // Keep bounded
    if (this.events.length > this.config.maxEntries) {
      this.events.shift();
    }

    // Notify handlers
    this._notifyHandlers(event);

    // Persist if configured
    if (this.config.persistence) {
      this._persist(event);
    }

    return event;
  }

  /**
   * Convenience logging methods
   */
  debug(source, message, data) {
    return this.log('debug', source, message, data);
  }

  info(source, message, data) {
    return this.log('info', source, message, data);
  }

  warn(source, message, data) {
    return this.log('warn', source, message, data);
  }

  error(source, message, data) {
    return this.log('error', source, message, data);
  }

  fatal(source, message, data) {
    return this.log('fatal', source, message, data);
  }

  /**
   * Log a workflow event
   */
  logWorkflowEvent(executionId, eventType, details = {}) {
    return this.info('workflow', `Execution ${eventType}`, {
      executionId,
      eventType,
      ...details
    });
  }

  /**
   * Log an agent event
   */
  logAgentEvent(agentId, eventType, details = {}) {
    return this.info('agent', `Agent ${eventType}`, {
      agentId,
      eventType,
      ...details
    });
  }

  /**
   * Log a task event
   */
  logTaskEvent(taskId, eventType, details = {}) {
    return this.info('task', `Task ${eventType}`, {
      taskId,
      eventType,
      ...details
    });
  }

  /**
   * Log a consensus event
   */
  logConsensusEvent(proposalId, eventType, details = {}) {
    return this.info('consensus', `Proposal ${eventType}`, {
      proposalId,
      eventType,
      ...details
    });
  }

  /**
   * Register event handler
   */
  on(handler) {
    this.handlers.push(handler);

    return {
      success: true,
      handlerId: `handler-${this.handlers.length}`,
      totalHandlers: this.handlers.length
    };
  }

  /**
   * Remove event handler
   */
  off(handler) {
    const idx = this.handlers.indexOf(handler);

    if (idx === -1) return { success: false };

    this.handlers.splice(idx, 1);

    return { success: true, totalHandlers: this.handlers.length };
  }

  /**
   * Get events with filtering
   */
  getEvents(filters = {}, limit = 100) {
    let filtered = [...this.events];

    if (filters.level) {
      filtered = filtered.filter(e => e.level === filters.level);
    }

    if (filters.source) {
      filtered = filtered.filter(e => e.source === filters.source);
    }

    if (filters.minLevel) {
      const minIdx = this.levels.indexOf(filters.minLevel);
      filtered = filtered.filter(e => this.levels.indexOf(e.level) >= minIdx);
    }

    if (filters.startTime) {
      const start = new Date(filters.startTime);
      filtered = filtered.filter(e => new Date(e.timestamp) >= start);
    }

    if (filters.endTime) {
      const end = new Date(filters.endTime);
      filtered = filtered.filter(e => new Date(e.timestamp) <= end);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.message.toLowerCase().includes(query) ||
        JSON.stringify(e.data).toLowerCase().includes(query)
      );
    }

    return filtered.slice(-limit);
  }

  /**
   * Get logs by source
   */
  getLogsBySource(source, limit = 100) {
    return this.getEvents({ source }, limit);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level, limit = 100) {
    return this.getEvents({ level }, limit);
  }

  /**
   * Get error logs
   */
  getErrors(limit = 100) {
    return this.getEvents({ minLevel: 'error' }, limit);
  }

  /**
   * Get recent errors for troubleshooting
   */
  getRecentErrors(minutes = 10, limit = 100) {
    const startTime = new Date(Date.now() - minutes * 60 * 1000);

    return this.getEvents({
      minLevel: 'error',
      startTime: startTime.toISOString()
    }, limit);
  }

  /**
   * Search events
   */
  search(query, limit = 100) {
    return this.getEvents({ search: query }, limit);
  }

  /**
   * Get log statistics
   */
  getStatistics() {
    const byLevel = {};
    const bySource = {};
    let totalErrors = 0;

    this.events.forEach(event => {
      byLevel[event.level] = (byLevel[event.level] || 0) + 1;
      bySource[event.source] = (bySource[event.source] || 0) + 1;

      if (event.level === 'error' || event.level === 'fatal') {
        totalErrors++;
      }
    });

    return {
      totalEvents: this.events.length,
      byLevel,
      bySource,
      totalErrors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear logs
   */
  clear() {
    this.events = [];

    return { success: true, clearedCount: this.events.length };
  }

  /**
   * Export logs as JSON
   */
  exportJSON() {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Export logs as CSV
   */
  exportCSV() {
    if (this.events.length === 0) return 'timestamp,level,source,message\n';

    const headers = ['timestamp', 'level', 'source', 'message'];
    const rows = this.events.map(e =>
      [e.timestamp, e.level, e.source, `"${e.message}"`].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Set log level dynamically
   */
  setLevel(level) {
    if (!this.levels.includes(level)) {
      return { success: false, error: `Invalid level: ${level}` };
    }

    this.config.level = level;

    return { success: true, level };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  // ============ Private Methods ============

  _shouldLog(level) {
    const currentIdx = this.levels.indexOf(this.config.level);
    const messageIdx = this.levels.indexOf(level);

    return messageIdx >= currentIdx;
  }

  _notifyHandlers(event) {
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        // Prevent handler errors from breaking logging
        console.error('Error in log handler:', error);
      }
    });
  }

  _persist(event) {
    if (typeof this.config.persistence === 'function') {
      try {
        this.config.persistence(event);
      } catch (error) {
        console.error('Error persisting event:', error);
      }
    }
  }

  _generateEventId() {
    return `event-${Date.now()}-${++this.eventCounter}`;
  }
}

module.exports = EventLogger;
