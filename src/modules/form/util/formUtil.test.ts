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
    enableWhen: [
      { question: '1', operator: EnableOperator.Exists, answerBoolean: false },
      { question: '2', operator: EnableOperator.Exists, answerBoolean: false },
    ],
  },
  // Boolean answers
  EnableIfTrue: {
    enableWhen: [
      { question: '1', operator: EnableOperator.Equal, answerBoolean: true },
    ],
  },
  EnableIfFalse: {
    enableWhen: [
      { question: '1', operator: EnableOperator.Equal, answerBoolean: false },
    ],
  },
  // Code answers
  EnableIfFoo: {
    enableWhen: [
      { question: '2', operator: EnableOperator.Equal, answerCode: 'FOO' },
    ],
  },
  EnableIfNotFoo: {
    enableWhen: [
      { question: '2', operator: EnableOperator.NotEqual, answerCode: 'FOO' },
    ],
  },
  EnableIfInFooBar: {
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
    expect(shouldEnableItem(Items.EnableIfTrue, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfFalse, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      false
    );
  });
  it('works on boolean value (false)', () => {
    const values = {
      '1': false,
    };
    expect(shouldEnableItem(Items.EnableIfTrue, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfFalse, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      false
    );
  });
  it('works on boolean value (null)', () => {
    const values = {
      '1': null,
    };
    expect(shouldEnableItem(Items.EnableIfTrue, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfFalse, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(
      false
    );
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      true
    );
  });
  it('works on boolean value (undefined)', () => {
    const values = {
      '1': undefined,
    };
    expect(shouldEnableItem(Items.EnableIfTrue, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfFalse, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(
      false
    );
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      true
    );
  });

  it('works on code value (FOO)', () => {
    const values = {
      '2': { code: 'FOO' },
    };
    expect(shouldEnableItem(Items.EnableIfFoo, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfNotFoo, values, ITEM_MAP)).toBe(
      false
    );
    expect(shouldEnableItem(Items.EnableIfInFooBar, values, ITEM_MAP)).toBe(
      true
    );
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      false
    );
  });

  it('works on code value (BAZ)', () => {
    const values = {
      '2': { code: 'BAZ' },
    };
    expect(shouldEnableItem(Items.EnableIfFoo, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfNotFoo, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfInFooBar, values, ITEM_MAP)).toBe(
      false
    );
  });

  it('works on code value (undefined)', () => {
    const values = {
      '2': undefined,
    };
    expect(shouldEnableItem(Items.EnableIfFoo, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfNotFoo, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfInFooBar, values, ITEM_MAP)).toBe(
      false
    );
    expect(shouldEnableItem(Items.EnableIfExists, values, ITEM_MAP)).toBe(
      false
    );
    expect(shouldEnableItem(Items.EnableIfNotExists, values, ITEM_MAP)).toBe(
      true
    );
  });

  it('works on code value (null)', () => {
    const values = {
      '2': null,
    };
    expect(shouldEnableItem(Items.EnableIfFoo, values, ITEM_MAP)).toBe(false);
    expect(shouldEnableItem(Items.EnableIfNotFoo, values, ITEM_MAP)).toBe(true);
    expect(shouldEnableItem(Items.EnableIfInFooBar, values, ITEM_MAP)).toBe(
      false
    );
  });

  it('works on multiple values (any)', () => {
    expect(
      shouldEnableItem(
        Items.EnableIfFooOrTrue,
        {
          '1': true,
          '2': 'FOO',
        },
        ITEM_MAP
      )
    ).toBe(true);

    expect(
      shouldEnableItem(
        Items.EnableIfFooOrTrue,
        {
          '1': null,
          '2': 'FOO',
        },
        ITEM_MAP
      )
    ).toBe(true);

    expect(
      shouldEnableItem(
        Items.EnableIfFooOrTrue,
        {
          '1': true,
          '2': 'BAR',
        },
        ITEM_MAP
      )
    ).toBe(true);

    expect(
      shouldEnableItem(
        Items.EnableIfFooOrTrue,
        {
          '1': false,
          '2': 'BAR',
        },
        ITEM_MAP
      )
    ).toBe(false);
  });

  it('works on multiple values (all)', () => {
    expect(
      shouldEnableItem(
        Items.EnableIfFooAndTrue,
        {
          '1': true,
          '2': 'FOO',
        },
        ITEM_MAP
      )
    ).toBe(true);

    expect(
      shouldEnableItem(
        Items.EnableIfFooAndTrue,
        {
          '1': false,
          '2': 'FOO',
        },
        ITEM_MAP
      )
    ).toBe(false);

    expect(
      shouldEnableItem(
        Items.EnableIfFooAndTrue,
        {
          '1': true,
          '2': undefined,
        },
        ITEM_MAP
      )
    ).toBe(false);
  });
});
