/**
 * Basic Example - Sample Plugin Usage
 * Demonstrates how to use the sample text analysis plugin
 */

const SamplePlugin = require('../src/index');
const PluginManager = require('../src/manager');

async function main() {
  console.log('='.repeat(60));
  console.log('TSVAI Sample Plugin - Text Analysis Demo');
  console.log('='.repeat(60));
  console.log();

  try {
    // 1. Create plugin instance
    console.log('1. Creating plugin instance...');
    const plugin = new SamplePlugin({
      maxTextLength: 10000,
      enableCache: true,
      cacheTTL: 3600
    });
    console.log('   ✓ Plugin created\n');

    // 2. Initialize plugin
    console.log('2. Initializing plugin...');
    const initResult = await plugin.initialize();
    console.log(`   ✓ ${initResult.message}\n`);

    // 3. Show plugin metadata
    console.log('3. Plugin Metadata:');
    const metadata = plugin.getMetadata();
    console.log(`   Name: ${metadata.name}`);
    console.log(`   Version: ${metadata.version}`);
    console.log(`   Capabilities: ${metadata.capabilities.join(', ')}`);
    console.log(`   Commands: ${metadata.commands.join(', ')}\n`);

    // Sample text for analysis
    const sampleText = `
      Artificial intelligence is revolutionizing the way we work and live.
      From healthcare to finance, machine learning algorithms are transforming industries.
      The potential of AI is limitless, but we must address ethical concerns and ensure
      responsible development. As we move forward, collaboration between technologists,
      policymakers, and society is essential for building a better future.
    `;

    // 4. Analyze text
    console.log('4. Analyzing Text...');
    console.log(`   Input: "${sampleText.trim().substring(0, 60)}..."\n`);

    const analysisResult = await plugin.execute('analyze', {
      text: sampleText,
      operations: ['wordCount', 'charCount', 'stats', 'keywords']
    });

    console.log('   Analysis Results:');
    console.log(`   ✓ Word Count: ${analysisResult.analysis.wordCount}`);
    console.log(`   ✓ Char Count: ${analysisResult.analysis.charCount}`);
    if (analysisResult.analysis.stats) {
      const stats = analysisResult.analysis.stats;
      console.log(`   ✓ Statistics:`);
      console.log(`      - Sentences: ${stats.sentenceCount}`);
      console.log(`      - Avg Word Length: ${stats.avgWordLength}`);
      console.log(`      - Readability Score: ${stats.readabilityScore}`);
    }
    console.log();

    // 5. Extract keywords
    console.log('5. Extracting Keywords...');
    const keywordResult = await plugin.execute('extractKeywords', {
      text: sampleText,
      topN: 5
    });

    console.log('   Top Keywords:');
    keywordResult.keywords.forEach((kw, i) => {
      console.log(`   ${i + 1}. "${kw.word}" (frequency: ${kw.frequency})`);
    });
    console.log();

    // 6. Sentiment analysis
    console.log('6. Analyzing Sentiment...');
    const sentimentResult = await plugin.execute('getSentiment', {
      text: sampleText
    });

    console.log(`   Sentiment: ${sentimentResult.sentiment.toUpperCase()}`);
    console.log(`   Score: ${sentimentResult.score}`);
    console.log(`   Confidence: ${(sentimentResult.confidence * 100).toFixed(1)}%`);
    console.log();

    // 7. Using Plugin Manager
    console.log('7. Using Plugin Manager...');
    const manager = new PluginManager();
    manager.register('textanalysis', plugin);

    console.log('   Registered Plugins:');
    const plugins = manager.listPlugins();
    plugins.forEach(p => {
      console.log(`   - ${p.name} (v${p.metadata.version})`);
    });
    console.log();

    // 8. Execute via manager
    console.log('8. Executing via Plugin Manager...');
    const managerResult = await manager.execute('textanalysis', 'getSentiment', {
      text: 'I absolutely love this amazing product! It is excellent!'
    });

    console.log(`   Result: ${managerResult.sentiment} (${managerResult.score})`);
    console.log();

    // 9. Shutdown
    console.log('9. Shutting down...');
    const shutdownResult = await plugin.shutdown();
    console.log(`   ✓ Plugin shutdown complete\n`);

    console.log('='.repeat(60));
    console.log('Demo completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the demo
main();
