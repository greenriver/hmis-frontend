import { Alert, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CeMatchRuleFormValues, newDraftClause } from './ceMatchRuleFormUtil';
import StructuredExpressionBuilder from './StructuredExpressionBuilder';
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
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator.And,
    clauses: [newDraftClause()],
  },
});

const buildCeMatchRuleInput = ({
  name,
  structuredExpression,
}: CeMatchRuleFormValues): CeMatchRuleInput => {
  const base = {
    name: name.trim(),
    ruleType: 'eligibility_requirement',
  };

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
  const { control, handleSubmit, reset, setValue } =
    useForm<CeMatchRuleFormValues>({
      defaultValues: defaultCeMatchRuleFormValues(),
    });

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [saved, setSaved] = useState(false);

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
      <TitleCard title='Eligibility Requirements' headerComponent='h2' padded>
        <Stack gap={2}>
          <StructuredExpressionBuilder control={control} setValue={setValue} />
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
