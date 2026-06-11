import { localResolvePickList } from '@/modules/form/util/formUtil';
import { COMPARABLE_ITEM_TYPES } from '@/modules/formBuilder/formBuilderUtil';
import {
  CeMatchCustomAssessmentFormFieldsFragment,
  CeMatchFieldFieldsFragment,
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';

export const fieldSourceOptions: PickListOption[] = [
  { code: 'client', label: 'Client field' },
  { code: 'custom', label: 'Custom field' },
];

export const booleanValueOptions: PickListOption[] = [
  { code: 'true', label: 'True' },
  { code: 'false', label: 'False' },
];

// Extend the CeMatchRuleClauseInput type with additional state that the form collects but doesn't submit to the backend
export interface CeMatchDraftClause extends CeMatchRuleClauseInput {
  id: string;
  source: CeMatchFieldSource | '';
  customAssessmentFormIdentifier?: string;
}

export const newDraftClause = (): CeMatchDraftClause => ({
  id: crypto.randomUUID(),
  source: '',
  field: '',
  comparator: CeMatchRuleComparator.Eq,
  value: '',
});

export const customAssessmentFormToOption = (
  form: CeMatchCustomAssessmentFormFieldsFragment
): PickListOption => ({
  code: form.identifier,
  label: form.title,
});

export const pickListOptionsForField = (
  field?: CeMatchFieldFieldsFragment
): PickListOption[] => {
  if (!field) return [];

  // Keep CE match CDED metadata aligned with FormItem: enum references are
  // resolved by the frontend, while backend pick list references are not
  // expanded here. If historical form versions used a different reference, the
  // free-text expression builder can still target those raw legacy values.
  if (field.pickListReference) {
    return localResolvePickList(field.pickListReference) || [];
  }

  return field.pickListOptions || [];
};

export const valueInputType = (
  field: CeMatchFieldFieldsFragment | undefined,
  options: PickListOption[]
) => {
  if (!field) return 'text';
  if (field.itemType === ItemType.Boolean) return 'boolean';
  if ([ItemType.Integer, ItemType.Currency].includes(field.itemType))
    return 'number';
  if (field.itemType === ItemType.Date) return 'date';

  // Fields with enum references or inline options should use a select even when
  // the backend item type is not strictly Choice/OpenChoice.
  if (
    [ItemType.Choice, ItemType.OpenChoice].includes(field.itemType) ||
    options.length
  ) {
    return 'choice';
  }

  return 'text';
};

export const comparatorLabel = (comparator: CeMatchRuleComparator) => {
  switch (comparator) {
    case CeMatchRuleComparator.Eq:
      return 'Equals';
    case CeMatchRuleComparator.NotEq:
      return 'Does not equal';
    case CeMatchRuleComparator.Gt:
      return 'Greater than';
    case CeMatchRuleComparator.Gte:
      return 'Greater than or equal to';
    case CeMatchRuleComparator.Lt:
      return 'Less than';
    case CeMatchRuleComparator.Lte:
      return 'Less than or equal to';
    case CeMatchRuleComparator.Includes:
      return 'Includes';
    case CeMatchRuleComparator.Excludes:
      return 'Excludes';
    default:
      return comparator;
  }
};

export const comparatorOptionsForField = (
  field?: CeMatchFieldFieldsFragment
): PickListOption[] => {
  if (field?.repeats) {
    // Repeating values are arrays, so only array membership operators apply.
    return [CeMatchRuleComparator.Includes, CeMatchRuleComparator.Excludes].map(
      (code) => ({
        code,
        label: comparatorLabel(code),
      })
    );
  }

  const comparators = new Set<CeMatchRuleComparator>([
    CeMatchRuleComparator.Eq,
    CeMatchRuleComparator.NotEq,
  ]);

  if (field && COMPARABLE_ITEM_TYPES.includes(field.itemType)) {
    comparators.add(CeMatchRuleComparator.Gt);
    comparators.add(CeMatchRuleComparator.Gte);
    comparators.add(CeMatchRuleComparator.Lt);
    comparators.add(CeMatchRuleComparator.Lte);
  }

  return Array.from(comparators).map((code) => ({
    code,
    label: comparatorLabel(code),
  }));
};

export const booleanOperatorOptions: PickListOption[] = [
  { code: CeMatchRuleBooleanOperator.And, label: 'ALL' },
  { code: CeMatchRuleBooleanOperator.Or, label: 'ANY' },
];
