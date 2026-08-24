#!/usr/bin/env node

/**
 * Plugin Build Script
 * Builds all plugins for distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PluginBuilder {
  constructor() {
    this.pluginDir = path.join(__dirname, '..');
    this.buildDir = path.join(this.pluginDir, 'dist');
  }

  async buildAll() {
    console.log('Building all plugins...\n');

    const plugins = this.getPlugins();
    if (plugins.length === 0) {
      console.log('No plugins found to build.');
      return;
    }

    for (const plugin of plugins) {
      await this.buildPlugin(plugin);
    }

    console.log('\n✓ All plugins built successfully');
  }

  async buildPlugin(pluginName) {
    const pluginPath = path.join(this.pluginDir, pluginName);
    const packageJsonPath = path.join(pluginPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`⊘ Skipping ${pluginName} (no package.json)`);
      return;
    }

    console.log(`Building ${pluginName}...`);

    try {
      // Install dependencies
      console.log(`  Installing dependencies...`);
      execSync('npm install', { cwd: pluginPath, stdio: 'pipe' });

      // Run build script if defined
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`  Running build script...`);
        execSync('npm run build', { cwd: pluginPath, stdio: 'pipe' });
      }

      // Copy to dist
      const outDir = path.join(this.buildDir, pluginName);
      if (fs.existsSync(outDir)) {
        execSync(`rm -rf ${outDir}`);
      }
      fs.mkdirSync(outDir, { recursive: true });

      // Copy files
      this.copyFiles(pluginPath, outDir, ['src', 'dist', 'package.json', '.claude-plugin']);

      console.log(`✓ ${pluginName} built successfully\n`);
    } catch (error) {
      console.error(`✗ Failed to build ${pluginName}: ${error.message}\n`);
      process.exit(1);
    }
  }

  copyFiles(src, dest, patterns) {
    patterns.forEach(pattern => {
      const srcPath = path.join(src, pattern);
      const destPath = path.join(dest, pattern);

      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          execSync(`cp -r ${srcPath} ${destPath}`, { stdio: 'pipe' });
        } else {
          execSync(`cp ${srcPath} ${destPath}`, { stdio: 'pipe' });
        }
      }
    });
  }

  getPlugins() {
    return fs.readdirSync(this.pluginDir).filter(dir => {
      const fullPath = path.join(this.pluginDir, dir);
      return fs.statSync(fullPath).isDirectory() &&
             !['bin', 'scripts', 'hooks', 'docs', 'reference', 'examples', 'dist'].includes(dir);
    });
  }
}

// Run builder
const builder = new PluginBuilder();
builder.buildAll().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});

module.exports = PluginBuilder;
