import { transformSubmitValues } from './formUtil';

import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import {
  FormDefinitionJson,
  ItemType,
  RelatedRecordType,
} from '@/types/gqlTypes';

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
      keyByFieldName: true,
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
      keyByFieldName: true,
    });

    expect(result).toStrictEqual({
      'Exit.boolField': true,
      'Exit.strField': 'foo',
      'Exit.numField': 12,
      'Exit.choiceField': 'YES',
      'Exit.textField': null,
    });
  });

  it('prepends record type when nested', () => {
    const def: FormDefinitionJson = {
      item: [
        {
          type: ItemType.Group,
          linkId: '1',
          recordType: RelatedRecordType.Exit,
          item: [
            {
              linkId: '1.1',
              type: ItemType.Group,
              item: [
                {
                  linkId: '1.1.1',
                  type: ItemType.Boolean,
                  fieldName: 'boolField',
                },
              ],
            },
          ],
        },
      ],
    };
    const values = { '1.1.1': true };
    const result = transformSubmitValues({
      definition: def,
      values,
      keyByFieldName: true,
    });

    expect(result).toStrictEqual({
      'Exit.boolField': true,
    });
  });

  it('handles multi choice', () => {
    const values = {
      '1.6': [{ code: 'OPT_1' }, { code: 'OPT_2' }],
    };
    const result = transformSubmitValues({
      definition,
      values,
      keyByFieldName: true,
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
      keyByFieldName: true,
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
      keyByFieldName: true,
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
      keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
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
          keyByFieldName: true,
        });

        expect(result).toStrictEqual({
          boolField: true,
        });
      });
    });
  });
});
