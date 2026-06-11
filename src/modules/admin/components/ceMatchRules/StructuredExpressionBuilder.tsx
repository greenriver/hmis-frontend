import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';

import CeMatchClauseRow from './CeMatchClauseRow';
import {
  CeMatchDraftClause,
  booleanOperatorOptions,
  newDraftClause,
} from './ceMatchRuleUtil';
import Loading from '@/components/elements/Loading';
import {
  CeMatchRuleBooleanOperator,
  useGetCeMatchClientFieldsQuery,
  useGetCeMatchCustomAssessmentFormsQuery,
} from '@/types/gqlTypes';

interface Props {
  clauses: CeMatchDraftClause[];
  operator: CeMatchRuleBooleanOperator;
  onChangeClauses: (clauses: CeMatchDraftClause[]) => void;
  onChangeOperator: (operator: CeMatchRuleBooleanOperator) => void;
  validationError?: string;
}

const StructuredExpressionBuilder: React.FC<Props> = ({
  clauses,
  operator,
  onChangeClauses,
  onChangeOperator,
  validationError,
}) => {
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

  const replaceClause = (nextClause: CeMatchDraftClause) => {
    onChangeClauses(
      clauses.map((clause) =>
        clause.id === nextClause.id ? nextClause : clause
      )
    );
  };

  if (clientItemsError) throw clientItemsError;
  if (customAssessmentFormsError) throw customAssessmentFormsError;

  return (
    <Stack gap={2}>
      {validationError && <Alert severity='error'>{validationError}</Alert>}
      <Stack gap={1}>
        <Stack direction='row' alignItems='center' gap={1} flexWrap='wrap'>
          <Typography variant='body2' fontWeight={600}>
            Client must meet
          </Typography>
          <RadioGroup
            row
            value={operator}
            onChange={(event) =>
              onChangeOperator(event.target.value as CeMatchRuleBooleanOperator)
            }
          >
            {booleanOperatorOptions.map((option) => (
              <FormControlLabel
                key={option.code}
                value={option.code}
                control={<Radio size='small' />}
                label={<strong>{option.label}</strong>}
              />
            ))}
          </RadioGroup>
          <Typography variant='body2' fontWeight={600}>
            of the following requirements
          </Typography>
        </Stack>
      </Stack>
      {loading && <Loading />}
      {!loading &&
        clauses.map((clause, index) => (
          <Fragment key={clause.id}>
            {index > 0 && (
              <Typography variant='body2' fontWeight={600}>
                {operator === CeMatchRuleBooleanOperator.And ? 'AND' : 'OR'}
              </Typography>
            )}
            <CeMatchClauseRow
              clause={clause}
              index={index}
              clientItems={clientItems}
              customAssessmentForms={customAssessmentForms}
              onChange={replaceClause}
              onRemove={() =>
                onChangeClauses(clauses.filter(({ id }) => id !== clause.id))
              }
              canRemove={clauses.length > 1}
            />
          </Fragment>
        ))}
      <Button
        startIcon={<AddIcon />}
        variant='outlined'
        onClick={() => onChangeClauses([...clauses, newDraftClause()])}
        sx={{ width: 'fit-content' }}
      >
        Add Requirement
      </Button>
    </Stack>
  );
};

export default StructuredExpressionBuilder;
