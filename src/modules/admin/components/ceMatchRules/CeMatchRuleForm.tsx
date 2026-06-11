import CodeIcon from '@mui/icons-material/Code';
import { Alert, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  CeMatchDraftClause,
  CeMatchRuleFormValues,
  defaultCeMatchRuleFormValues,
} from './ceMatchRuleUtil';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
import ImpactConfirmDialog from './ImpactConfirmDialog';
import StructuredExpressionBuilder from './StructuredExpressionBuilder';
import LoadingButton from '@/components/elements/LoadingButton';
import TitleCard from '@/components/elements/TitleCard';
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
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import {
  CeMatchRuleInput,
  useCreateCeMatchRuleMutation,
} from '@/types/gqlTypes';

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

const buildCeMatchRuleInput = ({
  name,
  mode,
  structuredExpression,
  freeTextExpression,
}: CeMatchRuleFormValues): CeMatchRuleInput => {
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
      operator: structuredExpression.operator,
      clauses: structuredExpression.clauses.map(
        ({ field, comparator, value }) => ({
          field,
          comparator,
          value,
        })
      ),
    },
  };
};

const CeMatchRuleForm = () => {
  const { control, handleSubmit, reset, setValue, watch } =
    useForm<CeMatchRuleFormValues>({
      defaultValues: defaultCeMatchRuleFormValues(),
    });

  const [localError, setLocalError] = useState<string>();
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [saved, setSaved] = useState(false);
  const mode = watch('mode');

  const resetForm = () => {
    setLocalError(undefined);
    setErrorState(emptyErrorState);
    setSaved(false);
    reset(defaultCeMatchRuleFormValues());
  };

  const [createCeMatchRule, { loading }] = useCreateCeMatchRuleMutation({
    onCompleted: (data) => {
      const payload = data.createCeMatchRule;
      if (payload?.rule) {
        setErrorState(emptyErrorState);
        setLocalError(undefined);
        setSaved(true);
        reset(defaultCeMatchRuleFormValues());
      } else if (payload?.errors?.length) {
        setErrorState(partitionValidations(payload.errors));
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  const validate = (values: CeMatchRuleFormValues) => {
    if (!values.name.trim()) return 'Rule name is required.';
    if (values.mode === 'freeText' && !values.freeTextExpression.trim()) {
      return 'Expression is required.';
    }
    if (values.mode === 'structured') {
      return validateStructuredClauses(values.structuredExpression.clauses);
    }
  };

  const handleValidSubmit = (
    values: CeMatchRuleFormValues,
    confirmed = false
  ) => {
    const error = validate(values);
    setLocalError(error);
    setSaved(false);
    if (error) return;

    createCeMatchRule({
      variables: {
        input: buildCeMatchRuleInput(values),
        confirmed,
      },
    });
  };

  const showWarningDialog = hasOnlyWarnings(errorState);

  return (
    <Stack gap={2}>
      <TitleCard title='Rule Details' headerComponent='h2' padded>
        <Stack gap={2}>
          {saved && <Alert severity='success'>Match rule saved.</Alert>}
          {hasErrors(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
            </Stack>
          )}
          {localError && <Alert severity='error'>{localError}</Alert>}
          <ControlledTextInput
            name='name'
            control={control}
            label={getRequiredLabel('Rule Name', true)}
            maxWidth={620}
            required
          />
        </Stack>
      </TitleCard>
      <TitleCard
        title='Build rule'
        headerComponent='h2'
        padded
        actions={
          <Button
            size='small'
            variant='text'
            startIcon={<CodeIcon />}
            onClick={() =>
              setValue(
                'mode',
                mode === 'structured' ? 'freeText' : 'structured',
                { shouldDirty: true }
              )
            }
          >
            {mode === 'structured'
              ? 'Switch to Advanced Expression Editor'
              : 'Switch to Structured Editor'}
          </Button>
        }
      >
        <Stack gap={2}>
          {mode === 'structured' ? (
            <StructuredExpressionBuilder
              control={control}
              setValue={setValue}
            />
          ) : (
            <FreeTextExpressionEditor control={control} />
          )}
        </Stack>
      </TitleCard>
      <Stack direction='row' gap={2}>
        <LoadingButton
          loading={loading}
          variant='contained'
          onClick={handleSubmit((values) => handleValidSubmit(values, false))}
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
          onConfirm={() =>
            handleSubmit((values) => handleValidSubmit(values, true))()
          }
        />
      )}
    </Stack>
  );
};

export default CeMatchRuleForm;
