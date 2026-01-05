import { describe, expect, it } from 'vitest';
import { ItemMap } from '../types';
import { normalizeBooleanCheckboxValues } from './formUtil';

import { Component, ItemType } from '@/types/gqlTypes';

describe('normalizeBooleanCheckboxValues', () => {
  it('sets undefined/null boolean checkbox values to false and leaves existing values unchanged', () => {
    const values = {
      checkbox1: undefined, // should be set to false
      checkbox2: true, // should remain true
      checkbox3: null, // should be set to false
      checkbox4: false, // should remain false
      textField: undefined, // should remain undefined
    };

    const itemMap: ItemMap = {
      checkbox1: {
        linkId: 'checkbox1',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      checkbox2: {
        linkId: 'checkbox2',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      checkbox3: {
        linkId: 'checkbox3',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      checkbox4: {
        linkId: 'checkbox4',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      textField: {
        linkId: 'textField',
        type: ItemType.String,
        component: Component.Dropdown,
      },
    };

    const result = normalizeBooleanCheckboxValues(values, itemMap);

    expect(result).toBe(values); // mutates in place
    expect(result.checkbox1).toBe(false);
    expect(result.checkbox2).toBe(true);
    expect(result.checkbox3).toBe(false);
    expect(result.checkbox4).toBe(false);
    expect(result.textField).toBeUndefined();
  });

  it('leaves existing boolean checkbox values unchanged', () => {
    const values = {
      checkbox1: true,
      checkbox2: false,
      checkbox3: undefined,
    };

    const itemMap: ItemMap = {
      checkbox1: {
        linkId: 'checkbox1',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      checkbox2: {
        linkId: 'checkbox2',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      checkbox3: {
        linkId: 'checkbox3',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
    };

    const result = normalizeBooleanCheckboxValues(values, itemMap);

    expect(result.checkbox1).toBe(true);
    expect(result.checkbox2).toBe(false);
    expect(result.checkbox3).toBe(false);
  });

  it('handles empty values object', () => {
    const values = {};
    const itemMap: ItemMap = {
      checkbox1: {
        linkId: 'checkbox1',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
    };

    const result = normalizeBooleanCheckboxValues(values, itemMap);

    expect(result.checkbox1).toBe(false);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('leaves non-checkbox boolean items unchanged', () => {
    const values = {
      booleanCheckbox: undefined,
      booleanRadio: undefined,
      booleanDefault: undefined,
    };

    const itemMap: ItemMap = {
      booleanCheckbox: {
        linkId: 'booleanCheckbox',
        type: ItemType.Boolean,
        component: Component.Checkbox,
      },
      booleanRadio: {
        linkId: 'booleanRadio',
        type: ItemType.Boolean,
        component: Component.RadioButtons,
      },
      booleanDefault: {
        linkId: 'booleanDefault',
        type: ItemType.Boolean,
      },
    };

    const result = normalizeBooleanCheckboxValues(values, itemMap);

    expect(result.booleanCheckbox).toBe(false);
    expect(result.booleanRadio).toBeUndefined();
    expect(result.booleanDefault).toBeUndefined();
  });
});
