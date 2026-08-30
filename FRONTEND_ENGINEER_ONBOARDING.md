# Harness Factory - Frontend Engineer Onboarding Guide

Welcome to the Frontend Engineering team! This guide covers everything you need to know about the VI-Dashboard and frontend components of the Harness Factory.

---

## 🎯 Frontend Engineer Responsibilities

As a frontend engineer, you'll be responsible for:

1. **UI/UX Development**
   - VI-Dashboard development and improvements
   - Responsive design and accessibility
   - Component library and reusable components
   - User experience optimization

2. **Integration**
   - Integrating with backend APIs
   - Real-time data visualization
   - WebSocket implementation
   - State management

3. **Performance**
   - Optimize bundle size
   - Improve page load time
   - Lazy loading and code splitting
   - Memory management

4. **Testing**
   - Unit tests for components
   - Integration tests
   - E2E tests
   - Visual regression testing

5. **Documentation**
   - Component documentation
   - Design system documentation
   - API integration guides
   - User guides

---

## 📋 Day 1: Setup & Project Overview

### 1.1 Prerequisites for Frontend Engineers

```bash
# Node.js and npm
node --version              # v18+
npm --version               # v9+

# Git
git --version

# Optional: Frontend tools
npm install -g create-react-app  # If using React
npm install -g vue              # If using Vue
npm install -g @angular/cli     # If using Angular
```

### 1.2 Clone Repository

```bash
# Clone with submodules
git clone --recursive https://github.com/Harness FactorySolutions/harness-factory.git
cd harness-factory

# Install dependencies
npm install

# Install component dependencies
cd ai/vi-dashboard
npm install
```

### 1.3 Project Structure - Frontend

```
harness-factory/
├── ai/vi-dashboard/                 # Main dashboard component
│   ├── src/
│   │   ├── dashboard-server.js      # Express server
│   │   ├── widgets.js               # Widget templates
│   │   ├── vi-dashboard.js          # Main dashboard class
│   │   └── public/                  # Static files
│   │       ├── index.html           # Main HTML
│   │       └── assets/              # Images, fonts, etc.
│   ├── tests/
│   │   └── dashboard.test.js        # Component tests
│   ├── package.json
│   └── README.md
│
└── ai/                              # Other components
    ├── plugin/                      # Plugin system with UI
    ├── integration/                 # Integration layer
    └── ...
```

### 1.4 Understanding the VI-Dashboard

The VI-Dashboard is a real-time monitoring and visualization interface:

```
Components:
├── Dashboard Management
│   ├── Create/Edit dashboards
│   ├── Manage widgets
│   └── Configure views
│
├── Widget System
│   ├── Gauge widgets
│   ├── Time-series charts
│   ├── Status indicators
│   ├── Activity feeds
│   ├── Agent status
│   ├── Task queues
│   └── Knowledge base stats
│
├── Data Integration
│   ├── API connections
│   ├── Real-time updates
│   ├── WebSocket support
│   └── Metric recording
│
└── User Interface
    ├── Responsive grid
    ├── Theme support (light/dark)
    ├── Navigation sidebar
    └── Settings panel
```

---

## 🚀 Day 2: Getting the Dashboard Running

### 2.1 Start the Dashboard Locally

```bash
# Terminal 1: Start the harness API
cd /Users/kbuchepalli/harness-factory
./deploy.sh --deploy-k8s

# Or manually
npm start

# Terminal 2: Port-forward the dashboard
kubectl port-forward -n harness-factory svc/tsvai-dashboard 3001:3001 &

# Open in browser
open http://localhost:3001
```

### 2.2 Access the API

```bash
# Port-forward API
kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 &

# API endpoints
# Health check
curl http://localhost:3000/api/health | jq

# Get status
curl http://localhost:3000/api/status | jq

# List workflows
curl http://localhost:3000/api/workflows | jq
```

### 2.3 Dashboard Directory Structure

```
ai/vi-dashboard/
├── src/
│   ├── dashboard-server.js         # REST API server
│   ├── widgets.js                  # 7 widget templates
│   ├── vi-dashboard.js             # Main orchestrator
│   └── public/
│       ├── index.html              # Main page (400 lines)
│       ├── style.css               # Styles
│       ├── script.js               # Client-side logic
│       └── theme.css               # Theme definitions
│
├── tests/
│   └── dashboard.test.js           # 40+ test cases
│
├── package.json
├── README.md
└── docs/
    └── WIDGET_GUIDE.md             # Widget documentation
```

---

## 🎨 Day 3: Understanding the UI Components

### 3.1 Widget System

The dashboard uses 7 pre-built widget types:

```javascript
// 1. Gauge Widget - Shows percentage/value (0-100)
{
  type: 'gauge',
  title: 'System Health',
  value: 85,
  unit: '%'
}

// 2. Time-Series Widget - Shows trends over time
{
  type: 'time-series',
  title: 'Workflow Duration',
  dataPoints: [{x: '10:00', y: 1200}, {x: '10:05', y: 950}]
}

// 3. Status Widget - Shows component status
{
  type: 'status',
  title: 'API Status',
  status: 'healthy',
  message: 'All systems operational'
}

// 4. Activity Widget - Shows recent events
{
  type: 'activity',
  title: 'Recent Activity',
  items: ['Task 1 completed', 'Data ingested', 'Pattern discovered']
}

// 5. Agent Status Widget - Shows agent statistics
{
  type: 'agent-status',
  title: 'Agents',
  totalAgents: 10,
  busyAgents: 3,
  idleAgents: 7
}

// 6. Task Queue Widget - Shows pending/completed tasks
{
  type: 'task-queue',
  title: 'Task Queue',
  pending: 5,
  completed: 42
}

// 7. Knowledge Base Widget - Shows KB statistics
{
  type: 'knowledge-base',
  title: 'Knowledge Base',
  totalEntries: 1250,
  lastUpdated: '2026-08-29T10:30:00Z'
}
```

### 3.2 HTML Structure

```html
<!-- Main dashboard layout -->
<div id="app">
  <!-- Sidebar navigation -->
  <nav class="sidebar">
    <ul id="dashboardList"></ul>
  </nav>

  <!-- Main content area -->
  <main class="content">
    <!-- Dashboard header -->
    <header class="dashboard-header">
      <h1 id="dashboardName"></h1>
      <div class="controls">
        <button id="addWidget">+ Add Widget</button>
        <button id="editDashboard">Edit</button>
      </div>
    </header>

    <!-- Widget grid -->
    <div class="widget-grid" id="widgetGrid">
      <!-- Widgets rendered here -->
    </div>
  </main>
</div>
```

### 3.3 Styling

```css
/* Responsive grid layout */
.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Widget styling */
.widget {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.widget:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Theme variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --border-color: #3a3a3a;
}
```

---

## 🔗 Day 4: API Integration

### 4.1 Dashboard API Endpoints

```javascript
// Get all dashboards
GET /api/dashboards
Response: [{ id, name, widgets, config }]

// Create dashboard
POST /api/dashboards
Body: { name, config }
Response: { dashboardId }

// Get specific dashboard
GET /api/dashboards/{dashboardId}
Response: { id, name, widgets, config }

// Update dashboard
PUT /api/dashboards/{dashboardId}
Body: { name, config }
Response: { success }

// Add widget to dashboard
POST /api/dashboards/{dashboardId}/widgets
Body: { type, title, config }
Response: { widgetId }

// Update widget data
PUT /api/dashboards/{dashboardId}/widgets/{widgetId}
Body: { value, data }
Response: { success }

// Get system health
GET /api/health
Response: { overall, components }

// Get system status
GET /api/status
Response: { initialized, componentsCount, health }
```

### 4.2 JavaScript Client Code

```javascript
// Fetch dashboard data
async function loadDashboard(dashboardId) {
  const response = await fetch(`/api/dashboards/${dashboardId}`);
  const dashboard = await response.json();
  renderDashboard(dashboard);
}

// Create new widget
async function addWidget(dashboardId, widgetConfig) {
  const response = await fetch(
    `/api/dashboards/${dashboardId}/widgets`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(widgetConfig)
    }
  );
  return await response.json();
}

// Update widget data
async function updateWidget(dashboardId, widgetId, data) {
  const response = await fetch(
    `/api/dashboards/${dashboardId}/widgets/${widgetId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );
  return await response.json();
}

// Real-time updates via polling
setInterval(() => {
  fetch('/api/health')
    .then(r => r.json())
    .then(data => updateHealthWidget(data));
}, 5000);
```

### 4.3 Real-Time Updates

```javascript
// WebSocket support (optional enhancement)
const ws = new WebSocket('ws://localhost:3000/api/metrics');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateWidget(data.widgetId, data.value);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Fallback to polling
};
```

---

## 🧪 Day 5: Testing & Quality

### 5.1 Component Testing

```bash
# Run dashboard tests
npm test -- ai/vi-dashboard/tests/

# Run specific test
npm test -- --testNamePattern="Dashboard Creation"

# Generate coverage
npm test -- --coverage ai/vi-dashboard

# Watch mode for development
npm test -- ai/vi-dashboard/tests/ --watch
```

### 5.2 Test Examples

```javascript
describe('Dashboard Creation', () => {
  it('creates a new dashboard', () => {
    const result = dashboard.createDashboard('Test', { theme: 'dark' });
    
    expect(result.success).toBe(true);
    expect(result.dashboardId).toBeDefined();
  });

  it('adds widget to dashboard', () => {
    const dashId = dashboard.createDashboard('Test').dashboardId;
    const result = dashboard.addWidget(dashId, 'gauge', { title: 'Health' });
    
    expect(result.success).toBe(true);
    expect(result.widgetId).toBeDefined();
  });

  it('renders widget as HTML', () => {
    const widget = dashboard.createWidget('gauge').widget;
    dashboard.updateWidgetData(widget.id, { value: 75 });
    
    const html = dashboard.renderWidget(widget.id);
    
    expect(html).toContain('gauge');
    expect(html).toContain('75');
  });
});
```

### 5.3 Visual Testing

```bash
# Screenshot comparison tests (optional)
npm install --save-dev jest-image-snapshot

# Run visual tests
npm test -- --testNamePattern="visual"

# Update baselines
npm test -- --testNamePattern="visual" -u
```

---

## 🎨 Day 6: Styling & Theming

### 6.1 Theme System

```css
/* Light Theme (default) */
:root {
  --primary-color: #2196F3;
  --secondary-color: #FFC107;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #212121;
  --text-secondary: #757575;
  
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Dark Theme */
[data-theme="dark"] {
  --primary-color: #64B5F6;
  --secondary-color: #FFD54F;
  --success-color: #81C784;
  --warning-color: #FFB74D;
  --error-color: #EF5350;
  
  --bg-primary: #121212;
  --bg-secondary: #1E1E1E;
  --text-primary: #FFFFFF;
  --text-secondary: #B0BEC5;
  
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### 6.2 Responsive Design

```css
/* Mobile first approach */
.widget {
  grid-column: span 1;
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .widget {
    grid-column: span 2;
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .widget-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .widget {
    grid-column: span 1;
  }
}
```

### 6.3 Accessibility

```html
<!-- Use semantic HTML -->
<nav aria-label="Dashboard navigation">
  <ul role="menubar">
    <li role="presentation">
      <a href="#" role="menuitem">Dashboard</a>
    </li>
  </ul>
</nav>

<!-- Proper ARIA labels -->
<button aria-label="Add new widget" id="addWidget">
  <i class="icon-plus"></i>
</button>

<!-- Color contrast -->
/* Ensure WCAG AA compliance (4.5:1 ratio for normal text) */
```

---

## 📊 Week 2: Advanced Features

### 7.1 Data Visualization

```javascript
// Chart.js integration (example)
import Chart from 'chart.js/auto';

const ctx = document.getElementById('timeSeriesChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['10:00', '10:05', '10:10', '10:15'],
    datasets: [{
      label: 'Workflow Duration',
      data: [1200, 950, 1100, 880],
      borderColor: 'rgb(33, 150, 243)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  }
});
```

### 7.2 State Management

```javascript
// Simple state management for dashboard
class DashboardState {
  constructor() {
    this.state = {
      dashboards: [],
      currentDashboard: null,
      widgets: {},
      loading: false,
      error: null
    };
    
    this.listeners = [];
  }
  
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### 7.3 Performance Optimization

```javascript
// Lazy load widgets
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadWidget(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Debounce resize handler
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

window.addEventListener('resize', debounce(() => {
  resizeWidgets();
}, 250));
```

---

## ✅ Frontend Engineer Checklist

### Week 1

- [ ] Clone and setup repository
- [ ] Deploy dashboard locally
- [ ] Understand widget system
- [ ] Explore existing components
- [ ] Read API documentation
- [ ] Run and understand tests
- [ ] Make first UI improvement

### Week 2

- [ ] Integrate with backend APIs
- [ ] Implement real-time updates
- [ ] Add new widget type
- [ ] Improve styling/theme
- [ ] Optimize performance
- [ ] Increase test coverage
- [ ] Write documentation

### Week 3+

- [ ] Design new feature
- [ ] Lead UI/UX improvements
- [ ] Mentor junior developers
- [ ] Code review teammates
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 🎯 Frontend Engineer Success Metrics

**By end of Week 1:**
- ✅ Dashboard running locally
- ✅ Understand architecture
- ✅ Can run and write tests
- ✅ Can make UI changes

**By end of Week 2:**
- ✅ Implemented new feature
- ✅ Integrated with API
- ✅ Improved styling
- ✅ Added tests

**By end of Month:**
- ✅ Owned feature area
- ✅ Led UI improvements
- ✅ Mentored team member
- ✅ Code review capability

---

## 📚 Frontend Documentation

| Resource | Location |
|----------|----------|
| Dashboard API | ai/vi-dashboard/README.md |
| Testing Guide | TESTING_GUIDE.md |
| Component Examples | ai/vi-dashboard/tests/ |
| Styling Guide | ai/vi-dashboard/public/theme.css |

---

**Welcome to Frontend Engineering! 🎨**

Ready to build beautiful, responsive dashboards and real-time UIs!

**Version**: 1.0.0  
**Last Updated**: 2026-08-29
