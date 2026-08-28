/**
 * VI Dashboard
 * Complete visualization interface and web UI system
 * Integrates with all TSVAI components for real-time monitoring
 */

const DashboardServer = require('./dashboard-server');
const WidgetLibrary = require('./widgets');

class VIDashboard {
  constructor(config = {}) {
    this.config = config;

    this.server = new DashboardServer(config.server || {});
    this.widgets = new WidgetLibrary(config.widgets || {});

    this.views = new Map(); // view name -> view config
    this.integrations = new Map(); // integration name -> integration handler
    this.initialized = true;
  }

  /**
   * Initialize dashboard with default views
   */
  initialize() {
    // Create default dashboards
    this.createDefaultDashboards();

    // Register default integrations
    this.registerDefaultIntegrations();

    return { success: true };
  }

  /**
   * Create a new dashboard
   */
  createDashboard(name, config = {}) {
    return this.server.createDashboard(name, config);
  }

  /**
   * Get dashboard
   */
  getDashboard(dashboardId) {
    return this.server.getDashboard(dashboardId);
  }

  /**
   * List dashboards
   */
  listDashboards(limit = 50) {
    return this.server.listDashboards(limit);
  }

  /**
   * Add widget to dashboard
   */
  addWidget(dashboardId, widgetType, config = {}) {
    return this.server.addWidget(dashboardId, widgetType, config);
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId, data) {
    return this.server.updateWidgetData(widgetId, data);
  }

  /**
   * Get available widget types
   */
  getWidgetTypes() {
    return this.widgets.listWidgetTypes();
  }

  /**
   * Create a custom view
   */
  createView(name, config = {}) {
    const view = {
      name,
      dashboards: config.dashboards || [],
      config: {
        ...config,
        layout: config.layout || 'tabs',
        theme: config.theme || 'light'
      },
      created: new Date().toISOString()
    };

    this.views.set(name, view);

    return { success: true, view };
  }

  /**
   * Get view
   */
  getView(viewName) {
    return this.views.get(viewName) || null;
  }

  /**
   * List views
   */
  listViews() {
    return Array.from(this.views.values());
  }

  /**
   * Register data integration
   */
  registerIntegration(name, handlerFn, config = {}) {
    this.integrations.set(name, {
      name,
      handler: handlerFn,
      config,
      registered: new Date().toISOString(),
      dataPoints: []
    });

    return { success: true, integrationName: name };
  }

  /**
   * Feed data from external source
   */
  feedData(integrationName, data) {
    const integration = this.integrations.get(integrationName);

    if (!integration) {
      return { success: false, error: `Integration not found: ${integrationName}` };
    }

    try {
      integration.handler(data, this);

      integration.dataPoints.push({
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Connect to live data source
   */
  connectDataSource(sourceConfig) {
    const sourceId = `source-${Date.now()}`;

    // Register metric source with server
    return this.server.registerMetric(
      sourceConfig.name,
      sourceConfig.type,
      sourceConfig.config
    );
  }

  /**
   * Record metric value
   */
  recordMetric(metricId, value) {
    return this.server.recordMetric(metricId, value);
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(metricId, limit = 100) {
    return this.server.getMetricHistory(metricId, limit);
  }

  /**
   * Get system statistics
   */
  getStatistics() {
    return {
      server: this.server.getStatistics(),
      integrations: this.integrations.size,
      views: this.views.size,
      widgetTypes: this.widgets.listWidgetTypes().length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get server status
   */
  getStatus() {
    const stats = this.server.getStatistics();

    return {
      status: 'running',
      dashboards: stats.dashboards,
      activeConnections: stats.activeConnections,
      metrics: stats.metrics,
      uptime: stats.uptime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get event log
   */
  getEventLog(limit = 100) {
    return this.server.getEventLog(limit);
  }

  /**
   * Cleanup old data
   */
  cleanup(olderThanHours = 24) {
    return this.server.clearOldData(olderThanHours);
  }

  // ============ Private Methods ============

  createDefaultDashboards() {
    // System Overview Dashboard
    const overviewId = this.createDashboard('System Overview', {
      layout: 'grid',
      refreshInterval: 5000
    }).dashboardId;

    this.addWidget(overviewId, 'status', { title: 'System Status' });
    this.addWidget(overviewId, 'gauge', { title: 'Health Score' });
    this.addWidget(overviewId, 'task-queue', { title: 'Task Queue' });

    // Agents Dashboard
    const agentsId = this.createDashboard('Agents', {
      layout: 'grid'
    }).dashboardId;

    this.addWidget(agentsId, 'agent-status', { title: 'Agent Status' });
    this.addWidget(agentsId, 'timeseries', { title: 'Agent Workload' });

    // Knowledge Dashboard
    const knowledgeId = this.createDashboard('Knowledge', {
      layout: 'grid'
    }).dashboardId;

    this.addWidget(knowledgeId, 'knowledge-base', { title: 'Knowledge Base' });
    this.addWidget(knowledgeId, 'timeseries', { title: 'Knowledge Growth' });

    // Activity Dashboard
    const activityId = this.createDashboard('Activity', {
      layout: 'vertical'
    }).dashboardId;

    this.addWidget(activityId, 'activity', { title: 'Recent Events' });
  }

  registerDefaultIntegrations() {
    // Army-Agents integration
    this.registerIntegration('army-agents', (data, dashboard) => {
      if (data.agents) {
        // Find agent-status widget and update
        this.updateAgentStatus(data.agents);
      }
    });

    // Metrics integration
    this.registerIntegration('metrics', (data, dashboard) => {
      if (data.metrics) {
        data.metrics.forEach(metric => {
          dashboard.recordMetric(metric.id, metric.value);
        });
      }
    });

    // Events integration
    this.registerIntegration('events', (data, dashboard) => {
      if (data.events) {
        // Update activity feed
        this.updateActivityFeed(data.events);
      }
    });

    // Health integration
    this.registerIntegration('health', (data, dashboard) => {
      if (data.health) {
        // Update health status
        this.updateHealthStatus(data.health);
      }
    });
  }

  updateAgentStatus(agents) {
    // Update agent-status widgets
    // In real implementation, would find widgets and update them
  }

  updateActivityFeed(events) {
    // Update activity feed widgets
    // In real implementation, would find widgets and update them
  }

  updateHealthStatus(health) {
    // Update status widgets
    // In real implementation, would find widgets and update them
  }
}

module.exports = VIDashboard;
