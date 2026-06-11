import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './CeMatchRuleForm';
import {
  booleanValueOptions,
  CeMatchFieldSource,
  comparatorOptionsForField,
  customAssessmentFormToOption,
  fieldSourceOptions,
  pickListOptionsForField,
  valueInputType,
} from './ceMatchRuleUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import {
  CeMatchCustomAssessmentFormFieldsFragment,
  CeMatchFieldFieldsFragment,
  CeMatchRuleComparator,
  PickListOption,
  useGetCeMatchCustomAssessmentFieldsQuery,
} from '@/types/gqlTypes';

// Extract as a constant to avoid re-creating the array on every render
const emptyCustomAssessmentFields: CeMatchFieldFieldsFragment[] = [];

// Field labels may be missing in older CDED metadata, so fall back to stable
// expression identifiers for the select option label.
const fieldLabel = (field: CeMatchFieldFieldsFragment) =>
  field.label.trim() || field.expressionField || field.key;

// ControlledSelect can emit booleans for JSON-valued fields; only string values
// are safe to reuse as select option codes for form state.
const optionCode = (value: PickListOption['code'] | boolean | null) => {
  if (typeof value === 'string') return value;
};

// This row maps both client and custom CDED fields into the same select shape.
const fieldToOption = (field: CeMatchFieldFieldsFragment): PickListOption => ({
  code: field.expressionField,
  label: fieldLabel(field),
});

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  index: number;
  clientItems: CeMatchFieldFieldsFragment[];
  customAssessmentForms: CeMatchCustomAssessmentFormFieldsFragment[];
}

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

  const fieldOptions = useMemo(() => {
    if (source === 'client')
      return clientItems.map((field) => fieldToOption(field));
    if (source === 'custom')
      return customAssessmentFields.map((field) => fieldToOption(field));
    return [];
  }, [clientItems, source, customAssessmentFields]);

  const customAssessmentFormOptions = useMemo(
    () => customAssessmentForms.map(customAssessmentFormToOption),
    [customAssessmentForms]
  );

  const comparatorOptions = useMemo(
    () => comparatorOptionsForField(selectedField),
    [selectedField]
  );

  const valueOptions = pickListOptionsForField(selectedField);
  const valueType = valueInputType(selectedField, valueOptions);

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
          <ControlledSelect
            name={`${clausePath}.source`}
            control={control}
            label='Field Type'
            placeholder='Select type'
            options={fieldSourceOptions}
            shouldUnregister={false}
            onChange={(value) => {
              const nextSource = optionCode(value) || '';
              setValue(
                `${clausePath}.source`,
                nextSource as CeMatchFieldSource | ''
              );
              resetCustomAssessmentSelection();
            }}
          />
        </Grid>
        {source === 'custom' && (
          <Grid item xs={12} md={4}>
            <ControlledSelect
              name={`${clausePath}.customAssessmentFormIdentifier`}
              control={control}
              label='Assessment'
              placeholder='Select assessment'
              options={customAssessmentFormOptions}
              shouldUnregister={false}
              onChange={() => resetFieldSelection()}
            />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2} alignItems='flex-start'>
        <Grid item xs={12} md={4}>
          <ControlledSelect
            name={`${clausePath}.field`}
            control={control}
            label={source === 'client' ? 'Client Field' : 'Custom Field'}
            placeholder='Select field'
            options={fieldOptions}
            shouldUnregister={false}
            disabled={
              !source ||
              (source === 'custom' && !selectedCustomAssessmentFormIdentifier)
            }
            loading={customAssessmentFieldsLoading}
            onChange={(value) => {
              const selectedFieldExpression = optionCode(value);
              const nextField = fields.find(
                (field) => field.expressionField === selectedFieldExpression
              );
              const nextComparator =
                comparatorOptionsForField(nextField)[0]?.code ||
                CeMatchRuleComparator.Eq;
              setValue(
                `${clausePath}.comparator`,
                nextComparator as CeMatchRuleComparator
              );
              resetValueSelection();
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ControlledSelect
            name={`${clausePath}.comparator`}
            control={control}
            label='Comparator'
            placeholder='Select'
            options={comparatorOptions}
            shouldUnregister={false}
            disabled={!selectedField}
            onChange={resetValueSelection}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {valueType === 'choice' && (
            <ControlledSelect
              name={`${clausePath}.value`}
              control={control}
              label='Value'
              placeholder='Select value'
              options={valueOptions}
              disabled={!selectedField}
              shouldUnregister={false}
            />
          )}
          {valueType === 'boolean' && (
            <ControlledSelect
              name={`${clausePath}.value`}
              control={control}
              label='Value'
              placeholder='Select value'
              options={booleanValueOptions}
              disabled={!selectedField}
              // Empty must stay empty; otherwise clearing the select would
              // become false, which is a valid submitted JSON value.
              setValueAs={(option) => (option ? option.code === 'true' : '')}
              shouldUnregister={false}
            />
          )}
          {valueType !== 'choice' && valueType !== 'boolean' && (
            <ControlledTextInput
              name={`${clausePath}.value`}
              control={control}
              label='Value'
              type={valueType}
              disabled={!selectedField}
              shouldUnregister={false}
            />
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CeMatchClauseRow;
