import { getInitialValues } from './formUtil';

import { ItemType } from '@/types/gqlTypes';

describe('getInitialValues', () => {
  it('fills booleans', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Boolean,
        initial: [
          {
            valueBoolean: true,
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Boolean,
        initial: [
          {
            valueBoolean: false,
          },
        ],
      },
    ];
    expect(getInitialValues({ item })).toMatchObject({ '1': true, '2': false });
  });

  it('fills numeric', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Integer,
        initial: [
          {
            valueNumber: 0,
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Currency,
        initial: [
          {
            valueNumber: 2.4,
          },
        ],
      },
    ];
    expect(getInitialValues({ item })).toMatchObject({ '1': 0, '2': 2.4 });
  });

  it('fills from local constants', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Date,
        initial: [
          {
            valueLocalConstant: '$projectEndDate',
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Date,
        initial: [
          {
            valueLocalConstant: '$unrecognized',
          },
        ],
      },
    ];
    const locals = { projectEndDate: new Date() };
    expect(getInitialValues({ item }, locals)).toMatchObject({
      '1': locals.projectEndDate,
    });
  });

  it('fills from local constants with falsy values', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Boolean,
        initial: [
          {
            valueLocalConstant: '$bool',
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Integer,
        initial: [
          {
            valueLocalConstant: '$zero',
          },
        ],
      },
    ];
    const locals = { bool: false, zero: 0 };
    expect(getInitialValues({ item }, locals)).toMatchObject({
      '1': false,
      '2': 0,
    });
  });

  it('fills code (with full picklist option if resolvable)', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Choice,
        pickListReference: 'NoYesReasonsForMissingData',
        initial: [
          {
            valueCode: 'YES',
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Choice,
        pickListReference: 'NoYesReasonsForMissingData',
        initial: [
          {
            valueCode: 'DATA_NOT_COLLECTED',
          },
        ],
      },
      {
        linkId: '3',
        type: ItemType.Choice,
        pickListReference: 'UNRESOLVABLE',
        initial: [
          {
            valueCode: 'FOO',
          },
        ],
      },
    ];
    expect(getInitialValues({ item })).toMatchObject({
      '1': { code: 'YES', label: 'Yes' },
      '2': null,
      '3': { code: 'FOO' },
    });
  });
});
