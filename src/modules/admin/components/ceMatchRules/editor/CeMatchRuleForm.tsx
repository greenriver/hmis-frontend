import UnlockIcon from '@mui/icons-material/Lock';
import { Button, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import CeMatchExpressionModeSwitch from './CeMatchExpressionModeSwitch';
import {
  CeMatchRuleFormValues,
  defaultCeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import CeMatchRuleOwnerText from './CeMatchRuleOwnerText';
import CeMatchStructuredExpressionBuilder from './CeMatchStructuredExpressionBuilder';
import FreeTextExpressionEditor from './FreeTextExpressionEditor';
import CeMatchRuleConfirmationDialog from './impactWarnings/CeMatchRuleConfirmationDialog';
import useCeMatchRuleFormSubmission from './useCeMatchRuleFormSubmission';
import CodeTextBlock from '@/components/elements/CodeTextBlock';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import LoadingButton from '@/components/elements/LoadingButton';
import TitleCard from '@/components/elements/TitleCard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { hasErrors, hasOnlyWarnings } from '@/modules/errors/util';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import {
  CeMatchRuleDetailsFragment,
  CeMatchRuleOwnerType,
} from '@/types/gqlTypes';

interface Props {
  ownerType: CeMatchRuleOwnerType;
  ownerId?: string;
  ownerName?: string;
  ruleId?: string;
  initialValues?: CeMatchRuleFormValues;
  onSaved?: (rule: CeMatchRuleDetailsFragment) => void;
  onCancel?: VoidFunction;
  onDelete?: VoidFunction;
}

/**
 * The top-level CE match rule form component.
 * Renders the rule details in either editable or readonly mode.
 * Owns the RHF state to collect rule details and structured clauses,
 * and the mutation call to submit to the backend.
 */
const CeMatchRuleForm: React.FC<Props> = ({
  ownerType,
  ownerId,
  ownerName,
  ruleId,
  initialValues,
  onSaved = () => undefined,
  onCancel,
  onDelete,
}) => {
  // Initially, set the form to editable if this is a new rule
  const [editing, setEditing] = useState(!ruleId);

  const defaultValues = useMemo(
    () => initialValues || defaultCeMatchRuleFormValues(),
    [initialValues]
  );

  const { control, getValues, handleSubmit, reset, setValue, watch } =
    useForm<CeMatchRuleFormValues>({
      defaultValues,
    });

  // If the component remounts with different default values, reset the form
  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const { errorState, loading, submit, clearErrors } =
    useCeMatchRuleFormSubmission({
      ownerType,
      ownerId,
      ruleId,
      onSaved,
    });

  const mode = watch('mode');
  const displayValues = editing ? getValues() : defaultValues;
  const showWarningDialog = hasOnlyWarnings(errorState);

  const handleCancel = useCallback(() => {
    // If this was a new rule, call the onCancel callback
    if (!ruleId) {
      onCancel?.();
      return;
    }

    // If this is an existing rule, reset the form and exit edit mode
    clearErrors();
    reset(defaultValues);
    setEditing(false);
  }, [clearErrors, defaultValues, onCancel, reset, ruleId]);

  const handleUnlock = useCallback(() => {
    clearErrors();
    // Editable fields unregister when they unmount on cancel, so rehydrate
    // RHF state from the saved values before mounting them again.
    reset(defaultValues);
    setEditing(true);
  }, [clearErrors, defaultValues, reset]);

  return (
    <Stack gap={2}>
      <CeMatchRuleOwnerText
        ownerType={ownerType}
        ownerName={ownerName}
        ruleId={ruleId}
      />
      <TitleCard title='Rule Details' headerComponent='h2' padded>
        <Stack gap={2}>
          {editing && hasErrors(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
            </Stack>
          )}
          {editing && (
            <ControlledTextInput
              name='name'
              control={control}
              label={getRequiredLabel('Rule Name', true)}
              maxWidth={620}
              required
            />
          )}
          {!editing && (
            <CommonLabeledTextBlock title='Rule Name'>
              {displayValues.name}
            </CommonLabeledTextBlock>
          )}
        </Stack>
      </TitleCard>
      <TitleCard
        title='Eligibility Requirements'
        headerComponent='h2'
        padded
        actions={
          editing && (
            <CeMatchExpressionModeSwitch
              mode={mode}
              control={control}
              defaultValues={defaultValues}
              getValues={getValues}
              isNewRule={!ruleId}
              reset={reset}
              setValue={setValue}
            />
          )
        }
      >
        <Stack gap={2}>
          {editing && mode === 'structured' && (
            <CeMatchStructuredExpressionBuilder
              control={control}
              setValue={setValue}
            />
          )}
          {editing && mode === 'freeText' && (
            <FreeTextExpressionEditor control={control} />
          )}
          {!editing && (
            <CommonLabeledTextBlock title='Expression'>
              <CodeTextBlock sx={{ mt: 1 }}>
                {displayValues.freeTextExpression}
              </CodeTextBlock>
            </CommonLabeledTextBlock>
          )}
        </Stack>
      </TitleCard>
      <Stack direction='row' gap={2}>
        {editing && (
          <>
            <LoadingButton
              loading={loading}
              variant='contained'
              onClick={handleSubmit((values) => submit(values, false))}
            >
              Save Rule
            </LoadingButton>
            <Button variant='outlined' onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
        {!editing && (
          <Button
            startIcon={<UnlockIcon />}
            variant='contained'
            color='grayscale'
            onClick={handleUnlock}
            sx={{ fontWeight: 600, width: 'fit-content' }}
          >
            Unlock Rule
          </Button>
        )}
        {onDelete && (
          <Button variant='outlined' color='error' onClick={onDelete}>
            Delete Rule
          </Button>
        )}
      </Stack>
      {editing && showWarningDialog && (
        <CeMatchRuleConfirmationDialog
          errorState={errorState}
          loading={loading}
          onCancel={clearErrors}
          onConfirm={() => handleSubmit((values) => submit(values, true))()}
        />
      )}
    </Stack>
  );
};

export default CeMatchRuleForm;
