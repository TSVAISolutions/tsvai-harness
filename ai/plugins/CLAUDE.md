# TSVAI Plugins - Claude Integration Guide

This document provides guidance on using and developing TSVAI plugins within Claude Code and Claude environments.

## Quick Start

### Installation

```bash
# Clone the repository
git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness/ai/plugins

# Setup plugins
bash scripts/setup.sh

# Build plugins
bash scripts/build-claude-code.sh
```

### Basic Usage

```javascript
const SamplePlugin = require('./sample-plugin');
const plugin = new SamplePlugin();

await plugin.initialize();
const result = await plugin.execute('analyze', { text: 'Your text here' });
```

## Plugin Development

### Creating a New Plugin

1. **Use the sample-plugin as a template:**
   ```bash
   cp -r sample-plugin my-new-plugin
   cd my-new-plugin
   ```

2. **Update plugin.json:**
   ```json
   {
     "name": "my-new-plugin",
     "displayName": "My New Plugin",
     "description": "Description of your plugin"
   }
   ```

3. **Implement your logic in src/index.js**

4. **Test your plugin:**
   ```bash
   npm test
   ```

5. **Build for distribution:**
   ```bash
   npm run build
   ```

### Project Structure

Each plugin should follow this structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── src/
│   ├── index.js                 # Main entry point
│   ├── index.d.ts               # TypeScript types
│   └── [implementation files]
├── tests/
│   ├── unit/
│   └── integration/
├── examples/
│   └── basic.js
├── package.json
├── README.md
└── SKILL.md                     # Claude Skill definition (optional)
```

## Claude Skill Integration

### SKILL.md Format

Create a `SKILL.md` file in your plugin directory to define Claude skills:

```markdown
# My Plugin Skill

> Brief description of what this skill does

## Usage

How to use this skill with Claude.

## Examples

Example usage scenarios.
```

### Available Skills

- **analytics/** - Data analysis and reporting
- **text-analysis/** - Text processing and analysis

## Configuration

### Environment Variables

```bash
export PLUGIN_PATH=/path/to/plugins
export PLUGIN_DEBUG=true
export PLUGIN_TIMEOUT=30000
```

### Claude Code Integration

Plugins automatically integrate with Claude Code through:

1. **Manifest (.claude-plugin/plugin.json)** - Defines plugin metadata
2. **MCP Server** - Enables Claude communication
3. **Hooks** - Lifecycle event management
4. **Skills** - Named capabilities for Claude

## CLI Interface

### Plugin CLI

Access plugins via command line:

```bash
# List all plugins
node bin/plugin-cli.js list

# Validate a plugin
node bin/plugin-cli.js validate sample-plugin

# Run a plugin command
node bin/plugin-cli.js run sample-plugin analyze --text "Hello"
```

## Best Practices

### Code Quality
- Use TypeScript definitions
- Write comprehensive tests
- Follow TSVAI code style
- Document your API

### Performance
- Implement caching where appropriate
- Set reasonable timeouts
- Monitor memory usage
- Handle large inputs efficiently

### Security
- Validate all inputs
- Never log sensitive data
- Use environment variables for secrets
- Implement proper error handling

### Testing
- Unit tests for functions
- Integration tests for workflows
- E2E tests for real scenarios
- Aim for >80% coverage

## Troubleshooting

### Plugin Not Loading

1. Check `.claude-plugin/plugin.json` exists
2. Validate manifest JSON
3. Check entry points exist
4. Review error logs

### Claude Integration Issues

1. Verify `.mcp.json` configuration
2. Check MCP server is running
3. Review Claude logs
4. Test with CLI first

### Performance Problems

1. Enable debug logging
2. Profile plugin execution
3. Check for memory leaks
4. Review error logs

## Resources

- [Plugin Development Guide](./reference/configuration.md)
- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Reference](./sample-plugin/README.md)
- [Examples](./examples/)

## Contributing

1. Follow the plugin development guide
2. Write comprehensive tests
3. Document thoroughly
4. Submit a pull request

## Support

- **Issues**: GitHub Issues
- **Documentation**: See ./docs/
- **Examples**: See ./examples/
- **API Docs**: See each plugin README

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-24  
**Maintained by**: TSVAI DevOps Team
