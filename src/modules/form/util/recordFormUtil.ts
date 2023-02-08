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
  FormValues,
  getOptionValue,
  isDataNotCollected,
  resolveOptionList,
} from './formUtil';

import { HmisEnums } from '@/types/gqlEnums';
import {
  FormDefinitionJson,
  FormItem,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

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
  if (isNil(value)) return value;
  if (value === '') return undefined;

  if (item.type === ItemType.Date) {
    // Try to make sure we have a date object
    let date = value;
    if (typeof date === 'string') {
      date = parseHmisDateString(value);
    }
    if (date instanceof Date) return formatDateForGql(date) || undefined;
    // If this isn't parseable/formattable into a date, return undefined
    return undefined;
  }

  if ([ItemType.Integer, ItemType.Currency].includes(item.type)) {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
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

  return value;
};

const findDataNotCollectedCode = (item: FormItem): string | undefined => {
  const options = resolveOptionList(item, true) || [];

  return options.find(
    (opt) => isDataNotCollected(opt.code) || opt.code === 'NOT_APPLICABLE'
  )?.code;
};

type TransformSubmitValuesParams = {
  definition: FormDefinitionJson;
  /** form state (from DynamicForm) to transform */
  values: FormValues;
  /** ONLY transform the assessment date field */
  assessmentDateOnly?: boolean;
  /** whether to fill unanswered boolean questions `false` */
  autofillBooleans?: boolean;
  /** whether to fill unanswered questions with Data Not Collected option (if present) */
  autofillNotCollected?: boolean;
  /** whether to fill unanswered questions with `null` */
  autofillNulls?: boolean;
  /** key results field name (instead of link ID) */
  keyByFieldName?: boolean;
};

/**
 * Given the form state of a completed form, transform it into
 * query variables for a mutation. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 * It's also used when submitting an assessment, to generate `hudValues`
 */
export const transformSubmitValues = ({
  definition,
  values,
  assessmentDateOnly = false,
  autofillBooleans = false,
  autofillNotCollected = false,
  autofillNulls = false,
  keyByFieldName = false,
}: TransformSubmitValuesParams) => {
  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(
    items: FormItem[],
    result: Record<string, any>,
    currentRecord?: string
  ) {
    items.forEach((item: FormItem) => {
      if (Array.isArray(item.item)) {
        const recordName = item.recordType
          ? HmisEnums.RelatedRecordType[item.recordType]
          : currentRecord;
        rescursiveFillMap(item.item, result, recordName);
      }
      if (!item.fieldName) return;
      if (assessmentDateOnly && !item.assessmentDate) return;

      // Build key for result map
      let key = keyByFieldName ? item.fieldName : item.linkId;
      // Prefix key like "Enrollment.livingSituation"
      if (keyByFieldName && currentRecord) key = `${currentRecord}.${key}`;

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
  }

  const result: Record<string, any> = {};
  rescursiveFillMap(definition.item, result);
  return result;
};

// Convert gql value into value for form state
export const gqlValueToFormValue = (
  value: any | null | undefined,
  item: FormItem
) => {
  if (isNil(value)) return value;

  switch (item.type) {
    case ItemType.Date:
      return typeof value === 'string' ? parseHmisDateString(value) : value;
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
    if (!item.fieldName) return;

    // Skip: the record doesn't have a value for this property
    if (!record.hasOwnProperty(item.fieldName)) return;

    initialValues[item.linkId] = gqlValueToFormValue(
      record[item.fieldName],
      item
    );
  });

  return initialValues;
};
