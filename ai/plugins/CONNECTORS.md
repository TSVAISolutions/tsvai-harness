# TSVAI Plugin Connectors

Integration guide for connecting TSVAI plugins with external services and Claude environments.

## MCP Server Integration

### Model Context Protocol (MCP)

TSVAI plugins support MCP for seamless Claude integration.

**MCP Features:**
- Real-time plugin communication
- Bi-directional data flow
- Resource sharing
- Tool exposure to Claude

### Enabling MCP

1. **Verify `.mcp.json` exists**
   ```json
   {
     "name": "tsvai-plugins",
     "version": "1.0.0",
     "description": "TSVAI plugin connectors for Claude",
     "tools": []
   }
   ```

2. **Register your plugin tools**
   ```json
   {
     "tools": [
       {
         "name": "analyze-text",
         "description": "Analyze text using text-analysis plugin",
         "inputSchema": { ... }
       }
     ]
   }
   ```

3. **Start MCP server**
   ```bash
   npm run start:mcp
   ```

## Connector Types

### 1. Claude Code Connector

Enables Claude Code to use TSVAI plugins.

**Configuration:**
```json
{
  "type": "claude-code",
  "enabled": true,
  "plugins": ["sample-plugin", "text-analysis"],
  "settings": {
    "timeout": 30000,
    "enableCaching": true
  }
}
```

**Usage:**
```javascript
// Claude Code automatically discovers and loads plugins
const result = await plugin.execute('command', params);
```

### 2. Slack Connector

Integrate plugins with Slack workflows.

**Configuration:**
```json
{
  "type": "slack",
  "enabled": false,
  "webhookUrl": "https://hooks.slack.com/services/...",
  "plugins": ["sample-plugin"],
  "channels": ["#ai-tools"]
}
```

**Slash Commands:**
```
/analyze-text "Your text here"
/extract-keywords "Your text here"
```

### 3. REST API Connector

Expose plugins via REST endpoints.

**Configuration:**
```json
{
  "type": "rest-api",
  "enabled": false,
  "port": 3000,
  "plugins": ["sample-plugin"],
  "auth": {
    "type": "bearer",
    "token": "${API_TOKEN}"
  }
}
```

**Endpoints:**
```
POST /api/plugins/:name/:command
GET  /api/plugins
GET  /api/plugins/:name
```

### 4. Database Connector

Store plugin results and metadata.

**Configuration:**
```json
{
  "type": "database",
  "enabled": false,
  "provider": "postgres",
  "connection": {
    "host": "${DB_HOST}",
    "database": "${DB_NAME}",
    "user": "${DB_USER}",
    "password": "${DB_PASSWORD}"
  }
}
```

**Tables:**
- `plugin_executions` - Execution history
- `plugin_results` - Result caching
- `plugin_metadata` - Plugin information

### 5. Event Bus Connector

Publish plugin events to message bus.

**Configuration:**
```json
{
  "type": "event-bus",
  "enabled": false,
  "provider": "kafka",
  "brokers": ["localhost:9092"],
  "topics": {
    "plugin.executed": "plugin-events",
    "plugin.error": "plugin-errors"
  }
}
```

**Events:**
```javascript
// On execution
{
  "event": "plugin.executed",
  "plugin": "sample-plugin",
  "command": "analyze",
  "status": "success",
  "duration": 125,
  "timestamp": "2026-08-24T22:00:00Z"
}
```

## Authentication & Authorization

### API Keys

```bash
export TSVAI_API_KEY=sk_test_xxxxx
```

### OAuth2

```json
{
  "auth": {
    "type": "oauth2",
    "clientId": "${OAUTH_CLIENT_ID}",
    "clientSecret": "${OAUTH_CLIENT_SECRET}",
    "tokenUrl": "https://auth.tsvai.com/oauth/token"
  }
}
```

### Service Accounts

```json
{
  "auth": {
    "type": "service-account",
    "email": "plugins@tsvai.iam.gserviceaccount.com",
    "keyFile": "/path/to/service-account-key.json"
  }
}
```

## Data Flow

### Plugin Execution Flow

```
Claude Request
    │
    ▼
[Plugin CLI/API]
    │
    ▼
[MCP Server]
    │
    ▼
[Plugin Manager]
    │
    ▼
[Plugin Execution]
    │
    ├─→ Cache Check
    ├─→ Validation
    └─→ Execution
    │
    ▼
[Result Processing]
    │
    ├─→ Database Storage
    ├─→ Event Publishing
    └─→ Response Formatting
    │
    ▼
Claude Response
```

## Monitoring & Observability

### Metrics Endpoints

```
GET /metrics/plugins
GET /metrics/plugins/:name
GET /metrics/executions
GET /metrics/errors
```

### Health Checks

```bash
# Check plugin health
curl http://localhost:3000/health

# Check MCP server
curl http://localhost:3001/mcp/health
```

### Logging

Logs are written to:
- **Console**: Development environment
- **File**: `./logs/plugins.log`
- **Remote**: Configurable remote logging

**Log Levels:**
- `debug` - Detailed debug information
- `info` - General information
- `warn` - Warning messages
- `error` - Error messages

## Configuration Examples

### Development Setup

```json
{
  "environment": "development",
  "connectors": [
    {
      "type": "claude-code",
      "enabled": true
    }
  ],
  "logging": {
    "level": "debug",
    "format": "json"
  },
  "cache": {
    "enabled": true,
    "ttl": 300
  }
}
```

### Production Setup

```json
{
  "environment": "production",
  "connectors": [
    {
      "type": "claude-code",
      "enabled": true
    },
    {
      "type": "rest-api",
      "enabled": true,
      "port": 3000,
      "auth": {
        "type": "bearer",
        "token": "${API_TOKEN}"
      }
    },
    {
      "type": "database",
      "enabled": true,
      "provider": "postgres"
    },
    {
      "type": "event-bus",
      "enabled": true,
      "provider": "kafka"
    }
  ],
  "logging": {
    "level": "warn",
    "format": "json",
    "remoteUrl": "https://logs.tsvai.com/api/logs"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "provider": "redis"
  }
}
```

## Troubleshooting

### MCP Server Not Connecting

1. Check server is running: `ps aux | grep mcp`
2. Verify port is open: `lsof -i :3001`
3. Check logs: `tail -f ./logs/mcp.log`
4. Test connection: `curl http://localhost:3001/health`

### Plugin Not Available in Claude

1. Verify plugin is registered
2. Check `.claude-plugin/plugin.json` is valid
3. Restart MCP server
4. Check Claude logs for errors

### Authentication Failures

1. Verify credentials are set
2. Check token expiration
3. Review auth logs
4. Test with CLI first

### Performance Issues

1. Enable metrics monitoring
2. Check cache hit rates
3. Review slow query logs
4. Profile plugin execution

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [TSVAI Plugin Guide](./CLAUDE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./sample-plugin/README.md)

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Maintained by**: TSVAI DevOps Team
