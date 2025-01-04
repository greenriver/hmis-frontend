import { it, describe, expect } from 'vitest';
import { FormValues } from '../types';
import { shouldEnableItem } from './formUtil';

import {
  EnableBehavior,
  EnableOperator,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

const Items: Record<string, any> = {
  // Any type
  EnableIfExists: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      { question: '1', operator: EnableOperator.Exists },
      { question: '2', operator: EnableOperator.Exists },
    ],
  },
  EnableIfNotExists: {
    enableBehavior: EnableBehavior.All,
    enableWhen: [
      { question: '1', operator: EnableOperator.Exists, answerBoolean: false },
      { question: '2', operator: EnableOperator.Exists, answerBoolean: false },
    ],
  },
  // Boolean answers
  EnableIfTrue: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      { question: '1', operator: EnableOperator.Equal, answerBoolean: true },
    ],
  },
  EnableIfFalse: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      { question: '1', operator: EnableOperator.Equal, answerBoolean: false },
    ],
  },
  // Code answers
  EnableIfFoo: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      { question: '2', operator: EnableOperator.Equal, answerCode: 'FOO' },
    ],
  },
  EnableIfNotFoo: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      { question: '2', operator: EnableOperator.NotEqual, answerCode: 'FOO' },
    ],
  },
  EnableIfInFooBar: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      {
        question: '2',
        operator: EnableOperator.In,
        answerCodes: ['FOO', 'BAR'],
      },
    ],
  },
  EnableIfFooOrTrue: {
    enableBehavior: EnableBehavior.Any,
    enableWhen: [
      {
        question: '1',
        operator: EnableOperator.Equal,
        answerBoolean: true,
      },
      {
        question: '2',
        operator: EnableOperator.Equal,
        answerCode: 'FOO',
      },
    ],
  },
  EnableIfFooAndTrue: {
    enableBehavior: EnableBehavior.All,
    enableWhen: [
      {
        question: '1',
        operator: EnableOperator.Equal,
        answerBoolean: true,
      },
      {
        question: '2',
        operator: EnableOperator.Equal,
        answerCode: 'FOO',
      },
    ],
  },
};

const ITEM_MAP: Record<string, FormItem> = {};
Object.keys(Items).forEach((k, i) => {
  Items[k].linkId = `id-${i}`;
  Items[k].type = ItemType.Display;
  ITEM_MAP[Items[k].linkId] = Items[k] as FormItem;
});

describe('shouldEnableItem', () => {
  it('works on boolean value (true)', () => {
    const values = {
      '1': true,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfFalse,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
  });
  it('works on boolean value (false)', () => {
    const values = {
      '1': false,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfFalse,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
  });
  it('works on boolean value (null)', () => {
    const values = {
      '1': null,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfFalse,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
  });
  it('works on boolean value (undefined)', () => {
    const values = {
      '1': undefined,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfFalse,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
  });

  it('works on code value (FOO)', () => {
    const values = {
      '2': { code: 'FOO' },
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfInFooBar,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
  });

  it('works on code value (BAZ)', () => {
    const values = {
      '2': { code: 'BAZ' },
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfInFooBar,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
  });

  it('works on code value (undefined)', () => {
    const values = {
      '2': undefined,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfInFooBar,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotExists,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
  });

  it('works on code value (null)', () => {
    const values = {
      '2': null,
    };
    expect(
      shouldEnableItem({
        item: Items.EnableIfFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
    expect(
      shouldEnableItem({
        item: Items.EnableIfNotFoo,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(true);
    expect(
      shouldEnableItem({
        item: Items.EnableIfInFooBar,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      })
    ).toBe(false);
  });

  it('works on multiple values (any)', () => {
    const withValues = (values: FormValues) =>
      shouldEnableItem({
        item: Items.EnableIfFooOrTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      });

    expect(
      withValues({
        '1': true,
        '2': 'FOO',
      })
    ).toBe(true);

    expect(
      withValues({
        '1': null,
        '2': 'FOO',
      })
    ).toBe(true);

    expect(
      withValues({
        '1': true,
        '2': 'BAR',
      })
    ).toBe(true);

    expect(
      withValues({
        '1': false,
        '2': 'BAR',
      })
    ).toBe(false);
  });

  it('works on multiple values (all)', () => {
    const withValues = (values: FormValues) =>
      shouldEnableItem({
        item: Items.EnableIfFooAndTrue,
        values,
        itemMap: ITEM_MAP,
        localConstants: {},
      });

    expect(
      withValues({
        '1': true,
        '2': 'FOO',
      })
    ).toBe(true);

    expect(
      withValues({
        '1': false,
        '2': 'FOO',
      })
    ).toBe(false);

    expect(
      withValues({
        '1': true,
        '2': undefined,
      })
    ).toBe(false);
  });
});
