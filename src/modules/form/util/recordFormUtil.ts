/**
 * Utils specifically for the EditRecord component.
 *
 * These mostly have to to do with translating data from
 * GraphQL types (like '2022-01-01') to JavaScript
 * objects (like Date) and vice versa.
 */

import { compact, isNil } from 'lodash-es';

import { formatDateForGql, parseHmisDateString } from '../../hmis/hmisUtil';

import {
  getOptionValue,
  isDataNotCollected,
  resolveOptionList,
} from './formUtil';

import { FormItem, ItemType, PickListOption } from '@/types/gqlTypes';

/**
 * Transform form value shape into GraphQL value shape.
 * For example, a selected option '{ code: 'ES' }'
 * is converted to enum 'ES'.
 *
 * @param value value from the form state
 * @param item corresponding FormDefinition item
 * @returns transformed value
 */
export const formValueToGqlValue = (value: any, item: FormItem): any => {
  if (value instanceof Date) {
    return formatDateForGql(value);
  }

  if (item.type === ItemType.Integer) {
    return parseInt(value);
  }

  if (
    item.type === ItemType.Choice &&
    item.pickListReference &&
    ['projects', 'organizations'].includes(item.pickListReference)
  ) {
    // Special case for project/org selectors which key on ID
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      return (value as { id: string }).id;
    }
  } else if ([ItemType.Choice, ItemType.OpenChoice].includes(item.type)) {
    if (Array.isArray(value)) {
      return value.map((option: PickListOption) => option.code);
    } else if (value) {
      return (value as PickListOption).code;
    }
  }

  if (value === '') {
    return undefined;
  }
  return value;
};

const findDataNotCollectedCode = (item: FormItem): string | undefined => {
  const options = resolveOptionList(item, true) || [];

  return options.find(
    (opt) => isDataNotCollected(opt.code) || opt.code === 'NOT_APPLICABLE'
  )?.code;
};

type TransformSubmitValuesParams = {
  /** flattened form definition keyed on link id */
  itemMap: Record<string, FormItem>;
  /** form state (from DynamicForm) to transform */
  values: Record<string, any>;
  /** whether to fill unanswered questions with Data Not Collected option (if present) */
  autofillNotCollected?: boolean;
  /** whether to fill unanswered questions with `null` */
  autofillNulls?: boolean;
  /** whether to fill unanswered boolean questions `false` */
  autofillBooleans?: boolean;
};

/**
 * Given the form state of a completed form, transform it into
 * query variables for a mutation. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 */
export const transformSubmitValues = ({
  itemMap,
  values,
  autofillNotCollected = false,
  autofillNulls = false,
  autofillBooleans = false,
}: TransformSubmitValuesParams) => {
  // Map of variables to pass to gql mutation
  const result: Record<string, any> = {};

  Object.values(itemMap).forEach((item: FormItem) => {
    const key = item.queryField;
    if (!key) return;

    let value;
    if (item.linkId in values) {
      // Transform into gql value, for example Date -> YYYY-MM-DD string
      value = formValueToGqlValue(values[item.linkId], item);
    }

    if (typeof value !== 'undefined') {
      result[key] = value;
    }

    if (autofillNotCollected && isNil(value)) {
      // If we don't have a value, fill in Not Collected code if present
      const notCollectedCode = findDataNotCollectedCode(item);
      if (notCollectedCode) result[key] = notCollectedCode;
    }
    if (autofillNulls && isNil(result[key])) {
      result[key] = null;
    }
    if (
      autofillBooleans &&
      isNil(result[key]) &&
      item.type === ItemType.Boolean
    ) {
      result[key] = false;
    }
  });

  return result;
};

// Convert gql value into value for form state
const getFormValue = (value: any | null | undefined, item: FormItem) => {
  if (isNil(value)) return value;

  switch (item.type) {
    case ItemType.Date:
      return parseHmisDateString(value);

    case ItemType.Choice:
    case ItemType.OpenChoice:
      if (Array.isArray(value)) {
        // DNC gets filtered out here
        return compact(value.map((v) => getOptionValue(v, item)));
      }
      return getOptionValue(value, item);

    default:
      // Set the property directly as the initial form value
      return value;
  }
};

/**
 * Create initial form values based on a record.
 * This is only used for forms that edit a record directly, like the Client, Project, and Organization edit screens.
 *
 * @param itemMap Map of linkId -> Item
 * @param record  GQL HMIS record, like Project or Organization
 *
 * @returns initial form state, ready to pass to DynamicForm as initialValues
 */
export const createInitialValuesFromRecord = (
  itemMap: Record<string, FormItem>,
  record: any
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  Object.values(itemMap).forEach((item) => {
    // Skip: this question doesn't map to a field
    if (!item.queryField) return;

    // Skip: the record doesn't have a value for this property
    if (!record.hasOwnProperty(item.queryField)) return;

    initialValues[item.linkId] = getFormValue(record[item.queryField], item);
  });

  return initialValues;
};
