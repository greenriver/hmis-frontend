import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { COMPARABLE_ITEM_TYPES } from '@/modules/formBuilder/formBuilderUtil';
import {
  CeMatchFieldDetailsFragment,
  CeMatchRuleComparator,
  PickListOption,
} from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  selectedField?: CeMatchFieldDetailsFragment;
  onComparatorChange: () => void;
}

const comparatorLabel = (comparator: CeMatchRuleComparator) => {
  switch (comparator) {
    // Grammatically these labels should follow "Must", the form element label.
    // for example "Must Equal", rather than "Must Equals"
    case CeMatchRuleComparator.Eq:
      return 'Equal';
    case CeMatchRuleComparator.NotEq:
      return 'Not equal';
    case CeMatchRuleComparator.Gt:
      return 'Be greater than';
    case CeMatchRuleComparator.Gte:
      return 'Be greater than or equal to';
    case CeMatchRuleComparator.Lt:
      return 'Be less than';
    case CeMatchRuleComparator.Lte:
      return 'Be less than or equal to';
    case CeMatchRuleComparator.Includes:
      return 'Include';
    case CeMatchRuleComparator.Excludes:
      return 'Exclude';
    case CeMatchRuleComparator.IsNotNull:
      return 'Have a value';
    case CeMatchRuleComparator.IsNull:
      return 'Not have a value';
    default:
      return comparator;
  }
};

const comparatorOptionsForField = (
  field?: CeMatchFieldDetailsFragment
): PickListOption[] => {
  const comparators = new Set<CeMatchRuleComparator>();

  if (field?.multiple) {
    // For a multiple value (array), only allow Includes/Excludes.
    // Null/Not Null comparisons don't currently work for array CDEs,
    // since the backend CdeFieldMap uses a default of [], not null, when no values are present
    comparators.add(CeMatchRuleComparator.Includes);
    comparators.add(CeMatchRuleComparator.Excludes);
  } else {
    // Otherwise, start with Equals/Not Equals/null checks
    comparators.add(CeMatchRuleComparator.Eq);
    comparators.add(CeMatchRuleComparator.NotEq);
    comparators.add(CeMatchRuleComparator.IsNotNull);
    comparators.add(CeMatchRuleComparator.IsNull);

    // If the field type is comparable (numeric/date/etc), add the comparable operators
    if (field && COMPARABLE_ITEM_TYPES.includes(field.itemType)) {
      comparators.add(CeMatchRuleComparator.Gt);
      comparators.add(CeMatchRuleComparator.Gte);
      comparators.add(CeMatchRuleComparator.Lt);
      comparators.add(CeMatchRuleComparator.Lte);
    }
  }

  return Array.from(comparators).map((code) => ({
    code,
    label: comparatorLabel(code),
  }));
};

export const defaultComparatorForField = (
  field?: CeMatchFieldDetailsFragment
) =>
  (comparatorOptionsForField(field)[0]?.code as CeMatchRuleComparator) ||
  CeMatchRuleComparator.Eq;

/**
 * Dropdown for selecting the match rule's comparator (equals, includes, etc.)
 */
const CeMatchClauseComparatorSelect: React.FC<Props> = ({
  control,
  clausePath,
  selectedField,
  onComparatorChange,
}) => {
  const comparatorOptions = useMemo(
    () => comparatorOptionsForField(selectedField),
    [selectedField]
  );

  return (
    <ControlledSelect
      name={`${clausePath}.comparator`}
      control={control}
      label={getRequiredLabel('Must', true)}
      placeholder='Select'
      required
      options={comparatorOptions}
      disabled={!selectedField}
      onChange={onComparatorChange}
    />
  );
};

export default CeMatchClauseComparatorSelect;
