/**
 * Analytics Skill Usage Example
 */

const AnalyticsSkill = require('./index');

async function example() {
  console.log('='.repeat(60));
  console.log('Analytics Skill - Usage Example');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Initialize skill
    const skill = new AnalyticsSkill();
    await skill.initialize();

    const sampleText = `
      The TSVAI platform provides comprehensive tools for data analysis and insights generation.
      It offers powerful capabilities for understanding text content, extracting keywords,
      and analyzing sentiment. The platform is designed to be flexible and scalable,
      supporting various analytical operations. Businesses can leverage these tools
      to gain deeper insights into their data and make better decisions.
    `;

    console.log('Sample Text:');
    console.log(`"${sampleText.trim()}"`);
    console.log('');

    // 1. Comprehensive Analysis
    console.log('1. COMPREHENSIVE TEXT ANALYSIS');
    console.log('-'.repeat(60));
    const analysis = await skill.analyzeText(sampleText, [
      'wordCount',
      'stats',
      'keywords',
      'sentiment',
      'metrics'
    ]);

    if (analysis.success) {
      console.log(`✓ Word Count: ${analysis.wordCount}`);
      console.log(`✓ Character Count: ${analysis.charCount}`);
      console.log('');

      console.log('Statistics:');
      console.log(`  - Average Word Length: ${analysis.stats.avgWordLength}`);
      console.log(`  - Sentence Count: ${analysis.stats.sentenceCount}`);
      console.log(`  - Avg Sentence Length: ${analysis.stats.avgSentenceLength}`);
      console.log(`  - Readability Score: ${analysis.stats.readabilityScore}/100`);
      console.log('');

      console.log('Top Keywords:');
      analysis.keywords.slice(0, 5).forEach((kw, i) => {
        console.log(`  ${i + 1}. "${kw.word}" (frequency: ${kw.frequency}, relevance: ${(kw.relevance * 100).toFixed(2)}%)`);
      });
      console.log('');

      console.log('Sentiment:');
      console.log(`  - Sentiment: ${analysis.sentiment}`);
      console.log(`  - Score: ${(analysis.sentiment.score * 100).toFixed(1)}%`);
      console.log(`  - Confidence: ${(analysis.sentiment.confidence * 100).toFixed(1)}%`);
    } else {
      console.log(`✗ Error: ${analysis.error}`);
    }

    // 2. Keyword Extraction
    console.log('\n2. KEYWORD EXTRACTION');
    console.log('-'.repeat(60));
    const keywords = await skill.extractKeywords(sampleText, 8);

    if (keywords.success) {
      console.log(`Found ${keywords.count} keywords (top ${keywords.topN}):`);
      keywords.keywords.forEach((kw, i) => {
        console.log(`  ${i + 1}. "${kw.word}"`);
        console.log(`     └─ Frequency: ${kw.frequency} | Relevance: ${(kw.relevance * 100).toFixed(2)}%`);
      });
    } else {
      console.log(`✗ Error: ${keywords.error}`);
    }

    // 3. Sentiment Analysis
    console.log('\n3. SENTIMENT ANALYSIS');
    console.log('-'.repeat(60));
    const sentiment = await skill.analyzeSentiment(sampleText);

    if (sentiment.success) {
      console.log(`Sentiment: ${sentiment.sentiment.toUpperCase()}`);
      console.log(`Score: ${(sentiment.score * 100).toFixed(1)}%`);
      console.log(`Confidence: ${(sentiment.confidence * 100).toFixed(1)}%`);
      console.log(`Positive Score: ${sentiment.positiveScore}`);
      console.log(`Negative Score: ${sentiment.negativeScore}`);
    } else {
      console.log(`✗ Error: ${sentiment.error}`);
    }

    // 4. Positive Text Analysis
    console.log('\n4. POSITIVE TEXT ANALYSIS');
    console.log('-'.repeat(60));
    const positiveText = 'This is amazing! I love this wonderful and excellent work!';
    const positiveSentiment = await skill.analyzeSentiment(positiveText);

    if (positiveSentiment.success) {
      console.log(`Text: "${positiveText}"`);
      console.log(`Sentiment: ${positiveSentiment.sentiment.toUpperCase()}`);
      console.log(`Score: ${(positiveSentiment.score * 100).toFixed(1)}%`);
    }

    // 5. Negative Text Analysis
    console.log('\n5. NEGATIVE TEXT ANALYSIS');
    console.log('-'.repeat(60));
    const negativeText = 'This is terrible! I hate this awful and horrible work!';
    const negativeSentiment = await skill.analyzeSentiment(negativeText);

    if (negativeSentiment.success) {
      console.log(`Text: "${negativeText}"`);
      console.log(`Sentiment: ${negativeSentiment.sentiment.toUpperCase()}`);
      console.log(`Score: ${(negativeSentiment.score * 100).toFixed(1)}%`);
    }

    // 6. Statistics
    console.log('\n6. DETAILED STATISTICS');
    console.log('-'.repeat(60));
    const stats = await skill.getStats(sampleText);

    if (stats.success) {
      console.log(`Word Count: ${stats.wordCount}`);
      console.log(`Character Count: ${stats.charCount}`);
      console.log(`Sentence Count: ${stats.sentenceCount}`);
      console.log(`Paragraph Count: ${stats.paragraphCount}`);
      console.log(`Average Word Length: ${stats.avgWordLength}`);
      console.log(`Average Sentence Length: ${stats.avgSentenceLength}`);
      console.log(`Average Paragraph Length: ${stats.avgParagraphLength}`);
      console.log(`Readability Score: ${stats.readabilityScore}/100`);
      console.log(`Unique Words: ${stats.uniqueWordCount}`);
      console.log(`Lexical Diversity: ${stats.lexicalDiversity.toFixed(4)}`);
    }

    // 7. Execute Operations
    console.log('\n7. OPERATION EXECUTION');
    console.log('-'.repeat(60));

    const operations = ['analyze', 'keywords', 'sentiment', 'stats'];
    for (const op of operations) {
      const result = await skill.execute(op, { text: 'Great product!' });
      console.log(`✓ ${op}: ${result.success ? 'Success' : 'Failed'}`);
    }

    // Shutdown
    await skill.shutdown();

    console.log('\n' + '='.repeat(60));
    console.log('Example complete!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  example().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = example;
