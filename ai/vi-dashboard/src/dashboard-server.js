/**
 * Dashboard Server
 * Core API server for dashboard data and operations
 * Provides REST endpoints and WebSocket support
 */

class DashboardServer {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3000,
      host: config.host || 'localhost',
      enableWebSocket: config.enableWebSocket !== false,
      updateInterval: config.updateInterval || 5000,
      maxConnections: config.maxConnections || 100,
      ...config
    };

    this.metrics = new Map(); // metricId -> metric data
    this.dashboards = new Map(); // dashboardId -> dashboard config
    this.widgets = new Map(); // widgetId -> widget config
    this.connections = []; // active connections
    this.eventLog = [];
    this.dashboardCounter = 0;
    this.widgetCounter = 0;
  }

  /**
   * Create a dashboard
   */
  createDashboard(name, config = {}) {
    const dashboardId = `dashboard-${++this.dashboardCounter}`;

    const dashboard = {
      id: dashboardId,
      name,
      config: {
        ...config,
        layout: config.layout || 'grid',
        refreshInterval: config.refreshInterval || 5000,
        theme: config.theme || 'light'
      },
      widgets: [],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      views: config.views || []
    };

    this.dashboards.set(dashboardId, dashboard);

    this._logEvent('dashboard_created', { dashboardId, name });

    return { success: true, dashboardId, dashboard };
  }

  /**
   * Add widget to dashboard
   */
  addWidget(dashboardId, widgetType, config = {}) {
    const dashboard = this.dashboards.get(dashboardId);

    if (!dashboard) {
      return { success: false, error: 'Dashboard not found' };
    }

    const widgetId = `widget-${++this.widgetCounter}`;

    const widget = {
      id: widgetId,
      type: widgetType,
      config: {
        ...config,
        title: config.title || widgetType,
        refreshInterval: config.refreshInterval || 5000,
        size: config.size || 'medium'
      },
      data: {},
      created: new Date().toISOString()
    };

    this.widgets.set(widgetId, widget);
    dashboard.widgets.push(widgetId);
    dashboard.lastModified = new Date().toISOString();

    this._logEvent('widget_added', { dashboardId, widgetId, widgetType });

    return { success: true, widgetId, widget };
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId, data) {
    const widget = this.widgets.get(widgetId);

    if (!widget) {
      return { success: false, error: 'Widget not found' };
    }

    widget.data = data;
    widget.lastUpdated = new Date().toISOString();

    // Broadcast to connected clients
    this._broadcastUpdate({
      type: 'widget-update',
      widgetId,
      data
    });

    return { success: true };
  }

  /**
   * Get dashboard
   */
  getDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId);

    if (!dashboard) {
      return null;
    }

    // Populate widget data
    const widgets = dashboard.widgets.map(widgetId => {
      const widget = this.widgets.get(widgetId);
      return widget || null;
    }).filter(w => w !== null);

    return {
      ...dashboard,
      widgets
    };
  }

  /**
   * List dashboards
   */
  listDashboards(limit = 50) {
    return Array.from(this.dashboards.values())
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, limit);
  }

  /**
   * Update dashboard config
   */
  updateDashboard(dashboardId, updates) {
    const dashboard = this.dashboards.get(dashboardId);

    if (!dashboard) {
      return { success: false, error: 'Dashboard not found' };
    }

    Object.assign(dashboard.config, updates);
    dashboard.lastModified = new Date().toISOString();

    this._logEvent('dashboard_updated', { dashboardId });

    return { success: true, dashboard };
  }

  /**
   * Delete dashboard
   */
  deleteDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId);

    if (!dashboard) {
      return { success: false, error: 'Dashboard not found' };
    }

    // Delete associated widgets
    dashboard.widgets.forEach(widgetId => {
      this.widgets.delete(widgetId);
    });

    this.dashboards.delete(dashboardId);

    this._logEvent('dashboard_deleted', { dashboardId });

    return { success: true };
  }

  /**
   * Register a metric source
   */
  registerMetric(name, source, config = {}) {
    const metricId = `metric-${Date.now()}`;

    this.metrics.set(metricId, {
      id: metricId,
      name,
      source,
      config: {
        ...config,
        updateInterval: config.updateInterval || 5000
      },
      lastValue: null,
      history: [],
      registered: new Date().toISOString()
    });

    return { success: true, metricId };
  }

  /**
   * Record metric value
   */
  recordMetric(metricId, value) {
    const metric = this.metrics.get(metricId);

    if (!metric) {
      return { success: false, error: 'Metric not found' };
    }

    metric.lastValue = value;
    metric.history.push({
      timestamp: new Date().toISOString(),
      value
    });

    // Keep history bounded
    if (metric.history.length > 1000) {
      metric.history.shift();
    }

    return { success: true };
  }

  /**
   * Get metric history
   */
  getMetricHistory(metricId, limit = 100) {
    const metric = this.metrics.get(metricId);

    if (!metric) {
      return null;
    }

    return {
      metricId,
      name: metric.name,
      history: metric.history.slice(-limit)
    };
  }

  /**
   * Handle client connection
   */
  addConnection(connectionId) {
    if (this.connections.length >= this.config.maxConnections) {
      return { success: false, error: 'Max connections reached' };
    }

    this.connections.push({
      id: connectionId,
      connected: new Date().toISOString(),
      subscriptions: []
    });

    this._logEvent('client_connected', { connectionId });

    return { success: true };
  }

  /**
   * Handle client disconnection
   */
  removeConnection(connectionId) {
    const idx = this.connections.findIndex(c => c.id === connectionId);

    if (idx === -1) {
      return { success: false };
    }

    this.connections.splice(idx, 1);

    this._logEvent('client_disconnected', { connectionId });

    return { success: true };
  }

  /**
   * Subscribe to updates
   */
  subscribe(connectionId, dashboardId) {
    const connection = this.connections.find(c => c.id === connectionId);

    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    if (!connection.subscriptions.includes(dashboardId)) {
      connection.subscriptions.push(dashboardId);
    }

    return { success: true };
  }

  /**
   * Get server statistics
   */
  getStatistics() {
    const metrics = Array.from(this.metrics.values());
    const metricsWithHistory = metrics.filter(m => m.history.length > 0);

    return {
      dashboards: this.dashboards.size,
      widgets: this.widgets.size,
      metrics: metrics.length,
      metricsWithData: metricsWithHistory.length,
      activeConnections: this.connections.length,
      totalEvents: this.eventLog.length,
      uptime: Date.now() - (this.startTime || Date.now()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get event log
   */
  getEventLog(limit = 100) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Clear old data
   */
  clearOldData(olderThanHours = 24) {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);

    for (const [metricId, metric] of this.metrics.entries()) {
      metric.history = metric.history.filter(entry => {
        return new Date(entry.timestamp).getTime() > cutoff;
      });
    }

    return { success: true };
  }

  // ============ Private Methods ============

  _logEvent(type, data) {
    this.eventLog.push({
      timestamp: new Date().toISOString(),
      type,
      data
    });

    // Keep log bounded
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }
  }

  _broadcastUpdate(message) {
    this.connections.forEach(connection => {
      if (connection.subscriptions.length > 0) {
        // Send to subscribed connections
        // In real implementation, would use WebSocket
      }
    });
  }
}

module.exports = DashboardServer;
