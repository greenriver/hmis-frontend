import { Alert, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import CeMatchExpressionModeSwitch from './CeMatchExpressionModeSwitch';
import { CeMatchRuleFormValues, newDraftClause } from './ceMatchRuleFormUtil';
import CeMatchStructuredExpressionBuilder from './CeMatchStructuredExpressionBuilder';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
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

  return (
    <Stack gap={2}>
      <TitleCard title='Rule Details' headerComponent='h2' padded>
        <Stack gap={2}>
          {saved && <Alert severity='success'>Eligibility rule saved.</Alert>}
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
          <CeMatchExpressionModeSwitch
            mode={mode}
            getValues={getValues}
            setValue={setValue}
          />
        }
      >
        <Stack gap={2}>
          {mode === 'structured' ? (
            <CeMatchStructuredExpressionBuilder
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
