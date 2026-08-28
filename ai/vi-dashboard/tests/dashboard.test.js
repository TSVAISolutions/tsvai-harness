/**
 * VI Dashboard Tests
 * Tests for dashboard server, widgets, and integration
 */

const VIDashboard = require('../src/vi-dashboard');
const DashboardServer = require('../src/dashboard-server');
const WidgetLibrary = require('../src/widgets');

describe('DashboardServer', () => {
  let server;

  beforeEach(() => {
    server = new DashboardServer();
  });

  describe('Dashboard Management', () => {
    it('creates a dashboard', () => {
      const result = server.createDashboard('Test', { theme: 'dark' });

      expect(result.success).toBe(true);
      expect(result.dashboardId).toBeDefined();
    });

    it('retrieves a dashboard', () => {
      const created = server.createDashboard('Test');
      const retrieved = server.getDashboard(created.dashboardId);

      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe('Test');
    });

    it('lists dashboards', () => {
      server.createDashboard('Dashboard 1');
      server.createDashboard('Dashboard 2');

      const dashboards = server.listDashboards();

      expect(dashboards.length).toBe(2);
    });

    it('updates dashboard config', () => {
      const created = server.createDashboard('Test');
      const result = server.updateDashboard(created.dashboardId, { theme: 'dark' });

      expect(result.success).toBe(true);
      expect(result.dashboard.config.theme).toBe('dark');
    });

    it('deletes a dashboard', () => {
      const created = server.createDashboard('Test');
      const result = server.deleteDashboard(created.dashboardId);

      expect(result.success).toBe(true);
      expect(server.getDashboard(created.dashboardId)).toBeNull();
    });
  });

  describe('Widget Management', () => {
    it('adds widget to dashboard', () => {
      const dashboardId = server.createDashboard('Test').dashboardId;
      const result = server.addWidget(dashboardId, 'gauge', { title: 'Health' });

      expect(result.success).toBe(true);
      expect(result.widgetId).toBeDefined();
    });

    it('updates widget data', () => {
      const dashboardId = server.createDashboard('Test').dashboardId;
      const widgetId = server.addWidget(dashboardId, 'gauge').widgetId;

      const result = server.updateWidgetData(widgetId, { value: 85 });

      expect(result.success).toBe(true);
    });

    it('retrieves dashboard with widgets', () => {
      const dashboardId = server.createDashboard('Test').dashboardId;
      server.addWidget(dashboardId, 'gauge');
      server.addWidget(dashboardId, 'status');

      const dashboard = server.getDashboard(dashboardId);

      expect(dashboard.widgets.length).toBe(2);
    });
  });

  describe('Metric Management', () => {
    it('registers a metric', () => {
      const result = server.registerMetric('cpu', 'system');

      expect(result.success).toBe(true);
      expect(result.metricId).toBeDefined();
    });

    it('records metric value', () => {
      const metricId = server.registerMetric('memory', 'system').metricId;
      const result = server.recordMetric(metricId, 75);

      expect(result.success).toBe(true);
    });

    it('gets metric history', () => {
      const metricId = server.registerMetric('uptime', 'system').metricId;
      server.recordMetric(metricId, 100);
      server.recordMetric(metricId, 100);

      const history = server.getMetricHistory(metricId);

      expect(history.history.length).toBe(2);
    });
  });

  describe('Connection Management', () => {
    it('adds connection', () => {
      const result = server.addConnection('client-1');

      expect(result.success).toBe(true);
    });

    it('removes connection', () => {
      server.addConnection('client-1');
      const result = server.removeConnection('client-1');

      expect(result.success).toBe(true);
    });

    it('subscribes to dashboard', () => {
      server.addConnection('client-1');
      const dashboardId = server.createDashboard('Test').dashboardId;

      const result = server.subscribe('client-1', dashboardId);

      expect(result.success).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('provides server statistics', () => {
      server.createDashboard('Test');
      server.addConnection('client-1');

      const stats = server.getStatistics();

      expect(stats.dashboards).toBeGreaterThan(0);
      expect(stats.activeConnections).toBeGreaterThan(0);
    });

    it('tracks event log', () => {
      server.createDashboard('Test');

      const log = server.getEventLog();

      expect(log.length).toBeGreaterThan(0);
    });
  });
});

describe('WidgetLibrary', () => {
  let library;

  beforeEach(() => {
    library = new WidgetLibrary();
  });

  describe('Widget Creation', () => {
    it('creates widget from template', () => {
      const result = library.createWidget('gauge', { title: 'CPU' });

      expect(result.success).toBe(true);
      expect(result.widget.type).toBe('gauge');
    });

    it('lists widget types', () => {
      const types = library.listWidgetTypes();

      expect(types.length).toBeGreaterThan(0);
      expect(types[0].type).toBeDefined();
    });
  });

  describe('Widget Data', () => {
    it('updates widget data', () => {
      const widget = library.createWidget('gauge').widget;
      const result = library.updateWidgetData(widget.id, { value: 50 });

      expect(result.success).toBe(true);
    });

    it('retrieves widget', () => {
      const created = library.createWidget('gauge').widget;
      const retrieved = library.getWidget(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
    });
  });

  describe('Widget Rendering', () => {
    it('renders widget as HTML', () => {
      const widget = library.createWidget('status', { title: 'System' }).widget;
      library.updateWidgetData(widget.id, { status: 'healthy', message: 'All good' });

      const html = library.renderWidget(widget.id);

      expect(html).toBeTruthy();
      expect(html).toContain('System');
    });

    it('renders all widget types', () => {
      const types = library.listWidgetTypes();

      types.forEach(type => {
        const widget = library.createWidget(type.type).widget;
        const html = library.renderWidget(widget.id);

        expect(html).toBeTruthy();
      });
    });
  });
});

describe('VIDashboard', () => {
  let dashboard;

  beforeEach(() => {
    dashboard = new VIDashboard();
    dashboard.initialize();
  });

  describe('Dashboard Creation', () => {
    it('creates a dashboard', () => {
      const result = dashboard.createDashboard('Custom', { theme: 'dark' });

      expect(result.success).toBe(true);
    });

    it('gets dashboard', () => {
      const created = dashboard.createDashboard('Test');
      const retrieved = dashboard.getDashboard(created.dashboardId);

      expect(retrieved).toBeDefined();
    });

    it('lists dashboards', () => {
      const dashboards = dashboard.listDashboards();

      expect(dashboards.length).toBeGreaterThan(0);
    });
  });

  describe('Widget Operations', () => {
    it('adds widget to dashboard', () => {
      const dashId = dashboard.createDashboard('Test').dashboardId;
      const result = dashboard.addWidget(dashId, 'gauge');

      expect(result.success).toBe(true);
    });

    it('updates widget data', () => {
      const dashId = dashboard.createDashboard('Test').dashboardId;
      const widgetId = dashboard.addWidget(dashId, 'gauge').widgetId;

      const result = dashboard.updateWidgetData(widgetId, { value: 75 });

      expect(result.success).toBe(true);
    });

    it('gets available widget types', () => {
      const types = dashboard.getWidgetTypes();

      expect(types.length).toBeGreaterThan(0);
    });
  });

  describe('Views', () => {
    it('creates a view', () => {
      const result = dashboard.createView('Custom', { layout: 'tabs' });

      expect(result.success).toBe(true);
    });

    it('retrieves a view', () => {
      dashboard.createView('Test');
      const view = dashboard.getView('Test');

      expect(view).toBeDefined();
      expect(view.name).toBe('Test');
    });

    it('lists views', () => {
      dashboard.createView('View 1');
      dashboard.createView('View 2');

      const views = dashboard.listViews();

      expect(views.length).toBeGreaterThan(0);
    });
  });

  describe('Integrations', () => {
    it('registers integration', () => {
      const result = dashboard.registerIntegration('test', () => {});

      expect(result.success).toBe(true);
    });

    it('feeds data through integration', () => {
      dashboard.registerIntegration('test', () => {});
      const result = dashboard.feedData('test', { test: 'data' });

      expect(result.success).toBe(true);
    });
  });

  describe('Metrics', () => {
    it('connects data source', () => {
      const result = dashboard.connectDataSource({ name: 'CPU', type: 'system' });

      expect(result.success).toBe(true);
    });

    it('records metric', () => {
      const metricId = dashboard.connectDataSource({ name: 'Memory' }).metricId;
      const result = dashboard.recordMetric(metricId, 80);

      expect(result.success).toBe(true);
    });
  });

  describe('Status and Statistics', () => {
    it('gets dashboard status', () => {
      const status = dashboard.getStatus();

      expect(status.status).toBe('running');
      expect(status.timestamp).toBeDefined();
    });

    it('gets statistics', () => {
      const stats = dashboard.getStatistics();

      expect(stats.server).toBeDefined();
      expect(stats.integrations).toBeDefined();
    });

    it('gets event log', () => {
      dashboard.createDashboard('Test');

      const log = dashboard.getEventLog();

      expect(log.length).toBeGreaterThan(0);
    });
  });
});
