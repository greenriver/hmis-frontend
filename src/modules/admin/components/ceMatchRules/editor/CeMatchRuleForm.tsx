import { Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import CeMatchExpressionModeSwitch from './CeMatchExpressionModeSwitch';
import { CeMatchRuleFormValues, newDraftClause } from './ceMatchRuleFormUtil';
import CeMatchStructuredExpressionBuilder from './CeMatchStructuredExpressionBuilder';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
import CeMatchRuleConfirmationDialog from './impactWarnings/CeMatchRuleConfirmationDialog';
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
  CeMatchRuleBooleanOperator,
  CeMatchRuleDetailsFragment,
  CeMatchRuleInput,
  CeMatchRuleOwnerType,
  CeMatchRuleType,
  useCreateCeMatchRuleMutation,
} from '@/types/gqlTypes';

interface Props {
  ownerType: CeMatchRuleOwnerType;
  onSaved: (rule: CeMatchRuleDetailsFragment) => void;
  onCancel: VoidFunction;
}

const defaultCeMatchRuleFormValues = (): CeMatchRuleFormValues => ({
  name: '',
  mode: 'structured',
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator.And,
    clauses: [newDraftClause()],
  },
  freeTextExpression: '',
});

const buildCeMatchRuleInput = (
  {
    name,
    mode,
    structuredExpression,
    freeTextExpression,
  }: CeMatchRuleFormValues,
  ownerType?: CeMatchRuleOwnerType
): CeMatchRuleInput => {
  const base = {
    name: name.trim(),
    ownerType,
    ruleType: CeMatchRuleType.EligibilityRequirement,
  };

  if (mode === 'freeText') {
    return {
      ...base,
      expression: freeTextExpression.trim(),
    };
  }

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
const CeMatchRuleForm: React.FC<Props> = ({ ownerType, onSaved, onCancel }) => {
  const { control, handleSubmit, reset, setValue, watch } =
    useForm<CeMatchRuleFormValues>({
      defaultValues: defaultCeMatchRuleFormValues(),
    });

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const mode = watch('mode');

  const [createCeMatchRule, { loading }] = useCreateCeMatchRuleMutation({
    onCompleted: (data) => {
      const payload = data.createCeMatchRule;
      if (payload?.rule) {
        setErrorState(emptyErrorState);
        reset(defaultCeMatchRuleFormValues());
        onSaved?.(payload.rule);
      } else if (payload?.errors?.length) {
        setErrorState(partitionValidations(payload.errors));
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  const handleValidSubmit = (
    values: CeMatchRuleFormValues,
    confirmed = false
  ) => {
    createCeMatchRule({
      variables: {
        input: buildCeMatchRuleInput(values, ownerType),
        confirmed,
      },
    });
  };

  const showWarningDialog = hasOnlyWarnings(errorState);

  const ownerContext = useMemo(() => {
    if (ownerType === CeMatchRuleOwnerType.DataSource) {
      return 'This global eligibility rule will apply to all units.';
    }
  }, [ownerType]);

  return (
    <Stack gap={2}>
      {ownerContext && <Typography variant='body2'>{ownerContext}</Typography>}
      <TitleCard title='Rule Details' headerComponent='h2' padded>
        <Stack gap={2}>
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
            control={control}
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
          onClick={handleSubmit((values) => handleValidSubmit(values, false))}
        >
          Save Rule
        </LoadingButton>
        <Button variant='outlined' onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
      {showWarningDialog && (
        <CeMatchRuleConfirmationDialog
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
