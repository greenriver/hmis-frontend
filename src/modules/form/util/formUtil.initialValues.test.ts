import { parseISO } from 'date-fns';

import { getInitialValues } from './formUtil';

import { InitialBehavior, ItemType } from '@/types/gqlTypes';

describe('getInitialValues', () => {
  it('fills booleans', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Boolean,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
            valueBoolean: true,
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Boolean,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
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
            initialBehavior: InitialBehavior.IfEmpty,
            valueNumber: 0,
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Currency,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
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
            initialBehavior: InitialBehavior.IfEmpty,
            valueLocalConstant: '$projectEndDate',
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Date,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
            valueLocalConstant: '$unrecognized',
          },
        ],
      },
    ];
    const locals = { projectEndDate: '2020-04-30' };
    expect(getInitialValues({ item }, locals)).toMatchObject({
      '1': parseISO(locals.projectEndDate),
    });
  });

  it('fills from local constants with falsy values', () => {
    const item = [
      {
        linkId: '1',
        type: ItemType.Boolean,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
            valueLocalConstant: '$bool',
          },
        ],
      },
      {
        linkId: '2',
        type: ItemType.Integer,
        initial: [
          {
            initialBehavior: InitialBehavior.IfEmpty,
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
            initialBehavior: InitialBehavior.IfEmpty,
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
            initialBehavior: InitialBehavior.IfEmpty,
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
            initialBehavior: InitialBehavior.IfEmpty,
            valueCode: 'FOO',
          },
        ],
      },
    ];
    expect(getInitialValues({ item })).toMatchObject({
      '1': { code: 'YES', label: 'Yes' },
      '2': { code: 'DATA_NOT_COLLECTED', label: 'Data not collected' },
      '3': { code: 'FOO' },
    });
  });
});
