/**
 * Consilient Tests
 * Tests for pattern mining, conflict resolution, and consensus
 */

const Consilient = require('../src/consilient');
const PatternMiner = require('../src/pattern-miner');
const ConflictResolver = require('../src/conflict-resolver');

describe('PatternMiner', () => {
  let miner;

  beforeEach(() => {
    miner = new PatternMiner({ minFrequency: 2, minConfidence: 0.7 });
  });

  describe('Observation Recording', () => {
    it('records observations', () => {
      const result = miner.observe({ input: 'A' }, { output: 'X' });

      expect(result.success).toBe(true);
      expect(result.observationId).toBeDefined();
    });

    it('tracks observation success', () => {
      miner.observe({ input: 'A' }, { output: 'X' }, { success: true });
      miner.observe({ input: 'A' }, { output: 'X' }, { success: true });

      const patterns = miner.minePatterns();

      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Mining', () => {
    it('mines patterns from observations', () => {
      miner.observe({ type: 'X' }, { result: 'success' }, { success: true });
      miner.observe({ type: 'X' }, { result: 'success' }, { success: true });
      miner.observe({ type: 'X' }, { result: 'success' }, { success: true });

      const patterns = miner.minePatterns();

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].frequency).toBeGreaterThanOrEqual(2);
    });

    it('requires minimum frequency', () => {
      miner.observe({ type: 'Y' }, { result: 'ok' }, { success: true });

      const patterns = miner.minePatterns();

      expect(patterns.length).toBe(0); // Only 1 observation, needs 2+
    });

    it('checks success rate', () => {
      miner.observe({ type: 'Z' }, { result: 'ok' }, { success: true });
      miner.observe({ type: 'Z' }, { result: 'ok' }, { success: false });

      const patterns = miner.minePatterns();

      expect(patterns.length).toBe(0); // Success rate too low
    });

    it('calculates consistency', () => {
      miner.observe({ type: 'A' }, { result: 'X' }, { success: true });
      miner.observe({ type: 'A' }, { result: 'X' }, { success: true });

      const patterns = miner.minePatterns();

      expect(patterns[0].consistency).toBeGreaterThan(0.5);
    });
  });

  describe('Pattern Matching', () => {
    beforeEach(() => {
      miner.observe({ method: 'create', resource: 'user' }, { status: 201 }, { success: true });
      miner.observe({ method: 'create', resource: 'user' }, { status: 201 }, { success: true });
      miner.minePatterns();
    });

    it('finds matching patterns', () => {
      const matches = miner.findMatchingPatterns({ method: 'create', resource: 'user' }, 0.5);

      expect(matches.length).toBeGreaterThan(0);
    });

    it('calculates similarity', () => {
      const matches = miner.findMatchingPatterns({ method: 'create', resource: 'user' }, 0.5);

      expect(matches[0].similarity).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Statistics', () => {
    it('provides mining statistics', () => {
      miner.observe({ x: 1 }, { y: 2 });
      miner.observe({ x: 1 }, { y: 2 });

      const stats = miner.getStatistics();

      expect(stats.totalObservations).toBe(2);
    });
  });
});

describe('ConflictResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new ConflictResolver({ conflictThreshold: 0.3 });
  });

  describe('Conflict Detection', () => {
    it('detects conflicts', () => {
      const result = resolver.detectConflict({ value: true }, { value: false });

      expect(result.conflict).toBe(true);
      expect(result.conflictId).toBeDefined();
    });

    it('ignores minor differences', () => {
      const result = resolver.detectConflict(
        { value: 'apple' },
        { value: 'apple' }
      );

      expect(result.conflict).toBe(false);
    });

    it('determines conflict type', () => {
      const result = resolver.detectConflict({ value: true }, { value: false });

      expect(result.type).toBe('logical');
    });
  });

  describe('Conflict Resolution', () => {
    it('resolves conflicts', () => {
      const detection = resolver.detectConflict({ x: 1 }, { x: 2 });
      const result = resolver.resolveConflict(detection.conflictId);

      expect(result.success).toBe(true);
      expect(result.resolution).toBeDefined();
    });

    it('provides resolution suggestions', () => {
      const detection = resolver.detectConflict({ x: 1 }, { x: 2 });
      const suggestions = resolver.getSuggestions(detection.conflictId);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].strategy).toBeDefined();
    });
  });

  describe('Coherence Validation', () => {
    it('validates coherence', () => {
      const items = [{ value: 'A' }, { value: 'A' }, { value: 'A' }];

      const result = resolver.validateCoherence(items);

      expect(result.coherent).toBe(true);
    });

    it('detects incoherence', () => {
      const items = [{ value: true }, { value: false }];

      const result = resolver.validateCoherence(items);

      expect(result.coherent).toBe(false);
    });

    it('calculates coherence score', () => {
      const items = [{ value: 'X' }, { value: 'Y' }];

      const result = resolver.validateCoherence(items);

      expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(result.coherenceScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Statistics', () => {
    it('tracks conflict statistics', () => {
      resolver.detectConflict({ x: 1 }, { x: 2 });
      resolver.detectConflict({ y: 3 }, { y: 4 });

      const stats = resolver.getStatistics();

      expect(stats.totalConflicts).toBe(2);
    });
  });
});

describe('Consilient', () => {
  let consilient;

  beforeEach(() => {
    consilient = new Consilient();
  });

  describe('Decision Recording', () => {
    it('records decisions', () => {
      const result = consilient.recordDecision({
        input: { action: 'create' },
        output: { status: 201 },
        successful: true
      });

      expect(result.success).toBe(true);
    });

    it('checks coherence on record', () => {
      consilient.recordDecision({
        input: { type: 'A' },
        output: { result: 'X' },
        successful: true
      });

      const result = consilient.recordDecision({
        input: { type: 'A' },
        output: { result: 'X' },
        successful: true
      });

      expect(result.coherent).toBeDefined();
    });
  });

  describe('Pattern Mining Integration', () => {
    it('mines patterns from decisions', () => {
      consilient.recordDecision(
        { input: { op: 'add' }, output: { sum: 5 }, successful: true },
        {}
      );
      consilient.recordDecision(
        { input: { op: 'add' }, output: { sum: 5 }, successful: true },
        {}
      );

      const result = consilient.minePatterns();

      expect(result.patternsFound).toBeGreaterThanOrEqual(0);
    });

    it('checks decisions against patterns', () => {
      consilient.recordDecision(
        { input: { value: 10 }, output: { doubled: 20 } },
        {}
      );
      consilient.recordDecision(
        { input: { value: 10 }, output: { doubled: 20 } },
        {}
      );

      consilient.minePatterns();

      const check = consilient.checkDecision({
        input: { value: 10 },
        output: { doubled: 20 }
      });

      expect(check.aligned).toBeDefined();
    });
  });

  describe('Conflict Management', () => {
    it('detects conflicts', () => {
      const result = consilient.detectConflict({ x: true }, { x: false });

      expect(result.conflict).toBe(true);
    });

    it('resolves conflicts', () => {
      const detection = consilient.detectConflict({ x: 1 }, { x: 2 });
      const resolution = consilient.resolveConflict(detection.conflictId);

      expect(resolution.success).toBe(true);
    });
  });

  describe('Rules and Validation', () => {
    it('registers validation rules', () => {
      const result = consilient.registerRule('positive', (item) => item.value > 0);

      expect(result.success).toBe(true);
    });

    it('validates against rules', () => {
      consilient.registerRule('positive', (item) => item.value > 0);
      consilient.registerRule('string', (item) => typeof item.value === 'number');

      const result = consilient.validate({ value: 5 });

      expect(result.valid).toBe(true);
      expect(result.validationScore).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('provides overall statistics', () => {
      consilient.recordDecision({ input: { x: 1 }, output: { y: 2 } });

      const stats = consilient.getStatistics();

      expect(stats.totalDecisions).toBe(1);
      expect(stats.coherenceRate).toBeDefined();
    });
  });
});
