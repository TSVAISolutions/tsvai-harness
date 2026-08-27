/**
 * Analytics Skill
 * Comprehensive data analysis, keyword extraction, sentiment analysis
 */

class AnalyticsSkill {
  constructor(config = {}) {
    this.config = {
      maxTextLength: config.maxTextLength || 50000,
      enableCache: config.enableCache !== false,
      cacheTTL: config.cacheTTL || 3600,
      ...config
    };
    this.cache = new Map();
  }

  async initialize() {
    console.log('[AnalyticsSkill] Initialized');
    return { success: true };
  }

  /**
   * Main analysis function
   * Performs comprehensive text analysis
   */
  async analyzeText(text, operations = ['wordCount', 'stats', 'keywords']) {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Text parameter is required and must be a string'
      };
    }

    if (text.length > this.config.maxTextLength) {
      return {
        success: false,
        error: `Text exceeds maximum length of ${this.config.maxTextLength}`
      };
    }

    try {
      const result = {
        success: true,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        textLength: text.length,
        timestamp: new Date().toISOString()
      };

      // Word count
      if (operations.includes('wordCount')) {
        result.wordCount = this._countWords(text);
        result.charCount = text.length;
      }

      // Statistics
      if (operations.includes('stats')) {
        result.stats = this._computeStats(text);
      }

      // Keywords
      if (operations.includes('keywords')) {
        result.keywords = this._extractKeywords(text, 10);
      }

      // Sentiment
      if (operations.includes('sentiment')) {
        result.sentiment = this._analyzeSentiment(text);
      }

      // Language metrics
      if (operations.includes('metrics')) {
        result.metrics = this._computeMetrics(text);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract keywords from text
   */
  async extractKeywords(text, topN = 5) {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Text parameter required'
      };
    }

    try {
      const keywords = this._extractKeywords(text, topN);
      return {
        success: true,
        count: keywords.length,
        topN,
        keywords
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Text parameter required'
      };
    }

    try {
      const sentiment = this._analyzeSentiment(text);
      return {
        success: true,
        ...sentiment,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getStats(text) {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Text parameter required'
      };
    }

    try {
      const stats = this._computeStats(text);
      return {
        success: true,
        ...stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate input
   */
  async validate(params) {
    if (!params.text || typeof params.text !== 'string') {
      return {
        valid: false,
        error: 'Text parameter is required'
      };
    }

    if (params.text.length > this.config.maxTextLength) {
      return {
        valid: false,
        error: `Text exceeds ${this.config.maxTextLength} characters`
      };
    }

    return { valid: true };
  }

  /**
   * Execute operation
   */
  async execute(operation, params) {
    switch (operation) {
      case 'analyzeText':
      case 'analyze':
        return this.analyzeText(params.text, params.operations);

      case 'extractKeywords':
      case 'keywords':
        return this.extractKeywords(params.text, params.topN);

      case 'analyzeSentiment':
      case 'sentiment':
        return this.analyzeSentiment(params.text);

      case 'getStats':
      case 'stats':
        return this.getStats(params.text);

      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }

  async shutdown() {
    this.cache.clear();
    console.log('[AnalyticsSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  /**
   * Count words in text
   */
  _countWords(text) {
    const words = text.trim().split(/\s+/);
    return words.filter(w => w.length > 0).length;
  }

  /**
   * Compute text statistics
   */
  _computeStats(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    const wordCount = words.length;
    const charCount = text.length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;

    const avgWordLength = wordCount > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / wordCount
      : 0;

    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgParagraphLength = paragraphCount > 0 ? wordCount / paragraphCount : 0;

    // Simple readability score (Flesch-Kincaid inspired)
    const readabilityScore = this._calculateReadability(
      wordCount,
      sentenceCount,
      words
    );

    return {
      wordCount,
      charCount,
      sentenceCount,
      paragraphCount,
      avgWordLength: Math.round(avgWordLength * 100) / 100,
      avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
      avgParagraphLength: Math.round(avgParagraphLength * 100) / 100,
      readabilityScore: Math.round(readabilityScore)
    };
  }

  /**
   * Extract keywords using frequency analysis
   */
  _extractKeywords(text, limit = 10) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
    ]);

    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Count frequencies
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sorted.map(([word, frequency]) => ({
      word,
      frequency,
      relevance: Math.round((frequency / words.length) * 10000) / 10000
    }));
  }

  /**
   * Analyze sentiment using simple scoring
   */
  _analyzeSentiment(text) {
    const positiveWords = {
      'good': 2, 'great': 3, 'excellent': 3, 'amazing': 3, 'wonderful': 3,
      'love': 2, 'like': 1, 'best': 2, 'better': 1, 'positive': 1,
      'happy': 2, 'beautiful': 2, 'brilliant': 2, 'fantastic': 3
    };

    const negativeWords = {
      'bad': 2, 'terrible': 3, 'awful': 3, 'horrible': 3, 'worst': 3,
      'hate': 2, 'dislike': 1, 'poor': 1, 'worse': 1, 'negative': 1,
      'sad': 2, 'ugly': 2, 'boring': 1, 'annoying': 2, 'disgusting': 3
    };

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\W+/);

    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords[word]) positiveScore += positiveWords[word];
      if (negativeWords[word]) negativeScore += negativeWords[word];
    });

    const total = positiveScore + negativeScore;
    let sentiment = 'neutral';
    let score = 0.5;
    let confidence = 0.5;

    if (total > 0) {
      score = positiveScore / total;
      confidence = Math.min(total / (words.length * 0.5), 1);

      if (score > 0.65) {
        sentiment = 'positive';
      } else if (score < 0.35) {
        sentiment = 'negative';
      } else {
        sentiment = 'neutral';
      }
    }

    return {
      sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      positiveScore,
      negativeScore
    };
  }

  /**
   * Calculate readability score
   */
  _calculateReadability(wordCount, sentenceCount, words) {
    if (wordCount === 0 || sentenceCount === 0) return 50;

    // Flesch-Kincaid Grade Level adaptation
    const avgSentenceLength = wordCount / sentenceCount;
    const avgSyllables = this._estimateAverageSyllables(words);

    const grade = (0.39 * avgSentenceLength) +
                  (11.8 * avgSyllables) -
                  15.59;

    // Convert to 0-100 score
    const score = Math.max(0, 100 - (grade * 10));
    return Math.min(100, Math.round(score));
  }

  /**
   * Estimate average syllables per word
   */
  _estimateAverageSyllables(words) {
    if (words.length === 0) return 1;

    let totalSyllables = 0;
    words.forEach(word => {
      totalSyllables += this._estimateSyllables(word);
    });

    return totalSyllables / words.length;
  }

  /**
   * Estimate syllables in a word (simple heuristic)
   */
  _estimateSyllables(word) {
    word = word.toLowerCase();
    let count = 0;

    // Count vowel groups
    let previousWasVowel = false;
    const vowels = 'aeiouy';

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Adjustments
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;

    return Math.max(1, count);
  }

  /**
   * Compute additional metrics
   */
  _computeMetrics(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

    return {
      uniqueWordCount: uniqueWords,
      lexicalDiversity: Math.round((uniqueWords / words.length) * 10000) / 10000,
      averageWordLength: Math.round(
        (text.length / words.length) * 100
      ) / 100
    };
  }

  getMetadata() {
    return {
      name: 'analytics',
      displayName: 'Analytics Skill',
      description: 'Comprehensive data analysis and insights generation',
      version: '1.0.0',
      capabilities: [
        'Text Analysis',
        'Keyword Extraction',
        'Sentiment Analysis',
        'Statistics Generation'
      ],
      operations: [
        'analyze',
        'keywords',
        'sentiment',
        'stats'
      ]
    };
  }
}

module.exports = AnalyticsSkill;
