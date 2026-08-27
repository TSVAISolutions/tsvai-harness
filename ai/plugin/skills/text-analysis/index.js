/**
 * Text Analysis Skill
 * Advanced text processing, parsing, and pattern detection
 */

class TextAnalysisSkill {
  constructor(config = {}) {
    this.config = {
      maxTextLength: config.maxTextLength || 100000,
      ...config
    };
  }

  async initialize() {
    console.log('[TextAnalysisSkill] Initialized');
    return { success: true };
  }

  /**
   * Parse text into sentences
   */
  async parseIntoSentences(text) {
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      return {
        success: true,
        sentenceCount: sentences.length,
        sentences: sentences.map((s, i) => ({
          index: i,
          text: s,
          length: s.length,
          wordCount: s.split(/\s+/).filter(w => w.length > 0).length
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse text into paragraphs
   */
  async parseParagraphs(text) {
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const paragraphs = text
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      return {
        success: true,
        paragraphCount: paragraphs.length,
        paragraphs: paragraphs.map((p, i) => ({
          index: i,
          text: p,
          length: p.length,
          sentenceCount: (p.match(/[.!?]/g) || []).length,
          wordCount: p.split(/\s+/).filter(w => w.length > 0).length
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract unique words
   */
  async extractWords(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const caseSensitive = options.caseSensitive || false;
      const minLength = options.minLength || 1;

      let words = text.split(/\W+/).filter(w => w.length >= minLength);

      if (!caseSensitive) {
        words = words.map(w => w.toLowerCase());
      }

      const unique = [...new Set(words)].sort();

      return {
        success: true,
        totalWords: words.length,
        uniqueWords: unique.length,
        words: unique,
        wordFrequency: this._calculateFrequency(words, caseSensitive)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect patterns in text
   */
  async detectPatterns(text) {
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const patterns = {
        emails: this._findEmails(text),
        urls: this._findUrls(text),
        numbers: this._findNumbers(text),
        dates: this._findDates(text),
        hashtags: this._findHashtags(text),
        mentions: this._findMentions(text)
      };

      return {
        success: true,
        patterns
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Find text spans between delimiters
   */
  async extractBetweenDelimiters(text, startDelimiter, endDelimiter) {
    if (!text) {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const regex = new RegExp(
        this._escapeRegex(startDelimiter) + '(.*?)' + this._escapeRegex(endDelimiter),
        'gs'
      );

      const matches = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          fullMatch: match[0],
          content: match[1],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }

      return {
        success: true,
        delimiter: { start: startDelimiter, end: endDelimiter },
        matchCount: matches.length,
        matches
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Replace text patterns
   */
  async replacePatternsWithin(text, startDelimiter, endDelimiter, replacementFn) {
    if (!text) {
      return { success: false, error: 'Text parameter required' };
    }

    try {
      const regex = new RegExp(
        this._escapeRegex(startDelimiter) + '(.*?)' + this._escapeRegex(endDelimiter),
        'gs'
      );

      const result = text.replace(regex, (match, content) => {
        if (typeof replacementFn === 'function') {
          return replacementFn(match, content);
        }
        return match;
      });

      return {
        success: true,
        originalLength: text.length,
        resultLength: result.length,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Find similar sentences
   */
  async findSimilarSentences(text, referenceText, threshold = 0.7) {
    if (!text || !referenceText) {
      return { success: false, error: 'Text and referenceText required' };
    }

    try {
      const textSentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
      const refSentences = referenceText.split(/[.!?]+/).map(s => s.trim()).filter(s => s);

      const similar = [];

      for (let i = 0; i < textSentences.length; i++) {
        for (let j = 0; j < refSentences.length; j++) {
          const similarity = this._calculateSimilarity(textSentences[i], refSentences[j]);
          if (similarity >= threshold) {
            similar.push({
              textSentence: textSentences[i],
              referencesentence: refSentences[j],
              similarity: Math.round(similarity * 1000) / 1000
            });
          }
        }
      }

      return {
        success: true,
        threshold,
        similarCount: similar.length,
        similar: similar.sort((a, b) => b.similarity - a.similarity)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute operation
   */
  async execute(operation, params) {
    switch (operation) {
      case 'parseSentences':
      case 'sentences':
        return this.parseIntoSentences(params.text);

      case 'parseParagraphs':
      case 'paragraphs':
        return this.parseParagraphs(params.text);

      case 'extractWords':
      case 'words':
        return this.extractWords(params.text, params.options);

      case 'detectPatterns':
      case 'patterns':
        return this.detectPatterns(params.text);

      case 'extractBetween':
        return this.extractBetweenDelimiters(
          params.text,
          params.startDelimiter,
          params.endDelimiter
        );

      case 'findSimilar':
        return this.findSimilarSentences(
          params.text,
          params.referenceText,
          params.threshold
        );

      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }

  async validate(params) {
    if (!params.text || typeof params.text !== 'string') {
      return { valid: false, error: 'Text parameter is required' };
    }

    if (params.text.length > this.config.maxTextLength) {
      return {
        valid: false,
        error: `Text exceeds maximum length of ${this.config.maxTextLength}`
      };
    }

    return { valid: true };
  }

  async shutdown() {
    console.log('[TextAnalysisSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _findEmails(text) {
    const regex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    return (text.match(regex) || []).map((email, i) => ({
      index: i,
      value: email,
      position: text.indexOf(email)
    }));
  }

  _findUrls(text) {
    const regex = /https?:\/\/[^\s]+/g;
    return (text.match(regex) || []).map((url, i) => ({
      index: i,
      value: url,
      position: text.indexOf(url)
    }));
  }

  _findNumbers(text) {
    const regex = /\b\d+(?:\.\d+)?\b/g;
    return (text.match(regex) || []).map((num, i) => ({
      index: i,
      value: parseFloat(num),
      position: text.indexOf(num)
    }));
  }

  _findDates(text) {
    const regex = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g;
    return (text.match(regex) || []).map((date, i) => ({
      index: i,
      value: date,
      position: text.indexOf(date)
    }));
  }

  _findHashtags(text) {
    const regex = /#\w+/g;
    return (text.match(regex) || []).map((tag, i) => ({
      index: i,
      value: tag,
      position: text.indexOf(tag)
    }));
  }

  _findMentions(text) {
    const regex = /@\w+/g;
    return (text.match(regex) || []).map((mention, i) => ({
      index: i,
      value: mention,
      position: text.indexOf(mention)
    }));
  }

  _calculateFrequency(words, caseSensitive = false) {
    const freq = {};
    words.forEach(word => {
      const key = caseSensitive ? word : word.toLowerCase();
      freq[key] = (freq[key] || 0) + 1;
    });

    return Object.entries(freq)
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  _calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    const editDistance = this._levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  _levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getMetadata() {
    return {
      name: 'text-analysis',
      displayName: 'Text Analysis Skill',
      description: 'Advanced text processing, parsing, and pattern detection',
      version: '1.0.0',
      capabilities: [
        'Sentence Parsing',
        'Paragraph Parsing',
        'Word Extraction',
        'Pattern Detection',
        'Text Comparison',
        'Delimiter Extraction'
      ],
      operations: [
        'sentences',
        'paragraphs',
        'words',
        'patterns',
        'extractBetween',
        'findSimilar'
      ]
    };
  }
}

module.exports = TextAnalysisSkill;
