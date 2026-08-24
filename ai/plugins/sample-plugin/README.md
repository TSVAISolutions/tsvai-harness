# Sample Text Analysis Plugin

A demonstration plugin for TSVAI Solutions showcasing text analysis capabilities and the TSVAI plugin architecture.

## Overview

This plugin provides text analysis functionality including:
- **Word & Character Counting**: Get comprehensive text statistics
- **Keyword Extraction**: Identify top keywords from text
- **Sentiment Analysis**: Analyze emotional tone of text
- **Readability Scoring**: Assess text complexity and readability
- **Text Statistics**: Generate detailed linguistic metrics

## Features

- 📊 Comprehensive text analysis
- 🔍 Intelligent keyword extraction
- 😊 Sentiment analysis with confidence scores
- 📈 Readability assessment
- ⚡ Async/await support
- 🛡️ Input validation
- 💾 Results caching
- 🔧 Configurable behavior

## Installation

### From GitHub
```bash
npm install @tsvai/sample-plugin
```

### From source
```bash
cd ai/plugins/sample-plugin
npm install
```

## Usage

### Basic Usage

```javascript
const SamplePlugin = require('@tsvai/sample-plugin');

const plugin = new SamplePlugin({
  maxTextLength: 10000,
  enableCache: true,
  cacheTTL: 3600
});

// Initialize plugin
await plugin.initialize();

// Analyze text
const result = await plugin.execute('analyze', {
  text: 'Your text here...',
  operations: ['wordCount', 'stats', 'keywords']
});

console.log(result);
```

### With Plugin Manager

```javascript
const SamplePlugin = require('@tsvai/sample-plugin');
const PluginManager = require('@tsvai/sample-plugin/src/manager');

const manager = new PluginManager();
const plugin = new SamplePlugin();

manager.register('textanalysis', plugin);

// Execute commands
const result = await manager.execute('textanalysis', 'analyze', {
  text: 'Your text here...',
  operations: ['wordCount', 'stats']
});
```

## API Reference

### Commands

#### `analyze`
Perform comprehensive text analysis.

**Parameters:**
- `text` (string, required): Text to analyze
- `operations` (array, optional): Operations to perform
  - `wordCount`: Count words
  - `charCount`: Count characters
  - `stats`: Generate statistics
  - `keywords`: Extract keywords

**Example:**
```javascript
const result = await plugin.execute('analyze', {
  text: 'The quick brown fox jumps over the lazy dog.',
  operations: ['wordCount', 'charCount', 'stats']
});
```

**Response:**
```json
{
  "success": true,
  "text": "The quick brown fox jumps...",
  "textLength": 45,
  "analysis": {
    "wordCount": 9,
    "charCount": 45,
    "stats": {
      "wordCount": 9,
      "charCount": 45,
      "sentenceCount": 1,
      "lineCount": 1,
      "avgWordLength": 5,
      "avgSentenceLength": 9,
      "readabilityScore": 92
    }
  }
}
```

#### `extractKeywords`
Extract top keywords from text.

**Parameters:**
- `text` (string, required): Text to analyze
- `topN` (number, optional): Number of keywords to return (default: 5)

**Example:**
```javascript
const result = await plugin.execute('extractKeywords', {
  text: 'Artificial intelligence is transforming industries...',
  topN: 5
});
```

**Response:**
```json
{
  "success": true,
  "keywords": [
    { "word": "artificial", "frequency": 3 },
    { "word": "intelligence", "frequency": 3 },
    { "word": "industries", "frequency": 2 }
  ],
  "totalWords": 28,
  "uniqueWords": 18
}
```

#### `getSentiment`
Analyze sentiment of text.

**Parameters:**
- `text` (string, required): Text to analyze

**Example:**
```javascript
const result = await plugin.execute('getSentiment', {
  text: 'I absolutely love this amazing product!'
});
```

**Response:**
```json
{
  "success": true,
  "sentiment": "positive",
  "score": 0.667,
  "confidence": 0.5,
  "positiveWords": 2,
  "negativeWords": 0
}
```

#### `getStats`
Get detailed text statistics.

**Parameters:**
- `text` (string, required): Text to analyze

**Example:**
```javascript
const result = await plugin.execute('getStats', {
  text: 'Your text here...'
});
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "wordCount": 50,
    "charCount": 325,
    "sentenceCount": 5,
    "lineCount": 1,
    "avgWordLength": 6.5,
    "avgSentenceLength": 10,
    "readabilityScore": 65
  }
}
```

### PluginManager API

#### `register(name, plugin)`
Register a plugin with the manager.

```javascript
manager.register('textanalysis', plugin);
```

#### `unregister(name)`
Unregister a plugin.

```javascript
manager.unregister('textanalysis');
```

#### `execute(name, command, params)`
Execute a plugin command.

```javascript
const result = await manager.execute('textanalysis', 'analyze', params);
```

#### `listPlugins()`
List all registered plugins.

```javascript
const plugins = manager.listPlugins();
```

#### `on(event, callback)`
Register event hook.

```javascript
manager.on('plugin:executed', async (data) => {
  console.log('Plugin executed:', data);
});
```

## Configuration

### Plugin Configuration

```javascript
const plugin = new SamplePlugin({
  maxTextLength: 10000,      // Maximum text length
  enableCache: true,          // Enable result caching
  cacheTTL: 3600              // Cache TTL in seconds
});
```

### Environment Variables

```bash
PLUGIN_MAX_TEXT_LENGTH=10000
PLUGIN_ENABLE_CACHE=true
PLUGIN_CACHE_TTL=3600
```

## Development

### Project Structure

```
sample-plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── src/
│   ├── index.js              # Main plugin class
│   ├── index.d.ts            # TypeScript definitions
│   ├── analyzer.js           # Text analysis logic
│   └── manager.js            # Plugin manager
├── tests/
│   ├── analyzer.test.js
│   ├── plugin.test.js
│   └── manager.test.js
├── examples/
│   └── basic.js              # Usage example
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Building

```bash
npm run build
```

## Creating New Plugins

To create a new plugin based on this sample:

1. **Copy the sample plugin structure:**
   ```bash
   cp -r sample-plugin my-new-plugin
   ```

2. **Update `plugin.json`:**
   ```json
   {
     "name": "my-new-plugin",
     "displayName": "My New Plugin",
     "description": "Description of your plugin"
   }
   ```

3. **Implement your plugin logic in `src/index.js`:**
   ```javascript
   class MyPlugin extends BasePlugin {
     async execute(command, params) {
       // Your implementation
     }
   }
   ```

4. **Add tests in `tests/`**

5. **Update `package.json` with your plugin details**

### Plugin Interface

All plugins must implement:

```typescript
interface Plugin {
  initialize(): Promise<{ success: boolean }>;
  execute(command: string, params: any): Promise<any>;
  validate(params: any): Promise<ValidationResult>;
  getMetadata(): PluginMetadata;
  shutdown(): Promise<{ success: boolean }>;
}
```

## Examples

### Example 1: Basic Analysis

```javascript
const SamplePlugin = require('@tsvai/sample-plugin');

const plugin = new SamplePlugin();
await plugin.initialize();

const result = await plugin.execute('analyze', {
  text: 'Artificial intelligence is transforming the world.',
  operations: ['wordCount', 'stats', 'keywords']
});

console.log(JSON.stringify(result, null, 2));
```

### Example 2: Using Plugin Manager

```javascript
const SamplePlugin = require('@tsvai/sample-plugin');
const PluginManager = require('@tsvai/sample-plugin/src/manager');

const manager = new PluginManager();
const textPlugin = new SamplePlugin();

manager.register('text', textPlugin);

// Hook into plugin events
manager.on('plugin:executed', async (data) => {
  console.log('Plugin execution completed:', data.command);
});

// Execute plugin
const result = await manager.execute('text', 'getSentiment', {
  text: 'This is amazing!'
});

console.log(result.sentiment); // "positive"
```

## Troubleshooting

### Plugin Not Executing

**Issue**: Plugin fails to execute
- Ensure plugin is initialized: `await plugin.initialize()`
- Validate input parameters match required schema
- Check plugin is registered with manager

### Unexpected Analysis Results

**Issue**: Analysis results seem incorrect
- Verify input text is in expected format
- Check text length doesn't exceed `maxTextLength`
- Review stop words used for keyword extraction

### Performance Issues

**Issue**: Plugin execution is slow
- Enable caching: `enableCache: true`
- Reduce text length for analysis
- Use specific operations instead of all operations

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/TSVAISolutions/tsvai-harness/issues)
- **Documentation**: See `/docs` folder
- **Examples**: See `/examples` folder

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Maintained by**: TSVAI DevOps Team
