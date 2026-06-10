import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Stack } from '@mui/material';
import { useMemo } from 'react';

import CeMatchClauseRow from './CeMatchClauseRow';
import {
  CeMatchDraftClause,
  booleanOperatorOptions,
  newDraftClause,
} from './ceMatchRuleUtil';
import Loading from '@/components/elements/Loading';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  CeMatchRuleBooleanOperator,
  PickListOption,
  useGetCeMatchClientFieldsQuery,
  useGetCeMatchCustomAssessmentFormsQuery,
} from '@/types/gqlTypes';

const singleOption = (option: PickListOption | PickListOption[] | null) =>
  Array.isArray(option) ? option[0] : option;

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

  const operatorValue = useMemo(
    () =>
      booleanOperatorOptions.find((option) => option.code === operator) || null,
    [operator]
  );

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
      {clauses.length > 1 && (
        <Box sx={{ maxWidth: 300 }}>
          <FormSelect
            label='Combine Conditions'
            options={booleanOperatorOptions}
            value={operatorValue}
            onChange={(_, rawOption) => {
              const option = singleOption(rawOption);
              onChangeOperator(
                ((option?.code as CeMatchRuleBooleanOperator | undefined) ||
                  CeMatchRuleBooleanOperator.And) as CeMatchRuleBooleanOperator
              );
            }}
          />
        </Box>
      )}
      {loading && <Loading />}
      {!loading &&
        clauses.map((clause) => (
          <CeMatchClauseRow
            key={clause.id}
            clause={clause}
            clientItems={clientItems}
            customAssessmentForms={customAssessmentForms}
            onChange={replaceClause}
            onRemove={() =>
              onChangeClauses(clauses.filter(({ id }) => id !== clause.id))
            }
            canRemove={clauses.length > 1}
          />
        ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => onChangeClauses([...clauses, newDraftClause()])}
        sx={{ width: 'fit-content' }}
      >
        Add Condition
      </Button>
    </Stack>
  );
};

export default StructuredExpressionBuilder;
