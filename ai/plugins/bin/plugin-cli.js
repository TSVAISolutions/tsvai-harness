#!/usr/bin/env node

/**
 * TSVAI Plugin CLI
 * Command-line interface for managing and running plugins
 */

const fs = require('fs');
const path = require('path');

class PluginCLI {
  constructor() {
    this.pluginDir = path.join(__dirname, '..');
    this.commands = {
      'list': this.listPlugins.bind(this),
      'run': this.runPlugin.bind(this),
      'init': this.initPlugin.bind(this),
      'validate': this.validatePlugin.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  async execute(args) {
    const [command, ...params] = args.slice(2);

    if (!command || !this.commands[command]) {
      this.showHelp();
      return;
    }

    try {
      await this.commands[command](params);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async listPlugins(params) {
    console.log('Available Plugins:\n');
    const pluginDirs = this.getPluginDirectories();

    if (pluginDirs.length === 0) {
      console.log('No plugins found.');
      return;
    }

    pluginDirs.forEach(dir => {
      const manifestPath = path.join(this.pluginDir, dir, '.claude-plugin', 'plugin.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        console.log(`  📦 ${manifest.name}`);
        console.log(`     ${manifest.displayName || manifest.name}`);
        console.log(`     v${manifest.version}`);
        console.log(`     ${manifest.description}\n`);
      }
    });
  }

  async runPlugin(params) {
    if (params.length < 2) {
      console.error('Usage: plugin-cli run <plugin-name> <command> [options]');
      process.exit(1);
    }

    const [pluginName, command, ...options] = params;
    console.log(`Running ${pluginName}:${command} with options:`, options);
    // Plugin execution logic
  }

  async initPlugin(params) {
    if (params.length === 0) {
      console.error('Usage: plugin-cli init <plugin-name>');
      process.exit(1);
    }

    const pluginName = params[0];
    console.log(`Initializing new plugin: ${pluginName}`);
    // Plugin initialization logic
  }

  async validatePlugin(params) {
    if (params.length === 0) {
      console.error('Usage: plugin-cli validate <plugin-name>');
      process.exit(1);
    }

    const pluginName = params[0];
    const pluginDir = path.join(this.pluginDir, pluginName);

    if (!fs.existsSync(pluginDir)) {
      console.error(`Plugin not found: ${pluginName}`);
      process.exit(1);
    }

    const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      console.error(`Invalid plugin: Missing .claude-plugin/plugin.json`);
      process.exit(1);
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`✓ Plugin manifest is valid`);
      console.log(`  Name: ${manifest.name}`);
      console.log(`  Version: ${manifest.version}`);
    } catch (error) {
      console.error(`✗ Invalid manifest: ${error.message}`);
      process.exit(1);
    }
  }

  showHelp() {
    console.log(`
TSVAI Plugin CLI

Usage: plugin-cli <command> [options]

Commands:
  list              List all available plugins
  run               Run a plugin command
  init              Initialize a new plugin
  validate          Validate plugin configuration
  help              Show this help message

Examples:
  plugin-cli list
  plugin-cli validate sample-plugin
  plugin-cli run sample-plugin analyze --text "Hello world"
  plugin-cli init my-new-plugin

For more information, visit: https://github.com/TSVAISolutions/tsvai-harness
    `);
  }

  getPluginDirectories() {
    return fs.readdirSync(this.pluginDir).filter(dir => {
      const fullPath = path.join(this.pluginDir, dir);
      return fs.statSync(fullPath).isDirectory() &&
             !['bin', 'scripts', 'hooks', 'docs', 'reference', 'examples'].includes(dir);
    });
  }
}

// Run CLI
const cli = new PluginCLI();
cli.execute(process.argv).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

module.exports = PluginCLI;
