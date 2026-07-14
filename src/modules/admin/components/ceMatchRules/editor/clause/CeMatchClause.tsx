import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
import CeMatchClauseAssessmentSelect from './CeMatchClauseAssessmentSelect';
import CeMatchClauseComparatorSelect, {
  defaultComparatorForField,
} from './CeMatchClauseComparatorSelect';
import CeMatchClauseFieldSelect from './CeMatchClauseFieldSelect';
import CeMatchClauseFieldSourceSelect from './CeMatchClauseFieldSourceSelect';
import CeMatchClauseValueInput from './CeMatchClauseValueInput';
import { isNullCheckClause } from './nullCheckUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeMatchCustomAssessmentFormFieldsFragment,
  CeMatchFieldDetailsFragment,
  CeMatchRuleComparator,
  CeMatchRuleFieldSource,
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
const CeMatchClause: React.FC<Props> = ({
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
  const comparator = useWatch({
    control,
    name: `${clausePath}.comparator`,
  });
  const clauseValue = useWatch({
    control,
    name: `${clausePath}.value`,
  });
  const isNullCheck = isNullCheckClause(comparator, clauseValue);

  // Query for custom assessment field at this level, rather than in the child CeMatchClauseFieldSelect,
  // because the selected field metadata also impacts the other child controls (comparator and value dropdowns).
  const {
    data: customAssessmentFieldsData,
    loading: customAssessmentFieldsLoading,
    error: customAssessmentFieldsError,
  } = useGetCeMatchCustomAssessmentFieldsQuery({
    variables: {
      formDefinitionIdentifier: selectedCustomAssessmentFormIdentifier,
    },
    skip:
      source !== CeMatchRuleFieldSource.CustomDataElement ||
      !selectedCustomAssessmentFormIdentifier,
  });
  const customAssessmentFields =
    customAssessmentFieldsData?.ceMatchCustomAssessmentFields ||
    emptyCustomAssessmentFields;

  const fields = useMemo(() => {
    if (source === CeMatchRuleFieldSource.Client) return clientItems;
    if (source === CeMatchRuleFieldSource.CustomDataElement)
      return customAssessmentFields;
    return [];
  }, [clientItems, source, customAssessmentFields]);

  const selectedField = useMemo(
    () => fields.find((field) => field.expressionField === fieldValue),
    [fieldValue, fields]
  );

  if (customAssessmentFieldsError) throw customAssessmentFieldsError;

  // This component switches between several inputs for the same clause;
  // explicitly clear dependent stale values when one dropdown changes.
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

  const fieldSelectDisabled = useMemo(() => {
    return (
      !source ||
      (source === CeMatchRuleFieldSource.CustomDataElement &&
        !selectedCustomAssessmentFormIdentifier)
    );
  }, [source, selectedCustomAssessmentFormIdentifier]);

  const fieldSelectHelperText = useMemo(() => {
    if (!source) return 'Choose field type first.';
    if (
      source === CeMatchRuleFieldSource.CustomDataElement &&
      fieldSelectDisabled
    )
      return 'Choose an assessment first.';
  }, [source, fieldSelectDisabled]);

  return (
    <Stack gap={2}>
      <Grid container spacing={2} alignItems='flex-start'>
        <Grid item xs={12} md={6}>
          <CeMatchClauseFieldSourceSelect
            clausePath={clausePath}
            control={control}
            setValue={setValue}
            onSourceChange={resetCustomAssessmentSelection}
          />
        </Grid>
        {source === CeMatchRuleFieldSource.CustomDataElement && (
          <Grid item xs={12} md={6}>
            <CeMatchClauseAssessmentSelect
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
          <CeMatchClauseFieldSelect
            clausePath={clausePath}
            control={control}
            fields={fields}
            fieldLabel={
              source
                ? `${HmisEnums.CeMatchRuleFieldSource[source]} Field`
                : 'Field'
            }
            disabled={fieldSelectDisabled}
            helperText={fieldSelectHelperText}
            customAssessmentFieldsLoading={customAssessmentFieldsLoading}
            onFieldChange={(field) => {
              setValue(
                `${clausePath}.comparator`,
                defaultComparatorForField(field)
              );
              resetValueSelection();
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CeMatchClauseComparatorSelect
            clausePath={clausePath}
            control={control}
            selectedField={selectedField}
            setValue={setValue}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CeMatchClauseValueInput
            clausePath={clausePath}
            control={control}
            selectedField={selectedField}
            isNullCheck={isNullCheck}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CeMatchClause;
