import CodeIcon from '@mui/icons-material/Code';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { CeMatchDraftClause, newDraftClause } from './ceMatchRuleUtil';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
import ImpactConfirmDialog from './ImpactConfirmDialog';
import StructuredExpressionBuilder from './StructuredExpressionBuilder';
import TextInput from '@/components/elements/input/TextInput';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  hasErrors,
  hasOnlyWarnings,
  partitionValidations,
} from '@/modules/errors/util';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleInput,
  useCreateCeMatchRuleMutation,
} from '@/types/gqlTypes';

type ExpressionMode = 'structured' | 'freeText';

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && value !== '';

const validateStructuredClauses = (clauses: CeMatchDraftClause[]) => {
  if (clauses.length === 0) return 'Add at least one condition.';

  const incomplete = clauses.some(
    (clause) =>
      !clause.source ||
      !clause.field ||
      !clause.comparator ||
      !hasValue(clause.value)
  );
  if (incomplete) return 'Complete every condition before saving.';
};

const CeMatchRuleForm = () => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<ExpressionMode>('structured');
  const [operator, setOperator] = useState<CeMatchRuleBooleanOperator>(
    CeMatchRuleBooleanOperator.And
  );
  const [clauses, setClauses] = useState<CeMatchDraftClause[]>([
    newDraftClause(),
  ]);
  const [freeTextExpression, setFreeTextExpression] = useState('');
  const [localError, setLocalError] = useState<string>();
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [saved, setSaved] = useState(false);

  const resetForm = () => {
    setName('');
    setFreeTextExpression('');
    setLocalError(undefined);
    setErrorState(emptyErrorState);
    setSaved(false);
    setMode('structured');
    setOperator(CeMatchRuleBooleanOperator.And);
    setClauses([newDraftClause()]);
  };

  const input = useMemo<CeMatchRuleInput>(() => {
    const base = {
      name,
      ruleType: 'eligibility_requirement',
    };

    if (mode === 'freeText') {
      return {
        ...base,
        expression: freeTextExpression,
      };
    }

    return {
      ...base,
      structuredExpression: {
        operator,
        clauses: clauses.map(({ field, comparator, value }) => ({
          field,
          comparator,
          value,
        })),
      },
    };
  }, [clauses, freeTextExpression, mode, name, operator]);

  const [createCeMatchRule, { loading }] = useCreateCeMatchRuleMutation({
    onCompleted: (data) => {
      const payload = data.createCeMatchRule;
      if (payload?.rule) {
        setErrorState(emptyErrorState);
        setLocalError(undefined);
        setSaved(true);
        setName('');
        setFreeTextExpression('');
        setOperator(CeMatchRuleBooleanOperator.And);
        setClauses([newDraftClause()]);
      } else if (payload?.errors?.length) {
        setErrorState(partitionValidations(payload.errors));
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  const validate = () => {
    if (!name.trim()) return 'Rule name is required.';
    if (mode === 'freeText' && !freeTextExpression.trim()) {
      return 'Expression is required.';
    }
    if (mode === 'structured') return validateStructuredClauses(clauses);
  };

  const handleSubmit = (confirmed = false) => {
    const error = validate();
    setLocalError(error);
    setSaved(false);
    if (error) return;

    createCeMatchRule({
      variables: {
        input,
        confirmed,
      },
    });
  };

  const showWarningDialog = hasOnlyWarnings(errorState);

  return (
    <Stack gap={2}>
      <Paper sx={{ py: 3, px: 2.5 }}>
        <Stack gap={2}>
          {saved && <Alert severity='success'>Match rule saved.</Alert>}
          {hasErrors(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
            </Stack>
          )}
          {localError && <Alert severity='error'>{localError}</Alert>}
          <Typography variant='cardTitle' component='h2'>
            Rule Details
          </Typography>
          <TextInput
            label={getRequiredLabel('Rule Name', true)}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxWidth={620}
          />
        </Stack>
      </Paper>
      <Paper sx={{ py: 3, px: 2.5 }}>
        <Stack gap={2}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            gap={2}
          >
            <Typography variant='cardTitle' component='h2'>
              Build rule
            </Typography>
            <Button
              size='small'
              variant='text'
              startIcon={<CodeIcon />}
              onClick={() =>
                setMode(mode === 'structured' ? 'freeText' : 'structured')
              }
            >
              {mode === 'structured'
                ? 'Switch to Advanced Expression Editor'
                : 'Switch to Structured Editor'}
            </Button>
          </Stack>
          {mode === 'structured' ? (
            <StructuredExpressionBuilder
              clauses={clauses}
              operator={operator}
              onChangeClauses={setClauses}
              onChangeOperator={setOperator}
            />
          ) : (
            <FreeTextExpressionEditor
              value={freeTextExpression}
              onChange={setFreeTextExpression}
            />
          )}
        </Stack>
      </Paper>
      <Stack direction='row' gap={2}>
        <LoadingButton
          loading={loading}
          variant='contained'
          onClick={() => handleSubmit(false)}
        >
          Save
        </LoadingButton>
        <Button variant='outlined' onClick={resetForm}>
          Reset
        </Button>
      </Stack>
      {showWarningDialog && (
        <ImpactConfirmDialog
          errorState={errorState}
          loading={loading}
          onCancel={() => setErrorState(emptyErrorState)}
          onConfirm={() => handleSubmit(true)}
        />
      )}
    </Stack>
  );
};

export default CeMatchRuleForm;
