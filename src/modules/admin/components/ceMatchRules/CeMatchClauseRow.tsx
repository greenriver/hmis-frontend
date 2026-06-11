import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import {
  CeMatchBuilderField,
  CeMatchDraftCustomAssessmentForm,
  CeMatchFieldSource,
  CeMatchRuleFormValues,
  comparatorOptionsForField,
  customAssessmentFormToOption,
  fieldToOption,
  pickListOptionsForField,
} from './ceMatchRuleUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import {
  CeMatchRuleComparator,
  ItemType,
  PickListOption,
  useGetCeMatchCustomAssessmentFieldsQuery,
} from '@/types/gqlTypes';

const fieldSourceOptions: PickListOption[] = [
  { code: 'client', label: 'Client field' },
  { code: 'custom', label: 'Custom field' },
];

const booleanOptions: PickListOption[] = [
  { code: 'true', label: 'True' },
  { code: 'false', label: 'False' },
];

const emptyCustomAssessmentFields: CeMatchBuilderField[] = [];

const valueInputType = (
  field: CeMatchBuilderField | undefined,
  options: PickListOption[]
) => {
  if (!field) return 'text';
  if (field.itemType === ItemType.Boolean) return 'boolean';
  if ([ItemType.Integer, ItemType.Currency].includes(field.itemType))
    return 'number';
  if (field.itemType === ItemType.Date) return 'date';
  if (
    [ItemType.Choice, ItemType.OpenChoice].includes(field.itemType) ||
    options.length
  ) {
    return 'choice';
  }
  return 'text';
};

const optionCode = (value: PickListOption['code'] | boolean | null) => {
  if (typeof value === 'string') return value;
};

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  index: number;
  clientItems: CeMatchBuilderField[];
  customAssessmentForms: CeMatchDraftCustomAssessmentForm[];
}

const CeMatchClauseRow: React.FC<Props> = ({
  control,
  setValue,
  index,
  clientItems,
  customAssessmentForms,
}) => {
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
              setValue(`${clausePath}.customAssessmentFormIdentifier`, '');
              setValue(`${clausePath}.field`, '');
              setValue(`${clausePath}.comparator`, CeMatchRuleComparator.Eq);
              setValue(`${clausePath}.value`, '');
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
              onChange={() => {
                setValue(`${clausePath}.field`, '');
                setValue(`${clausePath}.comparator`, CeMatchRuleComparator.Eq);
                setValue(`${clausePath}.value`, '');
              }}
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
              setValue(`${clausePath}.value`, '');
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
            onChange={() => setValue(`${clausePath}.value`, '')}
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
              options={booleanOptions}
              disabled={!selectedField}
              setValueAs={(option) => option?.code === 'true'}
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
