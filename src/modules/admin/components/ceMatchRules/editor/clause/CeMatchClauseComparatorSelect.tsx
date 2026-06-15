import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
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

const comparatorOptionsForField = (
  field?: CeMatchFieldDetailsFragment
): PickListOption[] => {
  const comparators = new Set<CeMatchRuleComparator>();

  if (field?.repeats) {
    // For a repeating value (array), only allow Includes/Excludes
    comparators.add(CeMatchRuleComparator.Includes);
    comparators.add(CeMatchRuleComparator.Excludes);
  } else {
    // Otherwise, start with Equals/Not Equals
    comparators.add(CeMatchRuleComparator.Eq);
    comparators.add(CeMatchRuleComparator.NotEq);

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
      label='Comparator'
      placeholder='Select'
      options={comparatorOptions}
      disabled={!selectedField}
      onChange={onComparatorChange}
    />
  );
};

export default CeMatchClauseComparatorSelect;
