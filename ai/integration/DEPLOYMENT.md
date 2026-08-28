# TSVAI Harness Deployment Guide

Complete guide for deploying the integrated TSVAI Harness system in production.

## Architecture Overview

The harness consists of 9 core components working in concert:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Plugin System → Army Agents ──────┐                              │
│                                    ↓                              │
│  Harvester → Data Normalizer → Curator ──┐                       │
│                                          ↓                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Brain-Wiki (Knowledge Base)                │ │
│  │                    Pattern Suggestions                      │ │
│  │                  Semantic Search & Context                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                          ↓                                         │
│  Consilient Engine (Consensus & Pattern Mining)                   │
│                          ↓                                         │
│  VI-Dashboard (Real-time Visualization & Monitoring)              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- 4GB minimum RAM (8GB recommended for production)
- 20GB disk space
- Linux/macOS/Windows

### Dependencies

All components use minimal external dependencies:
- Express.js (dashboard server)
- Jest (testing)
- Standard Node.js libraries

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness
git submodule update --init --recursive
```

### 2. Install Dependencies

```bash
# Install top-level dependencies
npm install

# Install component dependencies
cd ai/integration && npm install
cd ../brain-wiki && npm install
cd ../consilient && npm install
cd ../harvester && npm install
cd ../curator && npm install
cd ../vi-dashboard && npm install
cd ../plugin && npm install
cd ../army-agents && npm install
```

### 3. Configure Environment

Create `.env` file in root:

```env
NODE_ENV=production
LOG_LEVEL=info
HARNESS_PORT=3000
DASHBOARD_PORT=3001

# Component configurations
BRAIN_WIKI_DB_PATH=/var/lib/tsvai/brain-wiki
HARVESTER_BATCH_SIZE=100
CURATOR_QUALITY_THRESHOLD=0.7
CONSILIENT_CONFIDENCE_MIN=0.75

# Optional: External integrations
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
```

## Deployment Strategies

### Development Deployment

```bash
# Start in development mode with hot-reload
cd tsvai-harness
npm run dev

# Runs:
# - Harness orchestrator on port 3000
# - VI-Dashboard on port 3001
# - All components in debug mode
```

### Docker Deployment

```bash
# Build Docker image
docker build -t tsvai-harness:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /var/lib/tsvai:/var/lib/tsvai \
  --name tsvai-harness \
  tsvai-harness:latest

# Check logs
docker logs -f tsvai-harness
```

### Kubernetes Deployment

```bash
# Apply k8s manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/statefulset.yaml
kubectl apply -f k8s/service.yaml

# Verify deployment
kubectl get pods -n tsvai
kubectl logs -n tsvai -l app=tsvai-harness
```

See `k8s/` directory for complete manifests.

### Terraform Infrastructure

```bash
# Initialize terraform
cd infrastructure/terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Configure DNS
terraform output harness_dns_name
```

## Initialization Sequence

### System Boot

```javascript
const HarnessOrchestrator = require('./ai/integration/src/harness-orchestrator');

// 1. Create orchestrator
const orchestrator = new HarnessOrchestrator({
  plugins: { /* plugin config */ },
  agents: { /* agent config */ },
  harvester: { /* harvester config */ },
  curator: { /* curator config */ },
  brainWiki: { /* knowledge config */ },
  consilient: { /* consensus config */ },
  dashboard: { /* dashboard config */ }
});

// 2. Initialize all components
await orchestrator.initialize({
  'plugin-system': PluginSystem,
  'army-agents': ArmyAgents,
  'brain-wiki': BrainWiki,
  'consilient': Consilient,
  'harvester': Harvester,
  'curator': Curator,
  'vi-dashboard': VIDashboard
});

// 3. Register workflows
orchestrator.registerWorkflow('data-ingestion', workflows.dataIngestionWorkflow);
orchestrator.registerWorkflow('agent-learning', workflows.agentLearningWorkflow);
orchestrator.registerWorkflow('content-processing', workflows.contentProcessingWorkflow);
orchestrator.registerWorkflow('decision-making', workflows.decisionMakingWorkflow);
orchestrator.registerWorkflow('monitoring', workflows.monitoringWorkflow);

// 4. Check system health
const health = orchestrator.getSystemHealth();
console.log('System Health:', health);

// 5. Run diagnostics
const diagnostics = await orchestrator.runDiagnostics();
console.log('Diagnostics:', diagnostics);
```

## Component Configuration

### Brain-Wiki Configuration

```javascript
{
  storePath: '/var/lib/tsvai/brain-wiki',
  maxEntries: 100000,
  enableVersioning: true,
  enableExport: true,
  searchOptions: {
    minSimilarity: 0.6,
    maxResults: 10
  }
}
```

### Harvester Configuration

```javascript
{
  pipelines: [
    {
      id: 'api-pipeline',
      sources: ['https://api.example.com/data'],
      schedule: '0 */6 * * *',  // Every 6 hours
      batchSize: 100
    }
  ],
  retryPolicy: {
    maxRetries: 3,
    backoffMs: 1000
  }
}
```

### Curator Configuration

```javascript
{
  qualityThreshold: 0.7,
  spamDetection: true,
  noiseDetection: true,
  customFilters: [],
  taxonomies: ['standard'],
  batchSize: 50
}
```

### Consilient Configuration

```javascript
{
  minConfidence: 0.75,
  minFrequency: 2,
  conflictStrategies: ['evidence', 'majority', 'recency'],
  patternMiningWindow: 1000
}
```

### VI-Dashboard Configuration

```javascript
{
  port: 3001,
  host: '0.0.0.0',
  enableRealtime: true,
  theme: 'auto',
  refreshRate: 5000,  // 5 seconds
  maxConnections: 100,
  eventLogSize: 1000
}
```

## Running Workflows

### Execute Data Ingestion

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "data-ingestion",
    "inputs": {
      "pipelineId": "api-pipeline"
    }
  }'
```

### Execute Agent Learning

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "agent-learning",
    "inputs": {
      "tasks": [
        {"id": "task-1", "type": "analyze"},
        {"id": "task-2", "type": "decide"}
      ]
    }
  }'
```

### Execute Content Processing

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "content-processing",
    "inputs": {
      "sources": ["source-1", "source-2"],
      "source": "production"
    }
  }'
```

### Execute Decision Making

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "decision-making",
    "inputs": {
      "question": "Should we scale up?",
      "minConfidence": 0.8
    }
  }'
```

## Monitoring & Health Checks

### Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "components": {
    "brain-wiki": { "status": "healthy" },
    "harvester": { "status": "healthy" },
    "curator": { "status": "healthy" },
    "consilient": { "status": "healthy" },
    "vi-dashboard": { "status": "healthy" }
  }
}
```

### Metrics Endpoint

```bash
curl http://localhost:3000/api/metrics
```

### Dashboard Access

Open browser to `http://localhost:3001` for real-time visualization.

## Logging & Debugging

### Log Levels

```env
LOG_LEVEL=debug    # Verbose logging
LOG_LEVEL=info     # Standard logging
LOG_LEVEL=warn     # Warnings only
LOG_LEVEL=error    # Errors only
```

### Component Logs

```bash
# Brain-Wiki logs
tail -f logs/brain-wiki.log

# Harvester logs
tail -f logs/harvester.log

# Curator logs
tail -f logs/curator.log

# System logs
tail -f logs/system.log
```

## Backup & Recovery

### Backup Data

```bash
# Backup brain-wiki knowledge base
tar -czf backups/brain-wiki-$(date +%Y%m%d).tar.gz /var/lib/tsvai/brain-wiki

# Backup system state
pg_dump tsvai_state > backups/state-$(date +%Y%m%d).sql

# Backup configuration
tar -czf backups/config-$(date +%Y%m%d).tar.gz config/
```

### Restore Data

```bash
# Restore brain-wiki
tar -xzf backups/brain-wiki-YYYYMMDD.tar.gz -C /

# Restore system state
psql tsvai_state < backups/state-YYYYMMDD.sql

# Restore configuration
tar -xzf backups/config-YYYYMMDD.tar.gz -C /
```

## Scaling

### Horizontal Scaling

Run multiple harness instances behind a load balancer:

```nginx
upstream harness {
  server harness-1:3000;
  server harness-2:3000;
  server harness-3:3000;
}

server {
  listen 80;
  server_name api.tsvai.local;
  
  location / {
    proxy_pass http://harness;
  }
}
```

### Vertical Scaling

Increase resources for single instance:

```bash
# Adjust Node.js memory
NODE_OPTIONS="--max-old-space-size=8192" npm start

# Increase database connection pool
HARVESTER_POOL_SIZE=50 npm start
```

## Security

### Authentication

```javascript
// Enable JWT authentication
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

### TLS/SSL

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Or use Let's Encrypt with certbot
certbot certonly --standalone -d harness.example.com
```

### Network Isolation

Run components in separate containers/pods with network policies.

## Troubleshooting

### Component Fails to Initialize

```bash
# Check logs
npm run logs -- --tail=100

# Run diagnostics
curl http://localhost:3000/api/diagnostics

# Test component directly
node -e "const Component = require('./path/to/component'); new Component().test()"
```

### High Memory Usage

```bash
# Check memory stats
node --expose-gc -e "gc(); console.log(process.memoryUsage())"

# Enable memory profiling
NODE_OPTIONS="--prof" npm start
node --prof-process isolate-*.log > profile.txt
```

### Workflow Execution Timeout

```bash
# Increase timeout
WORKFLOW_TIMEOUT=60000 npm start

# Check slow operations
curl http://localhost:3000/api/workflows/profile
```

## Performance Tuning

### Connection Pooling

```javascript
// Harvester connection pool
{
  maxPoolSize: 50,
  minPoolSize: 10,
  connectionTimeout: 10000
}
```

### Cache Configuration

```javascript
// Enable caching
{
  enableCache: true,
  cacheTTL: 3600,  // 1 hour
  cacheSize: 1000
}
```

### Batch Processing

```javascript
// Optimize batch sizes
{
  harvester: { batchSize: 500 },
  curator: { batchSize: 100 },
  brainWiki: { batchSize: 200 }
}
```

## Maintenance

### Regular Tasks

```bash
# Daily: Check health
0 0 * * * curl http://localhost:3000/api/health

# Weekly: Backup data
0 2 * * 0 /opt/tsvai/scripts/backup.sh

# Monthly: Clean logs
0 3 1 * * find logs -mtime +30 -delete

# Quarterly: Optimize database
0 4 1 */3 * npm run db:optimize
```

### Updates

```bash
# Check for updates
npm outdated

# Update dependencies safely
npm update

# Test after update
npm test

# Restart system
systemctl restart tsvai-harness
```

## Support & Resources

- **Documentation**: See `ai/*/README.md` for component docs
- **Issues**: Report at GitHub Issues
- **Architecture**: See `ARCHITECTURE.md`
- **Examples**: See `ai/integration/tests/e2e.test.js`

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-25
