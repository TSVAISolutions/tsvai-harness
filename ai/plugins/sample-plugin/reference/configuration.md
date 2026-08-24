# Configuration Reference

## Plugin Configuration

### Environment Variables

```bash
# Text Analysis Settings
PLUGIN_MAX_TEXT_LENGTH=10000         # Maximum text length
PLUGIN_ENABLE_CACHE=true             # Enable caching
PLUGIN_CACHE_TTL=3600                # Cache time-to-live (seconds)

# Logging & Debug
PLUGIN_LOG_LEVEL=info                # Log level: debug, info, warn, error
PLUGIN_DEBUG=false                   # Enable debug mode

# Performance
PLUGIN_TIMEOUT=30000                 # Plugin timeout (milliseconds)
PLUGIN_MAX_WORKERS=4                 # Max concurrent operations
```

### Runtime Configuration

```javascript
const plugin = new SamplePlugin({
  // Text Analysis
  maxTextLength: 10000,
  enableCache: true,
  cacheTTL: 3600,

  // Logging
  logLevel: 'info',
  debug: false,

  // Performance
  timeout: 30000,
  maxWorkers: 4
});
```

### Configuration Schema

#### maxTextLength
- **Type**: `number`
- **Default**: `10000`
- **Description**: Maximum allowed text length for analysis
- **Range**: 100 - 1000000

#### enableCache
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable result caching for improved performance

#### cacheTTL
- **Type**: `number`
- **Default**: `3600`
- **Description**: Cache time-to-live in seconds
- **Range**: 60 - 86400

#### logLevel
- **Type**: `string`
- **Default**: `info`
- **Options**: `debug`, `info`, `warn`, `error`
- **Description**: Logging output level

#### debug
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable debug mode for verbose output

#### timeout
- **Type**: `number`
- **Default**: `30000`
- **Description**: Plugin execution timeout in milliseconds
- **Range**: 1000 - 300000

#### maxWorkers
- **Type**: `number`
- **Default**: `4`
- **Description**: Maximum concurrent operations
- **Range**: 1 - 32

## Command-Specific Configuration

### Analyze Command

```javascript
{
  text: "Required text to analyze",
  operations: [
    "wordCount",      // Optional
    "charCount",      // Optional
    "stats",          // Optional
    "keywords"        // Optional
  ]
}
```

### Extract Keywords Command

```javascript
{
  text: "Required text to analyze",
  topN: 5            // Optional, default: 5, range: 1-50
}
```

### Get Sentiment Command

```javascript
{
  text: "Required text to analyze"
}
```

## Performance Tuning

### Caching Configuration

For high-volume analysis:
```javascript
const plugin = new SamplePlugin({
  enableCache: true,
  cacheTTL: 7200,      // 2 hours
  maxCacheSize: 1000   // entries
});
```

### Concurrency Settings

For parallel processing:
```javascript
const plugin = new SamplePlugin({
  maxWorkers: 8,       // Increase for CPU-bound tasks
  timeout: 60000       // Longer timeout for batch operations
});
```

### Memory Optimization

For large texts:
```javascript
const plugin = new SamplePlugin({
  maxTextLength: 50000,  // Allow larger texts
  enableCache: false,    // Disable caching for memory
  logLevel: 'error'      // Reduce logging overhead
});
```

## Common Configuration Patterns

### Development Setup

```javascript
const plugin = new SamplePlugin({
  debug: true,
  logLevel: 'debug',
  enableCache: false,
  timeout: 60000
});
```

### Production Setup

```javascript
const plugin = new SamplePlugin({
  debug: false,
  logLevel: 'warn',
  enableCache: true,
  cacheTTL: 3600,
  timeout: 30000,
  maxWorkers: 8
});
```

### High-Volume Setup

```javascript
const plugin = new SamplePlugin({
  enableCache: true,
  cacheTTL: 7200,
  maxWorkers: 16,
  maxTextLength: 50000,
  timeout: 60000
});
```

## Environment-Specific Configuration

### .env.development

```
NODE_ENV=development
PLUGIN_LOG_LEVEL=debug
PLUGIN_DEBUG=true
PLUGIN_TIMEOUT=60000
PLUGIN_ENABLE_CACHE=false
```

### .env.production

```
NODE_ENV=production
PLUGIN_LOG_LEVEL=error
PLUGIN_DEBUG=false
PLUGIN_TIMEOUT=30000
PLUGIN_ENABLE_CACHE=true
PLUGIN_CACHE_TTL=7200
```

### .env.test

```
NODE_ENV=test
PLUGIN_LOG_LEVEL=error
PLUGIN_DEBUG=false
PLUGIN_TIMEOUT=5000
PLUGIN_ENABLE_CACHE=true
PLUGIN_CACHE_TTL=300
```

## Configuration Validation

The plugin validates configuration on initialization:

```javascript
const plugin = new SamplePlugin(config);
const validation = plugin.validateConfig();

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Troubleshooting Configuration

### Issue: Plugin runs slowly
**Solution**: Enable caching
```javascript
enableCache: true,
cacheTTL: 3600
```

### Issue: Out of memory errors
**Solution**: Reduce text length or disable caching
```javascript
maxTextLength: 5000,
enableCache: false
```

### Issue: Timeout errors
**Solution**: Increase timeout
```javascript
timeout: 60000  // 60 seconds
```

---

**Last Updated**: 2026-08-24
