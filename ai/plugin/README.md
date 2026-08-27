# TSVAI Plugin System

**Status:** ✅ Production Ready (Phase 2 Complete)

Unified plugin system with 7 core skills providing text analysis, data processing, content generation, NLP, quality assurance, and reporting capabilities.

## Quick Start

```bash
# Initialize plugin system
const PluginSystem = require('./src/plugin-system');
const system = new PluginSystem();
await system.initialize();

# Discover skills
const skills = system.getSkillRegistry();

# Search for skills
const results = system.searchSkills('sentiment');

# Execute a skill
const result = await system.executeTool('analytics_analytics', {
  operation: 'sentiment',
  params: { text: 'This is wonderful!' }
});
```

## Core Skills (7 Implemented)

| # | Skill | Operations | Status |
|---|-------|-----------|--------|
| 1 | **Analytics** | analyze, keywords, sentiment, stats | ✅ |
| 2 | **Text Analysis** | sentences, paragraphs, words, patterns | ✅ |
| 3 | **Data Processing** | convert, transform, filter, aggregate, flatten, chunk | ✅ |
| 4 | **Content Generation** | report, list, table, template, outline | ✅ |
| 5 | **NLP Processing** | tokenize, entities, language, pos, nounPhrases | ✅ |
| 6 | **Quality Assurance** | validate, metrics, ranges, anomalies, duplicates | ✅ |
| 7 | **Reporting** | executiveSummary, trends, comparison, performance | ✅ |

## Overview

The TSVAI Plugin System provides a production-ready framework for skill discovery, execution, and integration with Claude via MCP (Model Context Protocol).

## Plugin Structure

Each plugin follows a standardized structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest and configuration
├── src/
│   ├── index.js                 # Main plugin entry point
│   ├── index.d.ts               # TypeScript type definitions
│   └── [module files]           # Plugin implementation
├── bin/
│   └── cli.js                   # Command-line interface
├── scripts/
│   ├── build.js
│   ├── test.js
│   └── deploy.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── EXAMPLES.md
├── examples/
│   └── [usage examples]
├── hooks/
│   ├── pre-install.js
│   ├── post-install.js
│   └── [lifecycle hooks]
├── reference/
│   ├── configuration.md
│   ├── error-codes.md
│   └── best-practices.md
├── package.json
└── README.md
```

## Available Plugins

### Sample Plugin

A demonstration plugin showcasing text analysis capabilities.

**Features:**
- Text statistics and analysis
- Keyword extraction
- Sentiment analysis
- Readability scoring

**Installation:**
```bash
cd sample-plugin
npm install
```

**Usage:**
```javascript
const SamplePlugin = require('./sample-plugin');
const plugin = new SamplePlugin();
await plugin.initialize();
```

See [sample-plugin/README.md](./sample-plugin/README.md) for detailed documentation.

## Plugin Development Guide

### Creating a New Plugin

1. **Initialize plugin structure:**
   ```bash
   mkdir my-plugin
   cd my-plugin
   npm init -y
   ```

2. **Create `.claude-plugin/plugin.json`:**
   ```json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "displayName": "My Plugin",
     "description": "Plugin description",
     "entry": {
       "main": "src/index.js",
       "types": "src/index.d.ts"
     }
   }
   ```

3. **Implement plugin in `src/index.js`:**
   ```javascript
   class MyPlugin {
     async initialize() { }
     async execute(command, params) { }
     async validate(params) { }
     getMetadata() { }
     async shutdown() { }
   }
   module.exports = MyPlugin;
   ```

4. **Add tests in `tests/`**

5. **Document in `README.md`**

### Directory Guidelines

- **src/**: Plugin implementation and logic
- **bin/**: CLI entry points and command utilities
- **scripts/**: Build, test, and deployment scripts
- **tests/**: Unit, integration, and E2E tests
- **docs/**: Detailed documentation
- **examples/**: Usage examples and demos
- **hooks/**: Lifecycle hooks (pre/post install, etc.)
- **reference/**: Configuration guides and references

### Plugin Manifest (plugin.json)

Required fields:
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "displayName": "Human Readable Name",
  "description": "What the plugin does",
  "entry": {
    "main": "src/index.js",
    "types": "src/index.d.ts"
  }
}
```

Optional fields:
```json
{
  "author": "Your Name",
  "license": "MIT",
  "keywords": ["tag1", "tag2"],
  "capabilities": { },
  "configuration": { },
  "commands": [ ],
  "activationEvents": [ ],
  "permissions": [ ]
}
```

## Plugin Lifecycle

```
Initialize → Validate → Execute → Cache → Shutdown
```

### Initialize
Plugin setup and resource allocation

### Validate
Input validation before execution

### Execute
Core plugin logic

### Cache (Optional)
Result caching for performance

### Shutdown
Cleanup and resource deallocation

## Best Practices

### Code Quality
- Use TypeScript types for better IDE support
- Write comprehensive JSDoc comments
- Follow TSVAI code style guide
- Include error handling

### Testing
- Unit tests for individual functions
- Integration tests for plugin workflows
- E2E tests for real-world scenarios
- Aim for >80% code coverage

### Documentation
- Detailed README with examples
- API documentation
- Architecture diagrams
- Troubleshooting guide

### Performance
- Implement caching where appropriate
- Handle large inputs efficiently
- Set reasonable timeouts
- Monitor memory usage

### Security
- Validate all input
- Sanitize sensitive data
- Use environment variables for secrets
- Follow OWASP guidelines

## Plugin Configuration

### Via plugin.json
```json
{
  "configuration": {
    "maxLength": {
      "type": "number",
      "default": 10000
    }
  }
}
```

### Via Environment Variables
```bash
export PLUGIN_MAX_LENGTH=10000
export PLUGIN_TIMEOUT=5000
```

### At Runtime
```javascript
const plugin = new MyPlugin({
  maxLength: 10000,
  timeout: 5000
});
```

## Plugin Manager Integration

Register and manage multiple plugins:

```javascript
const PluginManager = require('plugin-manager');
const MyPlugin = require('./my-plugin');

const manager = new PluginManager();
manager.register('my-plugin', new MyPlugin());

const result = await manager.execute('my-plugin', 'command', params);
```

## Publishing Plugins

### GitHub Packages
```bash
npm publish
```

### Plugin Registry
Submit to TSVAI plugin registry for community discovery.

## Troubleshooting

### Plugin Not Loading
- Check `plugin.json` is valid JSON
- Verify `main` entry point exists
- Check plugin dependencies installed
- Review initialization errors

### Execution Failures
- Validate input parameters
- Check error messages in logs
- Review plugin documentation
- Enable debug logging

### Performance Issues
- Profile plugin execution
- Check for memory leaks
- Optimize hot paths
- Enable caching

## Support & Resources

- **Plugin Template**: Use `sample-plugin` as a template
- **Documentation**: Read plugin READMEs and docs/
- **Examples**: Check examples/ folders for usage patterns
- **Issues**: Report bugs in main repository

## Contributing

1. Follow plugin development guide
2. Ensure high test coverage
3. Document thoroughly
4. Submit pull request with plugin

## Standards & Conventions

### Naming
- Plugin names: kebab-case (e.g., `text-analyzer`)
- Files: camelCase (e.g., `textAnalyzer.js`)
- Functions: camelCase (e.g., `analyzeText()`)
- Constants: UPPER_SNAKE_CASE

### Error Codes
Reference error codes in `reference/error-codes.md`

### Configuration Schema
Document all config options in `reference/configuration.md`

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Maintained by**: TSVAI DevOps Team
