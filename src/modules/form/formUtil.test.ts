import { formValueToGqlValue } from '../form/formUtil';

import { ItemType } from '@/types/gqlTypes';

describe('formValueToGqlValue', () => {
  it('removes empty strings', () => {
    const item = { linkId: 'abc', type: ItemType.String };
    expect(formValueToGqlValue('', item)).toBe(undefined);
  });

  it('leaves nulls, strings, and integers', () => {
    const item = { linkId: 'abc', type: ItemType.String };

    expect(formValueToGqlValue(null, item)).toBe(null);
    expect(formValueToGqlValue(undefined, item)).toBe(undefined);
    expect(formValueToGqlValue(0, item)).toBe(0);
    expect(formValueToGqlValue(10, item)).toBe(10);
    expect(formValueToGqlValue('value', item)).toBe('value');
  });

  it('transforms dates', () => {
    const item = { linkId: 'abc', type: ItemType.Date };
    expect(formValueToGqlValue(new Date(2020, 0, 31), item)).toBe('2020-01-31');
  });

  it('transforms single-select choice', () => {
    const item = { linkId: 'abc', type: ItemType.Choice };
    expect(formValueToGqlValue({ valueString: 'answer' }, item)).toBe('answer');
    expect(formValueToGqlValue({ valueCoding: { code: 'answer' } }, item)).toBe(
      'answer'
    );
  });

  it('transforms multi-select choice', () => {
    const item = { linkId: 'abc', type: ItemType.Choice, multiple: true };
    expect(
      formValueToGqlValue(
        [{ valueString: 'answer' }, { valueString: 'answer2' }],
        item
      )
    ).toEqual(['answer', 'answer2']);

    expect(
      formValueToGqlValue(
        [
          { valueCoding: { code: 'answer' } },
          { valueCoding: { code: 'answer2' } },
        ],
        item
      )
    ).toEqual(['answer', 'answer2']);
  });
});
