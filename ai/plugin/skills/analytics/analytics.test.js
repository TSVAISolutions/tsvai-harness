/**
 * Analytics Skill Tests
 */

const AnalyticsSkill = require('./index');

describe('AnalyticsSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new AnalyticsSkill();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const result = await skill.initialize();
      expect(result.success).toBe(true);
    });

    it('should have correct metadata', () => {
      const meta = skill.getMetadata();
      expect(meta.name).toBe('analytics');
      expect(meta.capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeText', () => {
    const sampleText = 'This is a great test. The analytics skill is working perfectly!';

    it('should analyze text successfully', async () => {
      const result = await skill.analyzeText(sampleText);
      expect(result.success).toBe(true);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.stats).toBeDefined();
    });

    it('should count words correctly', async () => {
      const result = await skill.analyzeText(sampleText);
      expect(result.wordCount).toBe(11);
    });

    it('should compute statistics', async () => {
      const result = await skill.analyzeText(sampleText);
      expect(result.stats.charCount).toBeGreaterThan(0);
      expect(result.stats.avgWordLength).toBeGreaterThan(0);
      expect(result.stats.readabilityScore).toBeGreaterThanOrEqual(0);
    });

    it('should extract keywords', async () => {
      const result = await skill.analyzeText(sampleText);
      expect(result.keywords).toBeDefined();
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords[0].word).toBeDefined();
      expect(result.keywords[0].frequency).toBeGreaterThan(0);
    });

    it('should reject empty text', async () => {
      const result = await skill.analyzeText('');
      expect(result.success).toBe(false);
    });

    it('should respect operations parameter', async () => {
      const result = await skill.analyzeText(sampleText, ['wordCount']);
      expect(result.wordCount).toBeDefined();
      expect(result.stats).toBeUndefined();
    });

    it('should handle text exceeding max length', async () => {
      const longText = 'word '.repeat(100000);
      const result = await skill.analyzeText(longText);
      expect(result.success).toBe(false);
    });
  });

  describe('extractKeywords', () => {
    const sampleText = 'apple apple banana banana banana cherry cherry cherry cherry';

    it('should extract keywords', async () => {
      const result = await skill.extractKeywords(sampleText, 3);
      expect(result.success).toBe(true);
      expect(result.keywords.length).toBeLessThanOrEqual(3);
    });

    it('should rank by frequency', async () => {
      const result = await skill.extractKeywords(sampleText, 10);
      expect(result.keywords[0].frequency).toBeGreaterThanOrEqual(result.keywords[1].frequency);
    });

    it('should calculate relevance', async () => {
      const result = await skill.extractKeywords(sampleText);
      result.keywords.forEach(kw => {
        expect(kw.relevance).toBeGreaterThan(0);
        expect(kw.relevance).toBeLessThanOrEqual(1);
      });
    });

    it('should reject empty text', async () => {
      const result = await skill.extractKeywords('');
      expect(result.success).toBe(false);
    });
  });

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', async () => {
      const result = await skill.analyzeSentiment('This is amazing and wonderful!');
      expect(result.success).toBe(true);
      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('should detect negative sentiment', async () => {
      const result = await skill.analyzeSentiment('This is terrible and awful!');
      expect(result.success).toBe(true);
      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(0.5);
    });

    it('should detect neutral sentiment', async () => {
      const result = await skill.analyzeSentiment('The cat sat on the mat.');
      expect(result.success).toBe(true);
      expect(result.sentiment).toBe('neutral');
    });

    it('should provide confidence score', async () => {
      const result = await skill.analyzeSentiment('This is good');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should reject empty text', async () => {
      const result = await skill.analyzeSentiment('');
      expect(result.success).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return detailed statistics', async () => {
      const text = 'One. Two. Three.';
      const result = await skill.getStats(text);
      expect(result.success).toBe(true);
      expect(result.wordCount).toBe(3);
      expect(result.sentenceCount).toBe(3);
    });

    it('should calculate sentence count', async () => {
      const text = 'First sentence. Second sentence!';
      const result = await skill.getStats(text);
      expect(result.sentenceCount).toBe(2);
    });
  });

  describe('execute', () => {
    const testText = 'Great test text!';

    it('should execute analyze operation', async () => {
      const result = await skill.execute('analyze', { text: testText });
      expect(result.success).toBe(true);
    });

    it('should execute keywords operation', async () => {
      const result = await skill.execute('keywords', { text: testText });
      expect(result.success).toBe(true);
    });

    it('should execute sentiment operation', async () => {
      const result = await skill.execute('sentiment', { text: testText });
      expect(result.success).toBe(true);
    });

    it('should execute stats operation', async () => {
      const result = await skill.execute('stats', { text: testText });
      expect(result.success).toBe(true);
    });

    it('should reject unknown operation', async () => {
      const result = await skill.execute('unknown', { text: testText });
      expect(result.success).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate text parameter', async () => {
      const result = await skill.validate({ text: 'valid text' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing text', async () => {
      const result = await skill.validate({});
      expect(result.valid).toBe(false);
    });

    it('should reject non-string text', async () => {
      const result = await skill.validate({ text: 123 });
      expect(result.valid).toBe(false);
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await skill.shutdown();
      expect(skill.cache.size).toBe(0);
    });
  });

  describe('readability scoring', () => {
    it('should score simple text high', async () => {
      const simple = 'I like cats. Cats are good.';
      const result = await skill.getStats(simple);
      expect(result.readabilityScore).toBeGreaterThan(50);
    });

    it('should score complex text lower', async () => {
      const complex = 'The multifaceted implementation of sophisticated algorithms necessitates meticulous consideration.';
      const result = await skill.getStats(complex);
      expect(result.readabilityScore).toBeLessThan(100);
    });
  });

  describe('edge cases', () => {
    it('should handle single word', async () => {
      const result = await skill.analyzeText('word');
      expect(result.success).toBe(true);
      expect(result.wordCount).toBe(1);
    });

    it('should handle text with numbers', async () => {
      const result = await skill.analyzeText('The year 2026 is here');
      expect(result.success).toBe(true);
      expect(result.wordCount).toBe(5);
    });

    it('should handle special characters', async () => {
      const result = await skill.analyzeText('Hello! @#$% World?');
      expect(result.success).toBe(true);
    });

    it('should handle unicode', async () => {
      const result = await skill.analyzeText('Héllo wörld 你好');
      expect(result.success).toBe(true);
    });

    it('should handle very long sentences', async () => {
      const longSentence = 'word '.repeat(1000) + '.';
      const result = await skill.analyzeText(longSentence);
      expect(result.success).toBe(true);
    });
  });
});
