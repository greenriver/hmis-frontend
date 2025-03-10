import { describe, expect, it } from 'vitest';
import { getEnrichedValueForChoiceItem } from './formUtil';

import { FormItem, ItemType, PickListType } from '@/types/gqlTypes';

const remotePickListMap = {
  [PickListType.Coc]: [
    { code: 'ma', label: 'MA-100' },
    { code: 'ca', label: 'CA-100' },
  ],
  [PickListType.AvailableUnitsForEnrollment]: [
    { code: 'one', label: 'One (default)', initialSelected: true },
    { code: 'two', label: 'Two' },
  ],
};
const handleError = (message: string) => {
  throw new Error(message);
};

const enrich = (item: FormItem, value: any) => {
  const { enrichedValue, initialSelectedValue } = getEnrichedValueForChoiceItem(
    {
      item,
      remotePickListMap,
      defaultValue: value,
      handleError,
    }
  );
  return enrichedValue || initialSelectedValue;
};

describe('getEnrichedValueForChoiceItem', () => {
  describe('single-select choice item', () => {
    it('enriches value with local pick list reference', () => {
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListReference: 'NoYesMissing',
      };

      ['YES', { code: 'YES' }].forEach((defaultValue) => {
        const result = enrich(item, defaultValue);
        expect(result).toEqual({ code: 'YES', label: 'Yes' });
      });
      expect(enrich(item, undefined)).toEqual(undefined);
    });

    it('enriches value with remote pick list reference', () => {
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListReference: PickListType.Coc,
      };

      ['ma', { code: 'ma' }].forEach((defaultValue) => {
        const result = enrich(item, defaultValue);
        expect(result).toEqual({ code: 'ma', label: 'MA-100' });
      });
      expect(enrich(item, undefined)).toEqual(undefined);
    });

    it('enriches value with remote pick list reference and initialSelected option', () => {
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListReference: PickListType.AvailableUnitsForEnrollment,
      };

      // null value is enriched to initialSelected option
      const initial = remotePickListMap[
        PickListType.AvailableUnitsForEnrollment
      ].find((o) => o.initialSelected);
      expect(enrich(item, undefined)).toEqual(initial);
      expect(enrich(item, null)).toEqual(initial);
    });

    it('enriches value with local pickListOptions', () => {
      const opt = { code: 'opt', label: 'Label' };
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListOptions: [opt],
      };

      [opt.code, { code: 'opt' }].forEach((defaultValue) => {
        const result = enrich(item, defaultValue);
        expect(result).toEqual(opt);
      });

      expect(enrich(item, undefined)).toEqual(undefined);
    });

    it('enriches value with local pickListOptions and initialSelected option', () => {
      const opt1 = { code: 'opt', label: 'Label' };
      const opt2 = { code: 'opt2', label: 'Label', initialSelected: true };
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListOptions: [opt1, opt2],
      };

      // null value is enriched to initialSelected option
      expect(enrich(item, undefined)).toEqual(opt2);
      expect(enrich(item, null)).toEqual(opt2);

      // default val is still enriched as expected
      [opt1.code, { code: opt1.code }].forEach((defaultValue) => {
        const result = enrich(item, defaultValue);
        expect(result).toEqual(opt1);
      });
    });
  });

  describe('multi-select choice item', () => {
    it('enriches value with local pick list reference', () => {
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListReference: 'NoYesMissing',
        repeats: true,
      };

      expect(enrich(item, ['YES'])).toEqual([{ code: 'YES', label: 'Yes' }]);
      expect(enrich(item, ['YES', 'NO'])).toEqual([
        {
          code: 'YES',
          label: 'Yes',
        },
        {
          code: 'NO',
          label: 'No',
        },
      ]);
    });

    it('enriches value with local pickListOptions and multiple initialSelected options', () => {
      const opt1 = { code: 'opt', label: 'Label' };
      const opt2 = { code: 'opt2', label: 'Label', initialSelected: true };
      const opt3 = { code: 'opt3', label: 'Label', initialSelected: true };
      const item = {
        linkId: 'foo',
        type: ItemType.Choice,
        pickListOptions: [opt1, opt2, opt3],
        repeats: true,
      };

      // null value is enriched to initialSelected option
      expect(enrich(item, undefined)).toEqual([opt2, opt3]);
      expect(enrich(item, null)).toEqual([opt2, opt3]);
      expect(enrich(item, [])).toEqual([opt2, opt3]);

      // default val is still enriched as expected
      expect(enrich(item, [opt1.code])).toEqual([opt1]);
    });
  });
});
