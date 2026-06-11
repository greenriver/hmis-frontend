import {
  Alert,
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
import {
  CeMatchRuleFormValues,
  booleanOperatorOptions,
  newDraftClause,
} from './ceMatchRuleUtil';
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

const StructuredExpressionBuilder: React.FC<Props> = ({
  control,
  setValue,
  validationError,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'structuredExpression.clauses',
    shouldUnregister: false,
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
        <Stack direction='row' alignItems='center' gap={1} flexWrap='wrap'>
          <Typography variant='body2' fontWeight={600}>
            Client must meet
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
          <Typography variant='body2' fontWeight={600}>
            of the following requirements
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
                <Typography variant='body2' fontWeight={600}>
                  {operator === CeMatchRuleBooleanOperator.And ? 'AND' : 'OR'}
                </Typography>
              )}
              <RemovableCard
                onRemove={() => remove(index)}
                removeTooltip='Remove Requirement'
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
