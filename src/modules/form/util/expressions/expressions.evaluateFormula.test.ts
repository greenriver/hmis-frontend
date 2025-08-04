import { it, describe, expect } from 'vitest';
import { evaluateFormula } from '@/modules/form/util/expressions/formula';

function context(
  obj: Record<string, number | undefined>
): Map<string, number | undefined> {
  return new Map(Object.entries(obj));
}

describe('evaluateFormula', () => {
  it('adds values and interprets identifiers', () => {
    expect(evaluateFormula('a + b', context({ a: 2, b: 3 }))).toBe(5);
  });
  it('calls functions and handles UnaryExpressions', () => {
    expect(evaluateFormula('ABS(-2)', context({}))).toBe(2);
  });
  it('handles 0', () => {
    expect(evaluateFormula('a + b', context({ a: 0, b: 0 }))).toBe(0);
  });
  it('returns undefined if any values are undefined', () => {
    expect(evaluateFormula('ABS(a - b)', context({ a: 1, b: undefined }))).toBe(
      undefined
    );
  });

  describe('rounding functions', () => {
    it('rounds division to nearest integer', () => {
      expect(evaluateFormula('ROUND(a / b)', context({ a: 7, b: 3 }))).toBe(2);
      expect(evaluateFormula('ROUND(a / b)', context({ a: 8, b: 3 }))).toBe(3);
    });

    it('rounds division to specific decimal places', () => {
      expect(
        evaluateFormula('ROUNDTO(a / b, 2)', context({ a: 10, b: 3 }))
      ).toBe(3.33);
      expect(
        evaluateFormula('ROUNDTO(a / b, 1)', context({ a: 22, b: 7 }))
      ).toBe(3.1);
    });

    it('rounds division up (ceiling)', () => {
      expect(evaluateFormula('CEIL(a / b)', context({ a: 7, b: 3 }))).toBe(3);
      expect(evaluateFormula('CEIL(a / b)', context({ a: 6, b: 3 }))).toBe(2);
    });

    it('rounds division down (floor)', () => {
      expect(evaluateFormula('FLOOR(a / b)', context({ a: 7, b: 3 }))).toBe(2);
      expect(evaluateFormula('FLOOR(a / b)', context({ a: 8, b: 3 }))).toBe(2);
    });
  });
});
