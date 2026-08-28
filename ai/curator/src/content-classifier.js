/**
 * Content Classifier
 * Classifies and tags content based on type, topic, and characteristics
 * Enables content routing and organization
 */

class ContentClassifier {
  constructor(config = {}) {
    this.config = {
      autoTag: config.autoTag !== false,
      minConfidence: config.minConfidence || 0.5,
      maxTags: config.maxTags || 10,
      ...config
    };

    this.categories = new Map(); // categoryId -> category definition
    this.classifications = [];
    this.categoryCounter = 0;
    this.taxonomies = new Map(); // taxonomy name -> terms
  }

  /**
   * Register a category
   */
  registerCategory(name, config = {}) {
    const categoryId = `category-${++this.categoryCounter}`;

    this.categories.set(categoryId, {
      id: categoryId,
      name,
      keywords: config.keywords || [],
      patterns: config.patterns || [],
      description: config.description || '',
      created: new Date().toISOString()
    });

    return { success: true, categoryId };
  }

  /**
   * Register a taxonomy
   */
  registerTaxonomy(name, terms) {
    this.taxonomies.set(name, terms);

    return { success: true, taxonomyName: name, termCount: terms.length };
  }

  /**
   * Classify content
   */
  classify(content, options = {}) {
    const str = typeof content === 'string' ? content : JSON.stringify(content);

    const classification = {
      id: `classification-${Date.now()}`,
      content: str.substring(0, 100),
      timestamp: new Date().toISOString(),
      categories: [],
      tags: [],
      topics: [],
      sentiment: this._analyzeSentiment(str),
      language: this._detectLanguage(str),
      complexity: this._calculateComplexity(str)
    };

    // Match categories
    for (const [categoryId, category] of this.categories.entries()) {
      const confidence = this._calculateCategoryConfidence(str, category);

      if (confidence >= this.config.minConfidence) {
        classification.categories.push({
          id: categoryId,
          name: category.name,
          confidence: Math.round(confidence * 100) / 100
        });
      }
    }

    // Auto-tag if enabled
    if (this.config.autoTag) {
      classification.tags = this._generateTags(str);
    }

    // Extract topics
    classification.topics = this._extractTopics(str);

    this.classifications.push(classification);

    return classification;
  }

  /**
   * Batch classify
   */
  classifyBatch(items, options = {}) {
    const results = items.map(item => this.classify(item, options));

    const categoryStats = new Map();

    results.forEach(result => {
      result.categories.forEach(cat => {
        categoryStats.set(cat.name, (categoryStats.get(cat.name) || 0) + 1);
      });
    });

    return {
      totalItems: items.length,
      results,
      categoryDistribution: Object.fromEntries(categoryStats)
    };
  }

  /**
   * Get classification statistics
   */
  getStatistics() {
    const classifications = this.classifications;

    if (classifications.length === 0) {
      return {
        totalClassifications: 0,
        averageSentiment: 0,
        categoryDistribution: {},
        topTags: [],
        complexityDistribution: {}
      };
    }

    const sentiments = classifications.map(c => c.sentiment);
    const avgSentiment = sentiments.reduce((a, b) => a + b) / sentiments.length;

    const categoryCount = new Map();
    const tagCount = new Map();
    const complexity = new Map();

    classifications.forEach(c => {
      c.categories.forEach(cat => {
        categoryCount.set(cat.name, (categoryCount.get(cat.name) || 0) + 1);
      });

      c.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });

      const complexityLevel = c.complexity > 0.7 ? 'high' : c.complexity > 0.4 ? 'medium' : 'low';

      complexity.set(complexityLevel, (complexity.get(complexityLevel) || 0) + 1);
    });

    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalClassifications: classifications.length,
      averageSentiment: Math.round(avgSentiment * 100) / 100,
      categoryDistribution: Object.fromEntries(categoryCount),
      topTags,
      complexityDistribution: Object.fromEntries(complexity),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get content by category
   */
  getByCategory(categoryName) {
    return this.classifications.filter(c =>
      c.categories.some(cat => cat.name === categoryName)
    );
  }

  /**
   * Get content by tag
   */
  getByTag(tag) {
    return this.classifications.filter(c => c.tags.includes(tag));
  }

  /**
   * Clear classifications
   */
  clear() {
    this.classifications = [];

    return { success: true };
  }

  // ============ Private Methods ============

  _calculateCategoryConfidence(content, category) {
    let confidence = 0;

    // Check keywords
    const keywordMatches = category.keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (keywordMatches > 0) {
      confidence += (keywordMatches / category.keywords.length) * 0.6;
    }

    // Check patterns
    const patternMatches = category.patterns.filter(pattern => {
      try {
        return new RegExp(pattern, 'i').test(content);
      } catch {
        return false;
      }
    }).length;

    if (patternMatches > 0) {
      confidence += (patternMatches / category.patterns.length) * 0.4;
    }

    return Math.min(confidence, 1.0);
  }

  _analyzeSentiment(content) {
    const lower = content.toLowerCase();

    const positive = (lower.match(/\b(good|great|excellent|amazing|wonderful|fantastic)\b/g) || []).length;
    const negative = (lower.match(/\b(bad|poor|terrible|awful|horrible|worst)\b/g) || []).length;

    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';

    return 'neutral';
  }

  _detectLanguage(content) {
    // Simplified language detection
    if (/[А-я]/.test(content)) return 'Russian';
    if (/[一-鿿]/.test(content)) return 'Chinese';
    if (/[؀-ۿ]/.test(content)) return 'Arabic';

    return 'English'; // Default
  }

  _calculateComplexity(content) {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const uniqueRatio = uniqueWords / words.length;

    // Complexity based on word length and variety
    const complexity = (avgWordLength / 10) * 0.5 + uniqueRatio * 0.5;

    return Math.min(complexity, 1.0);
  }

  _generateTags(content) {
    const tags = new Set();

    // Extract capitalized words (likely proper nouns)
    const words = content.split(/\s+/);

    words.forEach(word => {
      if (/^[A-Z][a-z]+/.test(word)) {
        tags.add(word.toLowerCase());
      }
    });

    // Add based on length
    if (content.length > 1000) tags.add('long-form');
    if (content.length < 100) tags.add('short-form');

    // Add based on content type
    if (content.includes('http')) tags.add('has-links');
    if (content.includes('@')) tags.add('has-mentions');

    return Array.from(tags).slice(0, this.config.maxTags);
  }

  _extractTopics(content) {
    const topics = new Set();

    // Check all registered taxonomies
    for (const [taxonomyName, terms] of this.taxonomies.entries()) {
      terms.forEach(term => {
        if (content.toLowerCase().includes(term.toLowerCase())) {
          topics.add(term);
        }
      });
    }

    return Array.from(topics);
  }
}

module.exports = ContentClassifier;
