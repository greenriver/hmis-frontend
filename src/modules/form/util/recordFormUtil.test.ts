import { formValueToGqlValue, transformSubmitValues } from './recordFormUtil';

import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import {
  FormDefinitionJson,
  ItemType,
  RelatedRecordType,
} from '@/types/gqlTypes';

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

const definition: FormDefinitionJson = {
  item: [
    {
      type: ItemType.Group,
      linkId: '1',
      item: [
        { linkId: '1.1', type: ItemType.Boolean, fieldName: 'boolField' },
        { linkId: '1.2', type: ItemType.String, fieldName: 'strField' },
        { linkId: '1.3', type: ItemType.Date, fieldName: 'dateField' },
        { linkId: '1.4', type: ItemType.Integer, fieldName: 'numField' },
        { linkId: '1.5', type: ItemType.Currency, fieldName: 'numField2' },
        {
          linkId: '1.6',
          type: ItemType.Choice,
          fieldName: 'choiceField',
          pickListReference: 'NoYesReasonsForMissingData',
        },
        { linkId: '1.7', type: ItemType.Text, fieldName: 'textField' },
      ],
    },
  ],
};

describe('transformSubmitValues', () => {
  it('transforms all value types', () => {
    const dateString = '2022-01-01';
    const date = parseHmisDateString(dateString);
    const values = {
      '1.1': true,
      '1.2': 'foo',
      '1.3': date,
      '1.4': '12',
      '1.5': '1.5',
      '1.6': { code: 'YES', label: 'Yes' },
      '1.7': '',
    };
    const result = transformSubmitValues({
      definition,
      values,
    });

    expect(result).toStrictEqual({
      boolField: true,
      strField: 'foo',
      dateField: dateString,
      numField: 12,
      numField2: 1.5,
      choiceField: 'YES',
    });
  });

  it('prepends record type', () => {
    const clone = JSON.parse(JSON.stringify(definition));
    clone.item[0].recordType = RelatedRecordType.Exit;
    const values = {
      '1.1': true,
      '1.2': 'foo',
      '1.3': undefined,
      '1.4': '12',
      '1.6': { code: 'YES', label: 'Yes' },
      '1.7': null,
    };
    const result = transformSubmitValues({
      definition: clone,
      values,
    });

    expect(result).toStrictEqual({
      'Exit.boolField': true,
      'Exit.strField': 'foo',
      'Exit.numField': 12,
      'Exit.choiceField': 'YES',
      'Exit.textField': null,
    });
  });

  it('handles multi choice', () => {
    const values = {
      '1.6': [{ code: 'OPT_1' }, { code: 'OPT_2' }],
    };
    const result = transformSubmitValues({
      definition,
      values,
    });

    expect(result).toEqual({ choiceField: ['OPT_1', 'OPT_2'] });
  });

  it('ignores empty strings', () => {
    const values = {
      '1.1': '',
      '1.2': '',
      '1.3': '',
      '1.4': '',
      '1.5': '',
      '1.6': '',
      '1.7': '',
    };
    const result = transformSubmitValues({
      definition,
      values,
    });

    expect(result).toStrictEqual({});
  });

  it('keeps nulls', () => {
    const values = {
      '1.1': '',
      '1.2': null,
      '1.3': undefined,
    };
    const result = transformSubmitValues({
      definition,
      values,
    });

    expect(result).toStrictEqual({ strField: null });
  });

  it('ignores NaNs for numeric types', () => {
    const values = {
      '1.4': 'abc',
      '1.5': '123abc',
    };
    const result = transformSubmitValues({
      definition,
      values,
    });

    expect(result).toStrictEqual({});
  });

  describe('transformation options', () => {
    describe('autofillNotCollected', () => {
      it('replaces null response with DATA_NOT_COLLECTED', () => {
        const values = {
          '1.6': null,
        };
        const result = transformSubmitValues({
          definition,
          values,
          autofillNotCollected: true,
        });

        expect(result).toStrictEqual({ choiceField: 'DATA_NOT_COLLECTED' });
      });
      it('replaces undefined response with DATA_NOT_COLLECTED', () => {
        const values = {
          '1.6': undefined,
        };
        const result = transformSubmitValues({
          definition,
          values,
          autofillNotCollected: true,
        });

        expect(result).toStrictEqual({ choiceField: 'DATA_NOT_COLLECTED' });
      });
      it('replaces empty string response with DATA_NOT_COLLECTED', () => {
        const values = {
          '1.6': '',
        };
        const result = transformSubmitValues({
          definition,
          values,
          autofillNotCollected: true,
        });

        expect(result).toStrictEqual({ choiceField: 'DATA_NOT_COLLECTED' });
      });
    });
    describe('autofillNulls', () => {
      it('replaces empty responses with nulls', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          autofillNulls: true,
        });

        expect(result).toStrictEqual({
          boolField: null,
          strField: null,
          dateField: null,
          numField: null,
          numField2: null,
          choiceField: null,
          textField: null,
        });
      });

      it('replaces empty strings with nulls', () => {
        const values = {
          '1.1': '',
          '1.2': '',
          '1.3': '',
          '1.4': '',
          '1.5': '',
          '1.6': '',
          '1.7': '',
        };
        const result = transformSubmitValues({
          definition,
          values,
          autofillNulls: true,
        });

        expect(result).toStrictEqual({
          boolField: null,
          strField: null,
          dateField: null,
          numField: null,
          numField2: null,
          choiceField: null,
          textField: null,
        });
      });
    });
    describe('autofillBooleans', () => {
      it('replaces empty boolean responses with false', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          autofillNulls: true,
          autofillBooleans: true,
        });

        expect(result).toStrictEqual({
          boolField: false,
          strField: null,
          dateField: null,
          numField: null,
          numField2: null,
          choiceField: null,
          textField: null,
        });
      });
      it('preserves filled booleans', () => {
        const values = { '1.1': true };
        const result = transformSubmitValues({
          definition,
          values,
          autofillBooleans: true,
        });

        expect(result).toStrictEqual({
          boolField: true,
        });
      });
    });
  });
});
