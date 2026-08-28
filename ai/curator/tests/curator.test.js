/**
 * Curator Tests
 * Tests for quality validation, filtering, and classification
 */

const Curator = require('../src/curator');
const QualityValidator = require('../src/quality-validator');
const FilterEngine = require('../src/filter-engine');
const ContentClassifier = require('../src/content-classifier');

describe('QualityValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new QualityValidator();
  });

  describe('Quality Validation', () => {
    it('validates content quality', () => {
      const result = validator.validate('This is a quality piece of content with substantial information');

      expect(result.passed).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it('checks completeness', () => {
      const result = validator.validate('x');

      expect(result.dimensions.completeness).toBeDefined();
      expect(result.dimensions.completeness.score).toBeLessThan(0.5);
    });

    it('checks consistency', () => {
      const result = validator.validate({ a: 'string', b: 123, c: true });

      expect(result.dimensions.consistency).toBeDefined();
    });

    it('checks accuracy', () => {
      const result = validator.validate('This content has TODO items and undefined values');

      expect(result.dimensions.accuracy.issues.length).toBeGreaterThan(0);
    });

    it('detects content issues', () => {
      const result = validator.validate('');

      expect(result.dimensions.completeness.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Rules', () => {
    it('registers validation rules', () => {
      const result = validator.registerRule('hasNumbers', (content) => /[0-9]/.test(content));

      expect(result.success).toBe(true);
    });

    it('validates against custom rules', () => {
      validator.registerRule('numeric', (c) => /[0-9]/.test(c));

      const result = validator.validate('Text with 123 numbers');

      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('provides validation statistics', () => {
      validator.validate('Test content 1');
      validator.validate('Test content 2');

      const stats = validator.getStatistics();

      expect(stats.totalValidations).toBe(2);
      expect(stats.averageQualityScore).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('FilterEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new FilterEngine();
  });

  describe('Blocklist Filtering', () => {
    it('blocks terms on blocklist', () => {
      engine.addToBlocklist(['spam', 'inappropriate']);

      const result = engine.filter('This content contains spam');

      expect(result.filtered).toBe(true);
    });

    it('tracks blocklist matches', () => {
      engine.addToBlocklist('blocked_term');

      engine.filter('This contains blocked_term');

      const stats = engine.getStatistics();

      expect(stats.blocklistSize).toBe(1);
    });
  });

  describe('Allowlist Filtering', () => {
    it('allows terms on allowlist', () => {
      engine.addToAllowlist('approved');

      const result = engine.filter('This is approved', { useAllowlist: true });

      expect(result.filtered).toBe(false);
    });

    it('blocks content not on allowlist', () => {
      engine.addToAllowlist('approved');

      const result = engine.filter('This is not approved', { useAllowlist: true });

      expect(result.filtered).toBe(true);
    });
  });

  describe('Spam Detection', () => {
    it('detects spam patterns', () => {
      const result = engine.filter('CLICK HERE!!! BUY NOW!!! https://spam.com');

      expect(result.scores.spam).toBeGreaterThan(0);
    });

    it('flags high spam scores', () => {
      const result = engine.filter('aaaaaaa AAAAA!!!!! https://x.com https://y.com');

      expect(result.filtered).toBe(true);
    });
  });

  describe('Noise Detection', () => {
    it('detects noise patterns', () => {
      const result = engine.filter('xyz abc qwerty');

      expect(result.scores.noise).toBeDefined();
    });
  });

  describe('Custom Filters', () => {
    it('registers custom filters', () => {
      const result = engine.registerFilter('noNumbers', (c) => /[0-9]/.test(c));

      expect(result.success).toBe(true);
    });

    it('applies custom filters', () => {
      engine.registerFilter('requiresEmail', (c) => !c.includes('@'));

      const result = engine.filter('Content without email');

      expect(result.filtered).toBe(true);
    });
  });

  describe('Policy Enforcement', () => {
    it('registers policies', () => {
      const result = engine.registerPolicy('minLength', (c) => c.length > 10);

      expect(result.success).toBe(true);
    });

    it('enforces policies', () => {
      engine.registerPolicy('minWords', (c) => c.split(' ').length >= 3);

      const result = engine.filter('One two');

      expect(result.filtered).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('provides filter statistics', () => {
      engine.filter('test content');

      const stats = engine.getStatistics();

      expect(stats.totalFiltered).toBeGreaterThan(0);
      expect(stats.filterRate).toBeDefined();
    });
  });
});

describe('ContentClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new ContentClassifier();
  });

  describe('Category Registration', () => {
    it('registers categories', () => {
      const result = classifier.registerCategory('Technology', {
        keywords: ['software', 'code', 'programming'],
        patterns: ['tech.*']
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Classification', () => {
    it('classifies content', () => {
      classifier.registerCategory('Programming', {
        keywords: ['code', 'programming', 'software'],
        patterns: ['coding.*']
      });

      const result = classifier.classify('This is about programming and coding');

      expect(result.categories).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.complexity).toBeDefined();
    });

    it('detects sentiment', () => {
      const result = classifier.classify('This is great and wonderful');

      expect(result.sentiment).toBe('positive');
    });

    it('calculates complexity', () => {
      const result = classifier.classify('Short text');

      expect(result.complexity).toBeGreaterThanOrEqual(0);
      expect(result.complexity).toBeLessThanOrEqual(1);
    });
  });

  describe('Taxonomies', () => {
    it('registers taxonomies', () => {
      const result = classifier.registerTaxonomy('programming-languages', ['Python', 'JavaScript', 'Java']);

      expect(result.success).toBe(true);
    });

    it('extracts topics from taxonomy', () => {
      classifier.registerTaxonomy('languages', ['Python', 'JavaScript']);

      const result = classifier.classify('I use Python and JavaScript');

      expect(result.topics.length).toBeGreaterThan(0);
    });
  });

  describe('Tagging', () => {
    it('auto-tags content', () => {
      const result = classifier.classify('This contains http://example.com link');

      expect(result.tags.includes('has-links')).toBe(true);
    });

    it('tags by length', () => {
      const result = classifier.classify('x');

      expect(result.tags.includes('short-form')).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('provides classification statistics', () => {
      classifier.classify('Test content 1');
      classifier.classify('Test content 2');

      const stats = classifier.getStatistics();

      expect(stats.totalClassifications).toBe(2);
      expect(stats.topTags).toBeDefined();
    });
  });
});

describe('Curator', () => {
  let curator;

  beforeEach(() => {
    curator = new Curator();
  });

  describe('Content Curation', () => {
    it('curates content', () => {
      const result = curator.curate('This is quality content that should pass curation');

      expect(result.accepted).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('runs full curation pipeline', () => {
      const result = curator.curate('High quality content for review');

      expect(result.validation).toBeDefined();
      expect(result.filtering).toBeDefined();
      expect(result.classification).toBeDefined();
    });

    it('rejects low-quality content', () => {
      const result = curator.curate('');

      expect(result.accepted).toBe(false);
    });

    it('calculates curation score', () => {
      const result = curator.curate('This is test content with information');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });

  describe('Batch Curation', () => {
    it('curates multiple items', () => {
      const items = [
        'Quality content 1',
        'Quality content 2',
        ''
      ];

      const result = curator.curateBatch(items);

      expect(result.totalItems).toBe(3);
      expect(result.acceptedItems).toBeGreaterThanOrEqual(0);
    });

    it('calculates acceptance rate', () => {
      const result = curator.curateBatch(['Good content', 'Good content']);

      expect(result.acceptanceRate).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('registers validation rules', () => {
      const result = curator.registerRule('test', (c) => c.length > 5);

      expect(result.success).toBe(true);
    });

    it('registers filters', () => {
      const result = curator.registerFilter('spam', (c) => c.includes('SPAM'));

      expect(result.success).toBe(true);
    });

    it('registers categories', () => {
      const result = curator.registerCategory('Tech', { keywords: ['code'] });

      expect(result.success).toBe(true);
    });

    it('blocks and allows terms', () => {
      curator.blockTerms('spam');
      curator.allowTerms('approved');

      const result = curator.curate('approved content');

      expect(result.filtering).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('provides curation statistics', () => {
      curator.curate('Content 1');
      curator.curate('Content 2');

      const stats = curator.getStatistics();

      expect(stats.totalCurations).toBe(2);
      expect(stats.acceptanceRate).toBeDefined();
      expect(stats.averageScore).toBeDefined();
    });

    it('tracks score distribution', () => {
      curator.curate('Good content');

      const stats = curator.getStatistics();

      expect(stats.scoreDistribution).toBeDefined();
    });
  });

  describe('Result Retrieval', () => {
    it('retrieves accepted content', () => {
      curator.curate('Good content');
      curator.curate('Bad');

      const accepted = curator.getAccepted();

      expect(accepted.length).toBeGreaterThan(0);
    });

    it('retrieves rejected content', () => {
      curator.curate('Good content');
      curator.curate('x');

      const rejected = curator.getRejected();

      expect(rejected.some(r => !r.accepted)).toBe(true);
    });
  });
});
