import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import CeMatchAssessmentSelect from './CeMatchAssessmentSelect';
import CeMatchComparatorSelect, {
  defaultComparatorForField,
} from './CeMatchComparatorSelect';
import CeMatchFieldSelect from './CeMatchFieldSelect';
import CeMatchFieldTypeSelect from './CeMatchFieldTypeSelect';
import type {
  CeMatchFieldSource,
  CeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
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

  const selectedField = useMemo(
    () => fields.find((field) => field.expressionField === fieldValue),
    [fieldValue, fields]
  );

  if (customAssessmentFieldsError) throw customAssessmentFieldsError;

  // This row switches between several inputs for the same clause. Keep
  // unmounted fields registered, then explicitly clear stale values when a
  // parent changes.
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
            source={source as CeMatchFieldSource | ''}
            selectedCustomAssessmentFormIdentifier={
              selectedCustomAssessmentFormIdentifier
            }
            clientItems={clientItems}
            customAssessmentFields={customAssessmentFields}
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
