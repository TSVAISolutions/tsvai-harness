/**
 * Widgets
 * Pre-built dashboard widget components and generators
 * Handles rendering, updates, and interactions
 */

class WidgetLibrary {
  constructor(config = {}) {
    this.config = config;
    this.widgets = new Map();
    this.templates = new Map();
    this._registerDefaultWidgets();
  }

  /**
   * Create widget from template
   */
  createWidget(type, config = {}) {
    const template = this.templates.get(type);

    if (!template) {
      return { success: false, error: `Widget type not found: ${type}` };
    }

    const widget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.title || template.defaultTitle,
      config: { ...template.defaultConfig, ...config },
      data: {},
      created: new Date().toISOString()
    };

    this.widgets.set(widget.id, widget);

    return { success: true, widget };
  }

  /**
   * Get widget
   */
  getWidget(widgetId) {
    return this.widgets.get(widgetId) || null;
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

    return { success: true };
  }

  /**
   * Render widget as HTML
   */
  renderWidget(widgetId) {
    const widget = this.widgets.get(widgetId);

    if (!widget) {
      return null;
    }

    const template = this.templates.get(widget.type);

    if (!template.render) {
      return null;
    }

    return template.render(widget);
  }

  /**
   * List available widget types
   */
  listWidgetTypes() {
    return Array.from(this.templates.values()).map(template => ({
      type: template.type,
      title: template.defaultTitle,
      description: template.description,
      category: template.category
    }));
  }

  // ============ Private Methods ============

  _registerDefaultWidgets() {
    // Metrics gauge widget
    this.templates.set('gauge', {
      type: 'gauge',
      defaultTitle: 'Gauge',
      description: 'Circular gauge showing a single metric value',
      category: 'metrics',
      defaultConfig: {
        min: 0,
        max: 100,
        unit: '%'
      },
      render: (widget) => `
        <div class="widget gauge">
          <h3>${widget.title}</h3>
          <div class="gauge-container">
            <div class="gauge-value">${widget.data.value || 0}</div>
            <div class="gauge-unit">${widget.config.unit}</div>
          </div>
        </div>
      `
    });

    // Time series chart widget
    this.templates.set('timeseries', {
      type: 'timeseries',
      defaultTitle: 'Time Series',
      description: 'Line chart showing metrics over time',
      category: 'metrics',
      defaultConfig: {
        height: 300,
        showLegend: true
      },
      render: (widget) => `
        <div class="widget timeseries">
          <h3>${widget.title}</h3>
          <div class="chart-container" style="height: ${widget.config.height}px">
            <canvas id="chart-${widget.id}"></canvas>
          </div>
        </div>
      `
    });

    // Status widget
    this.templates.set('status', {
      type: 'status',
      defaultTitle: 'Status',
      description: 'Shows system or service status',
      category: 'status',
      defaultConfig: {},
      render: (widget) => `
        <div class="widget status ${widget.data.status || 'unknown'}">
          <h3>${widget.title}</h3>
          <div class="status-badge">${widget.data.status || 'Unknown'}</div>
          <div class="status-message">${widget.data.message || ''}</div>
        </div>
      `
    });

    // Activity feed widget
    this.templates.set('activity', {
      type: 'activity',
      defaultTitle: 'Activity Feed',
      description: 'Shows recent events and activities',
      category: 'logs',
      defaultConfig: {
        maxItems: 10
      },
      render: (widget) => `
        <div class="widget activity">
          <h3>${widget.title}</h3>
          <div class="activity-list">
            ${(widget.data.items || []).slice(0, widget.config.maxItems).map(item =>
              `<div class="activity-item">
                <div class="activity-time">${item.timestamp}</div>
                <div class="activity-text">${item.message}</div>
              </div>`
            ).join('')}
          </div>
        </div>
      `
    });

    // Agent status widget
    this.templates.set('agent-status', {
      type: 'agent-status',
      defaultTitle: 'Agents',
      description: 'Shows status of all agents',
      category: 'agents',
      defaultConfig: {},
      render: (widget) => `
        <div class="widget agent-status">
          <h3>${widget.title}</h3>
          <div class="agent-list">
            ${(widget.data.agents || []).map(agent =>
              `<div class="agent-item ${agent.healthy ? 'healthy' : 'unhealthy'}">
                <div class="agent-name">${agent.name}</div>
                <div class="agent-status">${agent.status}</div>
                <div class="agent-uptime">${agent.uptime}</div>
              </div>`
            ).join('')}
          </div>
        </div>
      `
    });

    // Task queue widget
    this.templates.set('task-queue', {
      type: 'task-queue',
      defaultTitle: 'Task Queue',
      description: 'Shows task queue statistics',
      category: 'tasks',
      defaultConfig: {},
      render: (widget) => `
        <div class="widget task-queue">
          <h3>${widget.title}</h3>
          <div class="queue-stats">
            <div class="stat">
              <div class="stat-value">${widget.data.pending || 0}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat">
              <div class="stat-value">${widget.data.running || 0}</div>
              <div class="stat-label">Running</div>
            </div>
            <div class="stat">
              <div class="stat-value">${widget.data.completed || 0}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
        </div>
      `
    });

    // Knowledge base widget
    this.templates.set('knowledge-base', {
      type: 'knowledge-base',
      defaultTitle: 'Knowledge Base',
      description: 'Shows knowledge base statistics',
      category: 'knowledge',
      defaultConfig: {},
      render: (widget) => `
        <div class="widget knowledge-base">
          <h3>${widget.title}</h3>
          <div class="kb-stats">
            <div class="stat">
              <div class="stat-value">${widget.data.totalEntries || 0}</div>
              <div class="stat-label">Entries</div>
            </div>
            <div class="stat">
              <div class="stat-value">${widget.data.indexed || 0}</div>
              <div class="stat-label">Indexed</div>
            </div>
            <div class="stat">
              <div class="stat-value">${Math.round((widget.data.coverage || 0) * 100)}%</div>
              <div class="stat-label">Coverage</div>
            </div>
          </div>
        </div>
      `
    });
  }
}

module.exports = WidgetLibrary;
