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

import { CeMatchRuleFormValues, newDraftClause } from './ceMatchRuleFormUtil';
import CeMatchClause from './clause/CeMatchClause';
import CardGroup, { RemovableCard } from '@/components/elements/CardGroup';
import Loading from '@/components/elements/Loading';
import {
  CeMatchRuleBooleanOperator,
  useGetCeMatchClientFieldsQuery,
  useGetCeMatchCustomAssessmentFormsQuery,
  useGetCeMatchPsdeFieldsQuery,
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
const CeMatchStructuredExpressionBuilder: React.FC<Props> = ({
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
  // PSDE fields come from a static backend registry, so they can be loaded once
  // for the whole builder and shared by every requirement clause.
  const {
    data: psdeFieldsData,
    loading: psdeFieldsLoading,
    error: psdeFieldsError,
  } = useGetCeMatchPsdeFieldsQuery();

  const loading =
    clientItemsLoading || customAssessmentFormsLoading || psdeFieldsLoading;
  const clientItems = clientItemsData?.ceMatchClientFields || [];
  const psdeFields = psdeFieldsData?.ceMatchPsdeFields || [];
  const customAssessmentForms =
    customAssessmentFormsData?.ceMatchCustomAssessmentForms || [];

  if (clientItemsError) throw clientItemsError;
  if (customAssessmentFormsError) throw customAssessmentFormsError;
  if (psdeFieldsError) throw psdeFieldsError;

  return (
    <Stack gap={2}>
      {validationError && <Alert severity='error'>{validationError}</Alert>}
      {fields.length > 1 && (
        <Stack>
          <Stack direction='column' gap={1}>
            <Typography variant='body2' fontWeight={600}>
              Applicants must match:
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
                  backgroundColor: 'grayscale.50',
                  borderColor: 'grayscale.50',
                }}
              >
                <Stack direction='column' gap={2}>
                  <Typography variant='body1' component='h3'>
                    Requirement
                  </Typography>
                  <CeMatchClause
                    control={control}
                    setValue={setValue}
                    index={index}
                    clientItems={clientItems}
                    psdeFields={psdeFields}
                    customAssessmentForms={customAssessmentForms}
                  />
                </Stack>
              </RemovableCard>
            </Fragment>
          ))}
        </CardGroup>
      )}
    </Stack>
  );
};

export default CeMatchStructuredExpressionBuilder;
