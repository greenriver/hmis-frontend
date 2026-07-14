import { useMemo } from 'react';
import { Control, UseFormSetValue, useController, useWatch } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
import {
  NULL_CHECK_OPTIONS,
  clauseForNullCheck,
  nullCheckForClause,
} from './nullCheckUtil';
import GenericSelect from '@/components/elements/input/GenericSelect';
import { renderOption } from '@/components/elements/input/ProjectSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { findOptionLabel } from '@/modules/form/util/formUtil';
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
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
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

  if (field?.multiple) {
    // For a multiple value (array), only allow Includes/Excludes
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
 * Dropdown for selecting the match rule's comparator (equals, includes, etc.), plus
 * "Has a value" / "Does not have a value" options that persist as NOT_EQ/EQ with a NULL value.
 *
 * Unlike a plain comparator, whether to display a null-check option depends on both the
 * comparator AND the value fields, so (unlike ControlledSelect) this needs to watch both.
 */
const CeMatchClauseComparatorSelect: React.FC<Props> = ({
  control,
  clausePath,
  selectedField,
  setValue,
}) => {
  const {
    field: comparatorField,
    fieldState: { error },
  } = useController({
    name: `${clausePath}.comparator`,
    control,
    rules: { required: 'This field is required' },
  });
  const value = useWatch({ control, name: `${clausePath}.value` });

  const options = useMemo(() => {
    const comparatorOptions = comparatorOptionsForField(selectedField);
    return selectedField?.multiple
      ? comparatorOptions
      : [...comparatorOptions, ...NULL_CHECK_OPTIONS];
  }, [selectedField]);

  const displayCode =
    nullCheckForClause(comparatorField.value, value) ??
    comparatorField.value ??
    '';
  const selectedOption =
    options.find(({ code }) => code === displayCode) || null;

  const handleChange = (option: PickListOption | null) => {
    const code = option?.code;
    if (!code) return;

    if (code === 'HAS_VALUE' || code === 'DOES_NOT_HAVE_VALUE') {
      const nullClause = clauseForNullCheck(code);
      comparatorField.onChange(nullClause.comparator);
      setValue(`${clausePath}.value`, nullClause.value);
      return;
    }

    comparatorField.onChange(code);
    setValue(`${clausePath}.value`, '');
  };

  return (
    <GenericSelect<PickListOption, false, false>
      value={selectedOption}
      options={options}
      onChange={(_event, option) => handleChange(option || null)}
      getOptionLabel={(option) => findOptionLabel(option, options)}
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      renderOption={renderOption}
      label={getRequiredLabel('Comparator', true)}
      textInputProps={{
        placeholder: 'Select',
        error: !!error,
        helperText: error?.message,
        name: comparatorField.name,
        inputRef: comparatorField.ref,
      }}
      onBlur={comparatorField.onBlur}
      disabled={!selectedField}
    />
  );
};

export default CeMatchClauseComparatorSelect;
