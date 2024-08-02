import { evaluateTemplate } from '@/modules/form/util/expressions/template';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';

function context(
  obj: Record<string, string | undefined>
): Map<string, string | undefined> {
  return new Map(Object.entries(obj));
}

describe('evaluateTemplate', () => {
  it('interprets identifiers', () => {
    expect(
      evaluateTemplate(
        '${last}, ${first}',
        context({ first: 'Jane', last: 'Smith' })
      )
    ).toBe('Smith, Jane');
  });
  it('calls functions and handles UnaryExpressions', () => {
    expect(
      evaluateTemplate(
        'time ${FORMAT_DURATION(timeSpent)}',
        context({ timeSpent: '130' })
      )
    ).toBe('time 2 hours 10 minutes');
  });
  it('returns N/A if blank', () => {
    expect(evaluateTemplate('${missing}', context({ missing: '' }))).toBe(
      'N/A'
    );
  });
  it('returns 0 if blank 0', () => {
    expect(evaluateTemplate('${sum}', context({ sum: '0' }))).toBe('0');
  });
  it('handles braces without interpolation', () => {
    expect(evaluateTemplate('{literalBraces}', context({}))).toBe(
      '{literalBraces}'
    );
  });
  it('handles date strings', () => {
    expect(
      evaluateTemplate('date is ${dateStr}', context({ dateStr: '2020-12-04' }))
    ).toBe('date is 12/04/2020');
  });
  it('handles dates', () => {
    expect(
      evaluateTemplate(
        'date is ${date}',
        context({
          date: parseHmisDateString('2020-12-04') as unknown as string,
        })
      )
    ).toBe('date is 12/04/2020');
  });
});
