/**
 * Text Analyzer Module
 * Core text analysis functionality
 */

class TextAnalyzer {
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 3600;
  }

  async analyze(params) {
    const { text, operations = ['wordCount', 'stats'] } = params;

    const results = {
      success: true,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      textLength: text.length,
      analysis: {}
    };

    for (const operation of operations) {
      switch (operation) {
        case 'wordCount':
          results.analysis.wordCount = this.getWordCount(text);
          break;
        case 'charCount':
          results.analysis.charCount = this.getCharCount(text);
          break;
        case 'stats':
          results.analysis.stats = this.getStats(text);
          break;
        case 'keywords':
          results.analysis.keywords = this.extractKeywords(text);
          break;
      }
    }

    return results;
  }

  async extractKeywords(params) {
    const { text, topN = 5 } = params;

    const words = this.tokenize(text);
    const filtered = this.filterStopWords(words);
    const frequencies = this.getFrequencies(filtered);

    const keywords = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, frequency]) => ({ word, frequency }));

    return {
      success: true,
      keywords,
      totalWords: words.length,
      uniqueWords: filtered.length
    };
  }

  async getSentiment(params) {
    const { text } = params;

    // Simple sentiment analysis based on keyword matching
    const sentimentScore = this.calculateSentiment(text);

    return {
      success: true,
      sentiment: sentimentScore.sentiment,
      score: sentimentScore.score,
      confidence: sentimentScore.confidence
    };
  }

  getStats(text) {
    const words = this.tokenize(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lines = text.split('\n').filter(l => l.trim().length > 0);

    return {
      wordCount: words.length,
      charCount: text.length,
      sentenceCount: sentences.length,
      lineCount: lines.length,
      avgWordLength: words.length > 0
        ? Math.round((text.length / words.length) * 100) / 100
        : 0,
      avgSentenceLength: sentences.length > 0
        ? Math.round((words.length / sentences.length) * 100) / 100
        : 0,
      readabilityScore: this.getReadabilityScore(text, words, sentences)
    };
  }

  // Private utility methods

  tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  filterStopWords(words) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it'
    ]);

    return words.filter(word => !stopWords.has(word) && word.length > 3);
  }

  getFrequencies(words) {
    const frequencies = {};
    words.forEach(word => {
      frequencies[word] = (frequencies[word] || 0) + 1;
    });
    return frequencies;
  }

  getWordCount(text) {
    return this.tokenize(text).length;
  }

  getCharCount(text) {
    return text.length;
  }

  calculateSentiment(text) {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'awesome',
      'love', 'happy', 'glad', 'best', 'beautiful', 'perfect'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'worst',
      'ugly', 'poor', 'disappointing', 'fail', 'broken'
    ];

    const words = this.tokenize(text);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    const score = total > 0 ? (positiveCount - negativeCount) / total : 0;

    let sentiment = 'neutral';
    if (score > 0.3) sentiment = 'positive';
    if (score < -0.3) sentiment = 'negative';

    return {
      sentiment,
      score: Math.round(score * 1000) / 1000,
      confidence: Math.min(total / 10, 1),
      positiveWords: positiveCount,
      negativeWords: negativeCount
    };
  }

  getReadabilityScore(text, words, sentences) {
    if (words.length === 0 || sentences.length === 0) return 0;

    // Flesch Reading Ease approximation
    const score = 206.835 -
      (1.015 * (words.length / sentences.length)) -
      (84.6 * (this.countSyllables(text) / words.length));

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  countSyllables(text) {
    const vowels = 'aeiouy';
    const words = this.tokenize(text);
    let syllableCount = 0;

    words.forEach(word => {
      let count = 0;
      let previousWasVowel = false;

      for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        if (isVowel && !previousWasVowel) {
          count++;
        }
        previousWasVowel = isVowel;
      }

      // Adjust for silent 'e'
      if (word.endsWith('e')) count--;
      if (word.endsWith('le')) count++;

      syllableCount += Math.max(1, count);
    });

    return syllableCount;
  }
}

module.exports = TextAnalyzer;
