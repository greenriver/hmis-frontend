import CodeIcon from '@mui/icons-material/Code';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  CeMatchExpressionMode,
  CeMatchRuleFormValues,
  newDraftClause,
} from './ceMatchRuleFormUtil';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
import StructuredExpressionBuilder from './StructuredExpressionBuilder';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import LoadingButton from '@/components/elements/LoadingButton';
import TitleCard from '@/components/elements/TitleCard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  hasErrors,
  partitionValidations,
} from '@/modules/errors/util';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleInput,
  useCreateCeMatchRuleMutation,
} from '@/types/gqlTypes';

const defaultCeMatchRuleFormValues = (): CeMatchRuleFormValues => ({
  name: '',
  mode: 'structured',
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator.And,
    clauses: [newDraftClause()],
  },
  freeTextExpression: '',
});

const hasValue = (value?: string | null) => !!value?.trim();

const hasExpressionProgress = ({
  mode,
  structuredExpression,
  freeTextExpression,
}: CeMatchRuleFormValues) => {
  if (mode === 'freeText') return hasValue(freeTextExpression);

  return (
    structuredExpression.clauses.length > 1 ||
    structuredExpression.operator !== CeMatchRuleBooleanOperator.And ||
    structuredExpression.clauses.some(
      ({ source, customAssessmentFormIdentifier, field, value }) =>
        hasValue(source) ||
        hasValue(customAssessmentFormIdentifier) ||
        hasValue(field) ||
        hasValue(value)
    )
  );
};

const buildCeMatchRuleInput = ({
  name,
  mode,
  structuredExpression,
  freeTextExpression,
}: CeMatchRuleFormValues): CeMatchRuleInput => {
  const base = {
    name: name.trim(),
    ruleType: 'eligibility_requirement',
  };

  if (mode === 'freeText') {
    return {
      ...base,
      expression: freeTextExpression.trim(),
    };
  }

  return {
    ...base,
    structuredExpression: {
      operator: structuredExpression.operator,
      clauses: structuredExpression.clauses.map(
        // Strip out unneeded fields from the draft clause
        ({ field, comparator, value }) => ({
          field,
          comparator,
          value,
        })
      ),
    },
  };
};

/**
 * The top-level CE match rule form component.
 * Owns the RHF state to collect rule details and structured clauses,
 * and the mutation call to submit to the backend.
 */
const CeMatchRuleForm = () => {
  const { control, getValues, handleSubmit, reset, setValue, watch } =
    useForm<CeMatchRuleFormValues>({
      defaultValues: defaultCeMatchRuleFormValues(),
    });

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [saved, setSaved] = useState(false);
  const [pendingMode, setPendingMode] = useState<CeMatchExpressionMode>();
  const mode = watch('mode');

  const resetForm = () => {
    setErrorState(emptyErrorState);
    setSaved(false);
    reset(defaultCeMatchRuleFormValues());
  };

  const [createCeMatchRule, { loading }] = useCreateCeMatchRuleMutation({
    onCompleted: (data) => {
      const payload = data.createCeMatchRule;
      if (payload?.rule) {
        setErrorState(emptyErrorState);
        setSaved(true);
        reset(defaultCeMatchRuleFormValues());
      } else if (payload?.errors?.length) {
        setErrorState(partitionValidations(payload.errors));
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  const handleValidSubmit = (
    values: CeMatchRuleFormValues,
    confirmed = true
  ) => {
    setSaved(false);

    createCeMatchRule({
      variables: {
        input: buildCeMatchRuleInput(values),
        confirmed,
      },
    });
  };

  const switchEditorMode = (nextMode: CeMatchExpressionMode) => {
    setValue('mode', nextMode, { shouldDirty: true });
    setPendingMode(undefined);
  };

  const handleSwitchEditorMode = () => {
    const nextMode = mode === 'structured' ? 'freeText' : 'structured';
    if (hasExpressionProgress(getValues())) {
      setPendingMode(nextMode);
      return;
    }

    switchEditorMode(nextMode);
  };

  return (
    <Stack gap={2}>
      <ConfirmationDialog
        id='confirmSwitchExpressionEditor'
        open={!!pendingMode}
        title='Switch Expression Editor?'
        loading={false}
        confirmText='Switch Editor'
        onConfirm={() => pendingMode && switchEditorMode(pendingMode)}
        onCancel={() => setPendingMode(undefined)}
      >
        <Typography variant='body2'>
          Switching editors will clear your current progress.
        </Typography>
      </ConfirmationDialog>
      <TitleCard title='Rule Details' headerComponent='h2' padded>
        <Stack gap={2}>
          {saved && <Alert severity='success'>Match rule saved.</Alert>}
          {hasErrors(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
            </Stack>
          )}
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
        title='Eligibility Requirements'
        headerComponent='h2'
        padded
        actions={
          <Button
            size='small'
            variant='text'
            startIcon={<CodeIcon />}
            onClick={handleSwitchEditorMode}
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
          onClick={handleSubmit((values) => handleValidSubmit(values))}
        >
          Save Rule
        </LoadingButton>
        <Button variant='outlined' onClick={resetForm}>
          Discard
        </Button>
      </Stack>
    </Stack>
  );
};

export default CeMatchRuleForm;
