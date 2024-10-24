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
});
