import {
  Alert,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import {
  Control,
  Controller,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';

import CeMatchClauseRow from './CeMatchClauseRow';
import { CeMatchRuleFormValues, newDraftClause } from './ceMatchRuleFormUtil';
import CardGroup, { RemovableCard } from '@/components/elements/CardGroup';
import Loading from '@/components/elements/Loading';
import {
  CeMatchRuleBooleanOperator,
  useGetCeMatchClientFieldsQuery,
  useGetCeMatchCustomAssessmentFormsQuery,
} from '@/types/gqlTypes';

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  validationError?: string;
}

const booleanOperatorOptions = [
  { code: CeMatchRuleBooleanOperator.And, label: 'ALL requirements' },
  { code: CeMatchRuleBooleanOperator.Or, label: 'ANY requirements' },
];

/**
 * Builds a structured CE match expression by loading field metadata, managing
 * the clause list, and choosing whether clauses are combined with ALL or ANY.
 */
const StructuredExpressionBuilder: React.FC<Props> = ({
  control,
  setValue,
  validationError,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'structuredExpression.clauses',
  });
  const operator =
    useWatch({
      control,
      name: 'structuredExpression.operator',
    }) || CeMatchRuleBooleanOperator.And;

  const {
    data: clientItemsData,
    loading: clientItemsLoading,
    error: clientItemsError,
  } = useGetCeMatchClientFieldsQuery();
  const {
    data: customAssessmentFormsData,
    loading: customAssessmentFormsLoading,
    error: customAssessmentFormsError,
  } = useGetCeMatchCustomAssessmentFormsQuery();

  const loading = clientItemsLoading || customAssessmentFormsLoading;
  const clientItems = clientItemsData?.ceMatchClientFields || [];
  const customAssessmentForms =
    customAssessmentFormsData?.ceMatchCustomAssessmentForms || [];

  if (clientItemsError) throw clientItemsError;
  if (customAssessmentFormsError) throw customAssessmentFormsError;

  return (
    <Stack gap={2}>
      {validationError && <Alert severity='error'>{validationError}</Alert>}
      {fields.length > 1 && (
        <Stack>
          <Stack direction='row' alignItems='center' gap={1} flexWrap='wrap'>
            <Typography variant='body2' fontWeight={600}>
              Match:
            </Typography>
            <Controller
              control={control}
              name='structuredExpression.operator'
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {booleanOperatorOptions.map((option) => (
                    <FormControlLabel
                      key={option.code}
                      value={option.code}
                      control={<Radio size='small' />}
                      label={<strong>{option.label}</strong>}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </Stack>
          <Typography variant='body2'>
            Applicants must meet{' '}
            {operator === CeMatchRuleBooleanOperator.And
              ? 'every'
              : 'at least one'}{' '}
            requirement below.
          </Typography>
        </Stack>
      )}
      {loading && <Loading />}
      {!loading && (
        <CardGroup
          onAddItem={() => append(newDraftClause(), { shouldFocus: false })}
          addItemText='Add Requirement'
        >
          {fields.map((clause, index) => (
            <Fragment key={clause.id}>
              {index > 0 && (
                <Divider>
                  <Typography variant='body2' fontWeight={600}>
                    {operator === CeMatchRuleBooleanOperator.And ? 'AND' : 'OR'}
                  </Typography>
                </Divider>
              )}
              <RemovableCard
                // disable removing the last card
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
                removeTooltip='Remove Requirement'
                sx={{
                  backgroundColor: 'primary.100',
                  borderColor: 'grayscale.300',
                }}
              >
                <CeMatchClauseRow
                  control={control}
                  setValue={setValue}
                  index={index}
                  clientItems={clientItems}
                  customAssessmentForms={customAssessmentForms}
                />
              </RemovableCard>
            </Fragment>
          ))}
        </CardGroup>
      )}
    </Stack>
  );
};

export default StructuredExpressionBuilder;
