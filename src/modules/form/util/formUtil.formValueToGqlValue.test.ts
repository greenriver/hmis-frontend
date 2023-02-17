import { formValueToGqlValue } from './formUtil';

import { ItemType } from '@/types/gqlTypes';

describe('formValueToGqlValue', () => {
  it('transform value into string', () => {
    const item = { linkId: 'abc', type: ItemType.String };
    expect(formValueToGqlValue('', item)).toBe(undefined);
    expect(formValueToGqlValue('value', item)).toBe('value');
  });

  it('leaves nulls and undefined as-is', () => {
    const item = { linkId: 'abc', type: ItemType.String };
    expect(formValueToGqlValue(null, item)).toBe(null);
    expect(formValueToGqlValue(undefined, item)).toBe(undefined);
  });

  it('transforms value into date string', () => {
    const item = { linkId: 'abc', type: ItemType.Date };
    expect(formValueToGqlValue(new Date(2020, 0, 31), item)).toBe('2020-01-31');
    expect(formValueToGqlValue('2020-01-31', item)).toBe('2020-01-31');
    expect(formValueToGqlValue('2020-01-31T05:00:00.000Z', item)).toBe(
      '2020-01-31'
    );
    expect(formValueToGqlValue('not-a-valid-date', item)).toBe(undefined);
    expect(formValueToGqlValue(new Date('invalid'), item)).toBe(undefined);
    expect(formValueToGqlValue('', item)).toBe(undefined);
  });

  it('transforms value into integer', () => {
    const item = { linkId: 'abc', type: ItemType.Integer };
    expect(formValueToGqlValue(1, item)).toBe(1);
    expect(formValueToGqlValue(-1, item)).toBe(-1);
    expect(formValueToGqlValue(0, item)).toBe(0);
    expect(formValueToGqlValue('100', item)).toBe(100);
    expect(formValueToGqlValue('00100', item)).toBe(100);
    expect(formValueToGqlValue('not a number', item)).toBe(undefined);
  });

  it('transforms single-select choice', () => {
    const item = { linkId: 'abc', type: ItemType.Choice };
    expect(formValueToGqlValue({ code: 'answer' }, item)).toBe('answer');
  });

  it('transforms multi-select choice', () => {
    const item = { linkId: 'abc', type: ItemType.Choice, multiple: true };
    expect(
      formValueToGqlValue([{ code: 'answer' }, { code: 'answer2' }], item)
    ).toEqual(['answer', 'answer2']);

    expect(
      formValueToGqlValue([{ code: 'answer' }, { code: 'answer2' }], item)
    ).toEqual(['answer', 'answer2']);
  });
});
