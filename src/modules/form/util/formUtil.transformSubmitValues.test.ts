import { mapValues } from 'lodash-es';

import { HIDDEN_VALUE } from '../types';

import { transformSubmitValues } from './formUtil';

import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import {
  FormDefinitionJson,
  FormItem,
  ItemType,
  RelatedRecordType,
} from '@/types/gqlTypes';

const definition: FormDefinitionJson = {
  item: [
    {
      type: ItemType.Group,
      linkId: '1',
      item: [
        {
          linkId: '1.1',
          type: ItemType.Boolean,
          mapping: { fieldName: 'boolField' },
        },
        {
          linkId: '1.2',
          type: ItemType.String,
          mapping: { fieldName: 'strField' },
        },
        {
          linkId: '1.3',
          type: ItemType.Date,
          mapping: { fieldName: 'dateField' },
        },
        {
          linkId: '1.4',
          type: ItemType.Integer,
          mapping: { fieldName: 'numField' },
        },
        {
          linkId: '1.5',
          type: ItemType.Currency,
          mapping: { fieldName: 'numField2' },
        },
        {
          linkId: '1.6',
          type: ItemType.Choice,
          mapping: { fieldName: 'choiceField' },
          pickListReference: 'NoYesReasonsForMissingData',
        },
        {
          linkId: '1.7',
          type: ItemType.Text,
          mapping: { fieldName: 'textField' },
        },
      ],
    },
  ],
};

const completeNullResultByField = {
  boolField: null,
  strField: null,
  dateField: null,
  numField: null,
  numField2: null,
  choiceField: null,
  textField: null,
};

const completeNullResultById = {
  '1.1': null,
  '1.2': null,
  '1.3': null,
  '1.4': null,
  '1.5': null,
  '1.6': null,
  '1.7': null,
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
      textField: null,
    });
  });

  it('prepends record type', () => {
    const clone = JSON.parse(JSON.stringify(definition));
    clone.item[0].item.forEach((i: FormItem) =>
      i.mapping ? (i.mapping.recordType = RelatedRecordType.Exit) : null
    );
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
      'Exit.dateField': null,
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
          item: [
            {
              linkId: '1.1',
              type: ItemType.Group,
              item: [
                {
                  linkId: '1.1.1',
                  type: ItemType.Boolean,
                  mapping: {
                    recordType: RelatedRecordType.Exit,
                    fieldName: 'boolField',
                  },
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

  it('nullifies empty strings', () => {
    const values = {
      '1.1': '',
      '1.2': '',
      '1.3': '',
      '1.4': '',
      '1.5': '',
      '1.6': '',
      '1.7': '',
    };
    const result = transformSubmitValues({ definition, values });

    expect(result).toStrictEqual(mapValues(values, () => null));
  });

  it('nullifies empty responses', () => {
    const values = {
      '1.1': '',
      '1.2': null,
      '1.3': undefined,
    };
    const result = transformSubmitValues({ definition, values });

    expect(result).toStrictEqual(mapValues(values, () => null));
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

  it('replaces empty strings and undefined with nulls', () => {
    const values = {
      '1.1': '',
      '1.2': '',
      '1.3': '',
      '1.4': undefined,
      '1.5': undefined,
      '1.6': undefined,
      '1.7': undefined,
    };
    const result = transformSubmitValues({ definition, values });
    expect(result).toStrictEqual(completeNullResultById);
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
    describe('includeMissingKeys', () => {
      it('sets missing responses to null', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_NULL',
          keyByFieldName: true,
        });

        expect(result).toStrictEqual(completeNullResultByField);
      });

      it('works alongside autofillNotCollected', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_NULL',
          autofillNotCollected: true,
          keyByFieldName: true,
        });

        expect(result).toStrictEqual({
          ...completeNullResultByField,
          choiceField: 'DATA_NOT_COLLECTED',
        });
      });
    });
    describe('includeMissingKeys as nulls', () => {
      it('replaces empty boolean responses with false', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_NULL',
          autofillBooleans: true,
          keyByFieldName: true,
        });

        expect(result).toStrictEqual({
          ...completeNullResultByField,
          boolField: false,
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
    describe('includeMissingKeys as hidden', () => {
      it('marks missing fields as HIDDEN', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_HIDDEN',
        });

        expect(result).toStrictEqual(
          mapValues(completeNullResultById, () => HIDDEN_VALUE)
        );
      });

      it('marks missing fields as HIDDEN (keyed by fieldname)', () => {
        const values = {};
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_HIDDEN',
          keyByFieldName: true,
        });

        expect(result).toStrictEqual(
          mapValues(completeNullResultByField, () => HIDDEN_VALUE)
        );
      });

      it('does not mark empty fields as HIDDEN', () => {
        const values = {
          '1.1': null,
          '1.2': '',
          '1.3': undefined,
          '1.4': undefined,
          '1.5': null,
        };
        const result = transformSubmitValues({
          definition,
          values,
          includeMissingKeys: 'AS_HIDDEN',
        });

        expect(result).toStrictEqual({
          ...completeNullResultById,
          '1.6': HIDDEN_VALUE,
          '1.7': HIDDEN_VALUE,
        });
      });
    });
  });
});
