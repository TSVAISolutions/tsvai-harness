/**
 * NLP Processing Skill
 * Tokenization, entity recognition, language detection
 */

class NLPProcessingSkill {
  constructor(config = {}) {
    this.config = config;
  }

  async initialize() {
    console.log('[NLPProcessingSkill] Initialized');
    return { success: true };
  }

  /**
   * Tokenize text into words
   */
  async tokenize(text) {
    try {
      const tokens = text
        .split(/\s+/)
        .filter(t => t.length > 0)
        .map((token, i) => ({
          index: i,
          value: token,
          length: token.length
        }));

      return {
        success: true,
        tokenCount: tokens.length,
        tokens
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Named Entity Recognition (simple)
   */
  async extractEntities(text) {
    try {
      const entities = {
        names: this._findProperNouns(text),
        organizations: this._findOrganizations(text),
        locations: this._findLocations(text),
        numbers: this._findNumbers(text)
      };

      const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);

      return {
        success: true,
        totalEntities,
        entities
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect language
   */
  async detectLanguage(text) {
    try {
      const language = this._detectLanguage(text);
      const confidence = this._calculateLanguageConfidence(text, language);

      return {
        success: true,
        language,
        confidence: Math.round(confidence * 100) / 100,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Part-of-speech tagging (simple)
   */
  async tagPOS(text) {
    try {
      const words = text.split(/\s+/);
      const tags = words.map(word => ({
        word,
        pos: this._getPOS(word),
        confidence: 0.7
      }));

      return {
        success: true,
        wordCount: words.length,
        tags
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract noun phrases
   */
  async extractNounPhrases(text) {
    try {
      const phrases = this._extractNounPhrases(text);

      return {
        success: true,
        phraseCount: phrases.length,
        phrases
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'tokenize':
        return this.tokenize(params.text);
      case 'entities':
        return this.extractEntities(params.text);
      case 'language':
        return this.detectLanguage(params.text);
      case 'pos':
      case 'tagging':
        return this.tagPOS(params.text);
      case 'nounPhrases':
        return this.extractNounPhrases(params.text);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  async validate(params) {
    if (!params.text || typeof params.text !== 'string') {
      return { valid: false, error: 'Text parameter is required' };
    }
    return { valid: true };
  }

  async shutdown() {
    console.log('[NLPProcessingSkill] Shutdown complete');
  }

  // ============ Private Methods ============

  _findProperNouns(text) {
    const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
    return [...new Set(words)];
  }

  _findOrganizations(text) {
    const patterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|Ltd|LLC|Co|Inc|Company|Group))\b/g,
      /\b(?:Google|Microsoft|Apple|Amazon|Facebook|Twitter|Meta|Tesla|OpenAI)\b/gi
    ];

    const orgs = [];
    patterns.forEach(pattern => {
      orgs.push(...(text.match(pattern) || []));
    });

    return [...new Set(orgs)];
  }

  _findLocations(text) {
    const patterns = [
      /\b(?:New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Indianapolis|Charlotte|San Francisco|Seattle|Denver|Washington|Memphis|Boston|Nashville|Baltimore|Louisville|Portland|Las Vegas|Milwaukee|Albuquerque|Tucson)\b/gi,
      /\b(?:USA|United States|Canada|Mexico|UK|England|France|Germany|Spain|Italy|Japan|China|India|Brazil|Australia|New Zealand)\b/gi
    ];

    const locations = [];
    patterns.forEach(pattern => {
      locations.push(...(text.match(pattern) || []));
    });

    return [...new Set(locations)];
  }

  _findNumbers(text) {
    const numbers = text.match(/\d+(?:\.\d+)?/g) || [];
    return numbers.map(n => parseFloat(n));
  }

  _detectLanguage(text) {
    const englishWords = ['the', 'a', 'is', 'and', 'to', 'in', 'of', 'for', 'on', 'with'];
    const spanishWords = ['el', 'la', 'es', 'y', 'a', 'en', 'de', 'para', 'con', 'que'];
    const frenchWords = ['le', 'la', 'est', 'et', 'a', 'en', 'de', 'pour', 'avec', 'que'];

    const lower = text.toLowerCase();
    let englishCount = 0, spanishCount = 0, frenchCount = 0;

    englishWords.forEach(w => {
      englishCount += (lower.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
    });

    spanishWords.forEach(w => {
      spanishCount += (lower.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
    });

    frenchWords.forEach(w => {
      frenchCount += (lower.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
    });

    if (englishCount > spanishCount && englishCount > frenchCount) return 'English';
    if (spanishCount > frenchCount) return 'Spanish';
    if (frenchCount > 0) return 'French';
    return 'Unknown';
  }

  _calculateLanguageConfidence(text, language) {
    const wordCount = text.split(/\s+/).length;
    const matchCount = text.match(new RegExp(`\\b(?:the|a|is|and|to|in)\\b`, 'gi'))?.length || 0;

    if (wordCount === 0) return 0;
    return Math.min(matchCount / (wordCount * 0.1), 1);
  }

  _getPOS(word) {
    const articles = ['a', 'an', 'the'];
    const prepositions = ['in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const commonVerbs = ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'go', 'goes', 'make', 'makes'];

    const lower = word.toLowerCase();

    if (articles.includes(lower)) return 'DET';
    if (prepositions.includes(lower)) return 'ADP';
    if (commonVerbs.includes(lower)) return 'VERB';
    if (word[0] === word[0].toUpperCase()) return 'PROPN';
    if (word.endsWith('ing')) return 'VERB';
    if (word.endsWith('ed')) return 'VERB';
    if (word.endsWith('ly')) return 'ADV';

    return 'NOUN';
  }

  _extractNounPhrases(text) {
    const sentences = text.split(/[.!?]+/);
    const phrases = [];

    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      let currentPhrase = '';

      words.forEach((word, i) => {
        const pos = this._getPOS(word);

        if (pos === 'NOUN' || pos === 'PROPN' || pos === 'ADJ') {
          currentPhrase += (currentPhrase ? ' ' : '') + word;
        } else {
          if (currentPhrase) {
            phrases.push(currentPhrase.trim());
            currentPhrase = '';
          }
        }
      });

      if (currentPhrase) {
        phrases.push(currentPhrase.trim());
      }
    });

    return [...new Set(phrases)];
  }

  getMetadata() {
    return {
      name: 'nlp-processing',
      displayName: 'NLP Processing Skill',
      description: 'Natural language processing with tokenization and entity recognition',
      version: '1.0.0',
      capabilities: [
        'Tokenization',
        'Named Entity Recognition',
        'Language Detection',
        'Part-of-Speech Tagging',
        'Noun Phrase Extraction'
      ],
      operations: ['tokenize', 'entities', 'language', 'pos', 'nounPhrases']
    };
  }
}

module.exports = NLPProcessingSkill;
