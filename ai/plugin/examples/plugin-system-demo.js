/**
 * Plugin System Demo
 * Shows how to use the plugin system for skill discovery and execution
 */

const path = require('path');
const PluginSystem = require('../src/plugin-system');

async function demo() {
  console.log('='.repeat(60));
  console.log('TSVAI Plugin System Demo');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Create plugin system
    console.log('1. Creating plugin system...');
    const system = new PluginSystem({
      skillsDir: path.join(__dirname, '../skills'),
      debug: true
    });

    // 2. Initialize
    console.log('\n2. Initializing...');
    const initResult = await system.initialize();
    console.log(`   ✓ Initialized: ${initResult.systemStatus.mcp.toolCount} tools registered`);

    // 3. Get skill registry
    console.log('\n3. Skill Registry:');
    const registry = system.getRegistrySummary();
    console.log(`   Total skills: ${registry.totalSkills}`);
    console.log(`   Categories: ${registry.categories.join(', ')}`);
    console.log(`   Category breakdown:`);
    Object.entries(registry.categoryCounts).forEach(([cat, count]) => {
      console.log(`     - ${cat}: ${count} skills`);
    });

    // 4. List all skills
    console.log('\n4. Available Skills:');
    const allSkills = system.getSkillRegistry();
    allSkills.slice(0, 5).forEach(skill => {
      console.log(`   - ${skill.id}`);
      console.log(`     Name: ${skill.displayName}`);
      console.log(`     Description: ${skill.description.substring(0, 60)}...`);
      console.log(`     Capabilities: ${skill.capabilities.join(', ')}`);
    });
    if (allSkills.length > 5) {
      console.log(`   ... and ${allSkills.length - 5} more`);
    }

    // 5. Search for skills
    console.log('\n5. Searching for skills (query: "analysis"):');
    const searchResults = system.searchSkills('analysis');
    searchResults.slice(0, 3).forEach(({ skillId, skill, score }) => {
      console.log(`   - ${skillId} (score: ${score})`);
      console.log(`     ${skill.description.substring(0, 50)}...`);
    });

    // 6. Get skills by category
    console.log('\n6. Skills by Category (analytics):');
    const analyticSkills = system.getSkillsByCategory('analytics');
    analyticSkills.forEach(skill => {
      console.log(`   - ${skill.name}: ${skill.description.substring(0, 40)}...`);
    });

    // 7. Get MCP tools
    console.log('\n7. MCP Tools (for Claude):');
    const tools = system.getMcpTools();
    console.log(`   Available: ${tools.length} tools`);
    tools.slice(0, 3).forEach(tool => {
      console.log(`   - ${tool.name}`);
      console.log(`     Description: ${tool.description}`);
    });

    // 8. Get detailed skill info
    console.log('\n8. Detailed Skill Info (analytics:analytics):');
    const skillInfo = system.getSkillInfo('analytics:analytics');
    if (skillInfo) {
      console.log(`   Name: ${skillInfo.displayName}`);
      console.log(`   Category: ${skillInfo.category}`);
      console.log(`   Version: ${skillInfo.version}`);
      console.log(`   Capabilities:`);
      skillInfo.capabilities.forEach(cap => {
        console.log(`     - ${cap}`);
      });
    } else {
      console.log('   Skill not found');
    }

    // 9. Try executing a tool (will fail if module not implemented)
    console.log('\n9. Attempting Tool Execution:');
    console.log('   Calling: analytics_analytics with operation "analyze"');
    const execResult = await system.executeTool('analytics_analytics', {
      operation: 'analyze',
      params: { text: 'Hello world' }
    });
    console.log(`   Result:`, execResult);

    // 10. System status
    console.log('\n10. Final System Status:');
    const status = system.getStatus();
    console.log(`   Initialized: ${status.initialized}`);
    console.log(`   MCP Tools: ${status.mcp.toolCount}`);
    console.log(`   Total Skills: ${status.registry.totalSkills}`);

    // Shutdown
    console.log('\n11. Shutting down...');
    await system.shutdown();
    console.log('   ✓ Shutdown complete');

    console.log('\n' + '='.repeat(60));
    console.log('Demo complete!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run demo
if (require.main === module) {
  demo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = demo;
