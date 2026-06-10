import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';

import {
  CeMatchBuilderField,
  CeMatchDraftClause,
  CeMatchDraftCustomAssessmentForm,
  CeMatchFieldSource,
  comparatorOptionsForField,
  customAssessmentFormToOption,
  fieldToOption,
  pickListOptionsForField,
} from './ceMatchRuleUtil';
import TextInput from '@/components/elements/input/TextInput';
import FormSelect from '@/modules/form/components/FormSelect';
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

const singleOption = (option: PickListOption | PickListOption[] | null) =>
  Array.isArray(option) ? option[0] : option;

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

const coerceValue = (field: CeMatchBuilderField | undefined, value: string) => {
  if (value === '') return '';
  if (!field) return value;
  if (field.itemType === ItemType.Boolean) return value === 'true';
  if ([ItemType.Integer, ItemType.Currency].includes(field.itemType)) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

interface Props {
  clause: CeMatchDraftClause;
  clientItems: CeMatchBuilderField[];
  customAssessmentForms: CeMatchDraftCustomAssessmentForm[];
  onChange: (clause: CeMatchDraftClause) => void;
  onRemove: VoidFunction;
  canRemove: boolean;
}

const CeMatchClauseRow: React.FC<Props> = ({
  clause,
  clientItems,
  customAssessmentForms,
  onChange,
  onRemove,
  canRemove,
}) => {
  const theme = useTheme();
  const selectedCustomAssessmentFormIdentifier =
    clause.customAssessmentFormIdentifier || '';
  const {
    data: customAssessmentFieldsData,
    loading: customAssessmentFieldsLoading,
    error: customAssessmentFieldsError,
  } = useGetCeMatchCustomAssessmentFieldsQuery({
    variables: {
      formDefinitionIdentifier: selectedCustomAssessmentFormIdentifier,
    },
    skip: clause.source !== 'custom' || !selectedCustomAssessmentFormIdentifier,
  });
  const customAssessmentFields =
    customAssessmentFieldsData?.ceMatchCustomAssessmentFields ||
    emptyCustomAssessmentFields;

  const fields = useMemo(() => {
    if (clause.source === 'client') return clientItems;
    if (clause.source === 'custom') return customAssessmentFields;
    return [];
  }, [clientItems, clause.source, customAssessmentFields]);

  const selectedField = useMemo(
    () => fields.find((field) => field.expressionField === clause.field),
    [clause.field, fields]
  );

  const fieldOptions = useMemo(() => {
    if (clause.source === 'client')
      return clientItems.map((field) => fieldToOption(field));
    if (clause.source === 'custom')
      return customAssessmentFields.map((field) => fieldToOption(field));
    return [];
  }, [clientItems, clause.source, customAssessmentFields]);

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
  const sourceValue =
    fieldSourceOptions.find((option) => option.code === clause.source) || null;
  const fieldValue =
    fieldOptions.find((option) => option.code === clause.field) || null;
  const customAssessmentFormValue =
    customAssessmentFormOptions.find(
      (option) => option.code === selectedCustomAssessmentFormIdentifier
    ) || null;
  const comparatorValue =
    comparatorOptions.find((option) => option.code === clause.comparator) ||
    null;

  const update = (patch: Partial<CeMatchDraftClause>) =>
    onChange({ ...clause, ...patch });

  if (customAssessmentFieldsError) throw customAssessmentFieldsError;

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
      }}
    >
      <Grid container spacing={2} alignItems='flex-start'>
        <Grid item xs={12} md={2.5}>
          <FormSelect
            label='Field Type'
            placeholder='Select type'
            options={fieldSourceOptions}
            value={sourceValue}
            onChange={(_, rawOption) => {
              const option = singleOption(rawOption);
              update({
                source: (option?.code || '') as CeMatchFieldSource | '',
                customAssessmentFormIdentifier: '',
                field: '',
                comparator: CeMatchRuleComparator.Eq,
                value: '',
              });
            }}
          />
        </Grid>
        {clause.source === 'custom' && (
          <Grid item xs={12} md={2.5}>
            <FormSelect
              label='Assessment'
              placeholder='Select assessment'
              options={customAssessmentFormOptions}
              value={customAssessmentFormValue}
              onChange={(_, rawOption) => {
                const option = singleOption(rawOption);
                update({
                  customAssessmentFormIdentifier: option?.code || '',
                  field: '',
                  comparator: CeMatchRuleComparator.Eq,
                  value: '',
                });
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} md={3}>
          <FormSelect
            label={clause.source === 'custom' ? 'CDED' : 'Field'}
            placeholder='Select field'
            options={fieldOptions}
            value={fieldValue}
            disabled={
              !clause.source ||
              (clause.source === 'custom' &&
                !selectedCustomAssessmentFormIdentifier)
            }
            loading={customAssessmentFieldsLoading}
            onChange={(_, rawOption) => {
              const option = singleOption(rawOption);
              const nextField = fields.find(
                (field) => field.expressionField === option?.code
              );
              const nextComparator =
                comparatorOptionsForField(nextField)[0]?.code ||
                CeMatchRuleComparator.Eq;
              update({
                field: option?.code || '',
                comparator: nextComparator as CeMatchRuleComparator,
                value: '',
              });
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormSelect
            label='Comparator'
            placeholder='Select'
            options={comparatorOptions}
            value={comparatorValue}
            disabled={!selectedField}
            onChange={(_, rawOption) => {
              const option = singleOption(rawOption);
              update({
                comparator:
                  (option?.code as CeMatchRuleComparator) ||
                  CeMatchRuleComparator.Eq,
                value: '',
              });
            }}
          />
        </Grid>
        <Grid item xs={12} md={3.5}>
          {valueType === 'choice' && (
            <FormSelect
              label='Value'
              placeholder='Select value'
              options={valueOptions}
              value={
                valueOptions.find(
                  (option) => option.code === String(clause.value)
                ) || null
              }
              disabled={!selectedField}
              onChange={(_, rawOption) => {
                const option = singleOption(rawOption);
                update({ value: option?.code || '' });
              }}
            />
          )}
          {valueType === 'boolean' && (
            <FormSelect
              label='Value'
              placeholder='Select value'
              options={booleanOptions}
              value={
                booleanOptions.find(
                  (option) => option.code === String(clause.value)
                ) || null
              }
              disabled={!selectedField}
              onChange={(_, rawOption) => {
                const option = singleOption(rawOption);
                update({ value: option?.code === 'true' });
              }}
            />
          )}
          {valueType !== 'choice' && valueType !== 'boolean' && (
            <TextInput
              label='Value'
              type={valueType}
              value={clause.value ?? ''}
              disabled={!selectedField}
              onChange={(event) =>
                update({
                  value: coerceValue(selectedField, event.target.value),
                })
              }
            />
          )}
        </Grid>
        <Grid item xs={12} md={1}>
          <Stack direction='row' justifyContent='flex-end'>
            <IconButton
              aria-label='Remove condition'
              disabled={!canRemove}
              onClick={onRemove}
              sx={{ mt: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      {selectedField?.repeats && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          This field can have multiple values. Use includes/excludes to compare
          one selected answer.
        </Typography>
      )}
    </Box>
  );
};

export default CeMatchClauseRow;
