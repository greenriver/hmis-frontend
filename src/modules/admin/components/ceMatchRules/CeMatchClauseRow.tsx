import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import CeMatchAssessmentSelect from './CeMatchAssessmentSelect';
import CeMatchComparatorSelect, {
  defaultComparatorForField,
} from './CeMatchComparatorSelect';
import CeMatchFieldSelect from './CeMatchFieldSelect';
import CeMatchFieldTypeSelect from './CeMatchFieldTypeSelect';
import type { CeMatchRuleFormValues } from './ceMatchRuleFormUtil';
import CeMatchValueInput from './CeMatchValueInput';
import {
  CeMatchCustomAssessmentFormFieldsFragment,
  CeMatchFieldDetailsFragment,
  CeMatchRuleComparator,
  useGetCeMatchCustomAssessmentFieldsQuery,
} from '@/types/gqlTypes';

// Extract as a constant to avoid re-creating the array on every render
const emptyCustomAssessmentFields: CeMatchFieldDetailsFragment[] = [];

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  index: number;
  clientItems: CeMatchFieldDetailsFragment[];
  customAssessmentForms: CeMatchCustomAssessmentFormFieldsFragment[];
}

/**
 * Renders one requirement clause in the CE Match Rule structured builder.
 */
const CeMatchClauseRow: React.FC<Props> = ({
  control,
  setValue,
  index,
  clientItems,
  customAssessmentForms,
}) => {
  // Path to the current clause in the RHF form state
  const clausePath = `structuredExpression.clauses.${index}` as const;
  const source =
    useWatch({
      control,
      name: `${clausePath}.source`,
    }) || '';
  const selectedCustomAssessmentFormIdentifier =
    useWatch({
      control,
      name: `${clausePath}.customAssessmentFormIdentifier`,
    }) || '';
  const fieldValue = useWatch({
    control,
    name: `${clausePath}.field`,
  });

  // Query for custom assessment field at the row level, because the selected
  // field metadata drives sibling controls: field, comparator, and value inputs.
  const {
    data: customAssessmentFieldsData,
    loading: customAssessmentFieldsLoading,
    error: customAssessmentFieldsError,
  } = useGetCeMatchCustomAssessmentFieldsQuery({
    variables: {
      formDefinitionIdentifier: selectedCustomAssessmentFormIdentifier,
    },
    skip: source !== 'custom' || !selectedCustomAssessmentFormIdentifier,
  });
  const customAssessmentFields =
    customAssessmentFieldsData?.ceMatchCustomAssessmentFields ||
    emptyCustomAssessmentFields;

  const fields = useMemo(() => {
    if (source === 'client') return clientItems;
    if (source === 'custom') return customAssessmentFields;
    return [];
  }, [clientItems, source, customAssessmentFields]);

  // The row owns this derived state so all clause controls react to one consistent
  // field object instead of duplicating query/state across child components.
  const selectedField = useMemo(
    () => fields.find((field) => field.expressionField === fieldValue),
    [fieldValue, fields]
  );

  if (customAssessmentFieldsError) throw customAssessmentFieldsError;

  // This row switches between several inputs for the same clause;
  // explicitly clear stale values when a parent changes.
  const resetValueSelection = () => setValue(`${clausePath}.value`, '');
  const resetFieldSelection = (
    comparator: CeMatchRuleComparator = CeMatchRuleComparator.Eq
  ) => {
    setValue(`${clausePath}.field`, '');
    setValue(`${clausePath}.comparator`, comparator);
    resetValueSelection();
  };
  const resetCustomAssessmentSelection = () => {
    setValue(`${clausePath}.customAssessmentFormIdentifier`, '');
    resetFieldSelection();
  };

  return (
    <Stack gap={3}>
      <Grid container spacing={2} alignItems='flex-start'>
        <Grid item xs={12} md={4}>
          <CeMatchFieldTypeSelect
            clausePath={clausePath}
            control={control}
            setValue={setValue}
            onSourceChange={resetCustomAssessmentSelection}
          />
        </Grid>
        {source === 'custom' && (
          <Grid item xs={12} md={4}>
            <CeMatchAssessmentSelect
              clausePath={clausePath}
              control={control}
              customAssessmentForms={customAssessmentForms}
              onAssessmentChange={() => resetFieldSelection()}
            />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2} alignItems='flex-start'>
        <Grid item xs={12} md={4}>
          <CeMatchFieldSelect
            clausePath={clausePath}
            control={control}
            fields={fields}
            fieldLabel={source === 'client' ? 'Client Field' : 'Custom Field'}
            disabled={
              !source ||
              (source === 'custom' && !selectedCustomAssessmentFormIdentifier)
            }
            customAssessmentFieldsLoading={customAssessmentFieldsLoading}
            onFieldChange={(field) => {
              setValue(
                `${clausePath}.comparator`,
                defaultComparatorForField(field) as CeMatchRuleComparator
              );
              resetValueSelection();
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CeMatchComparatorSelect
            clausePath={clausePath}
            control={control}
            selectedField={selectedField}
            onComparatorChange={resetValueSelection}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CeMatchValueInput
            clausePath={clausePath}
            control={control}
            selectedField={selectedField}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CeMatchClauseRow;
