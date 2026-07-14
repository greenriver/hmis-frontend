import UnlockIcon from '@mui/icons-material/Lock';
import { Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  ceMatchRuleOwnerLevelConfigs,
  getCeMatchRuleOwnerLevelByOwnerType,
} from '../ceMatchRuleOwnerLevelConfig';
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
import ControlledMultiSelect from '@/modules/form/components/rhf/ControlledMultiSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { HmisEnums } from '@/types/gqlEnums';
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
  onCancel?: VoidFunction;
  onDelete?: VoidFunction;
}

const projectTypeOptions = localResolvePickList('ProjectType') || [];
const funderOptions = localResolvePickList('FundingSource') || [];

const formatApplicabilityValues = (
  values: readonly string[],
  labels: Record<string, string>,
  emptyLabel: string
) => {
  if (!values.length) return emptyLabel;

  return values.map((value) => labels[value] || value).join(', ');
};

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
  onCancel,
  onDelete,
}) => {
  const navigate = useNavigate();

  // Initially, set the form to editable if this is a new rule
  const [editing, setEditing] = useState(!ruleId);

  const defaultValues = useMemo(
    () => initialValues || defaultCeMatchRuleFormValues(),
    [initialValues]
  );

  const {
    control,
    formState: { dirtyFields },
    getValues,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<CeMatchRuleFormValues>({
    defaultValues,
  });

  // If the component remounts with different default values, reset the form
  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const handleSaved = useCallback(
    (rule: CeMatchRuleDetailsFragment) => {
      // After saving, lock the form
      setEditing(false);

      // If this was a new rule, navigate to the rule detail page (the locked form)
      if (!ruleId) {
        const ownerLevel = getCeMatchRuleOwnerLevelByOwnerType(rule.ownerType);
        const rulePath = ceMatchRuleOwnerLevelConfigs[ownerLevel].getRulePath({
          ownerId: rule.ownerId,
          ruleId: rule.id,
        });

        if (rulePath) navigate(rulePath);
      }
    },
    [navigate, ruleId]
  );

  const { errorState, loading, submit, clearErrors } =
    useCeMatchRuleFormSubmission({
      ownerType,
      ownerId,
      ruleId,
      onSaved: handleSaved,
    });

  const mode = watch('mode');
  const displayValues = editing ? getValues() : defaultValues;
  const showWarningDialog = hasOnlyWarnings(errorState);
  const expressionDirty =
    !!dirtyFields.freeTextExpression || !!dirtyFields.structuredExpression;
  const applicabilityDirty =
    !!dirtyFields.projectTypes || !!dirtyFields.funders;
  const showApplicabilityCard = ownerType === CeMatchRuleOwnerType.DataSource;

  const handleCancel = useCallback(() => {
    // If this was a new rule, call the onCancel callback
    if (!ruleId) {
      onCancel?.();
      return;
    }

    // If this is an existing rule, just exit edit mode
    setEditing(false);
  }, [onCancel, ruleId]);

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
      {showApplicabilityCard && (
        <TitleCard title='Applies To' headerComponent='h2' padded>
          <Typography variant='body2' mt={-2} mb={1}>
            This rule will only be evaluated for projects matching the selected
            funders and project types.
          </Typography>
          <Stack gap={2}>
            {editing && (
              <>
                <ControlledMultiSelect
                  name='funders'
                  control={control}
                  label='Funders'
                  options={funderOptions}
                  placeholder='All funders'
                />
                <ControlledMultiSelect
                  name='projectTypes'
                  control={control}
                  label='Project Types'
                  options={projectTypeOptions}
                  placeholder='All project types'
                />
              </>
            )}
            {!editing && (
              <>
                <CommonLabeledTextBlock title='Funders'>
                  {formatApplicabilityValues(
                    displayValues.funders,
                    HmisEnums.FundingSource,
                    'All funders'
                  )}
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Project Types'>
                  {formatApplicabilityValues(
                    displayValues.projectTypes,
                    HmisEnums.ProjectType,
                    'All project types'
                  )}
                </CommonLabeledTextBlock>
              </>
            )}
          </Stack>
        </TitleCard>
      )}
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
              onClick={handleSubmit((values) =>
                submit(values, { expressionDirty, applicabilityDirty })
              )}
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
          onConfirm={() =>
            handleSubmit((values) =>
              submit(values, {
                confirmed: true,
                expressionDirty,
                applicabilityDirty,
              })
            )()
          }
        />
      )}
    </Stack>
  );
};

export default CeMatchRuleForm;
