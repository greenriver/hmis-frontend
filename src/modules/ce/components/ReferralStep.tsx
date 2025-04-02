import { Divider, Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import StartCeReferralStepButton from '@/modules/ce/components/StartCeReferralStepButton';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import {
  createInitialValuesFromSavedValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStatus,
  CeReferralStepStatus,
  useGetCeReferralStepQuery,
  useSubmitCeReferralStepMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {}
const ReferralStep: React.FC<Props> = ({}) => {
  const { projectId, opportunityId, referralId, stepId } = useSafeParams() as {
    projectId: string;
    opportunityId: string;
    referralId: string;
    stepId: string;
  };
  const navigate = useNavigate();

  const {
    data: { ceReferralStep: step } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetCeReferralStepQuery({
    variables: {
      id: stepId,
    },
  });

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const [submit, { loading: submitLoading }] = useSubmitCeReferralStepMutation({
    onCompleted: (data) => {
      const errors = data.submitCeReferralStep?.errors;
      if (errors && errors.length > 0) {
        setErrors(partitionValidations(errors));
        return;
      }

      setErrors(emptyErrorState);

      const status = data.submitCeReferralStep?.referral?.status;
      const wayfind =
        status &&
        [CeReferralStatus.Rejected, CeReferralStatus.Accepted].includes(status);

      navigate({
        pathname: generateSafePath(ProjectDashboardRoutes.REFERRAL_STEPS, {
          projectId,
          opportunityId,
          referralId,
        }),
        search: wayfind
          ? new URLSearchParams({ wayfinding: 'true' }).toString()
          : undefined,
      });
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
    },
  });

  const { name, status, formDefinition, submittedValues } = step || {};

  const itemMap = useMemo(
    () => formDefinition && getItemMap(formDefinition.definition),
    [formDefinition]
  );

  const formState =
    itemMap &&
    submittedValues &&
    createInitialValuesFromSavedValues(itemMap, submittedValues);

  if (fetchLoading) return <Loading />;
  if (fetchError) throw fetchError;
  if (!step || !formDefinition) return <NotFound />;

  return (
    <CommonCard title={name}>
      <Stack gap={2}>
        <ReferralStepAssignee step={step} />
        <Divider />
        {status === CeReferralStepStatus.Available && (
          <StartCeReferralStepButton
            step={step}
            opportunityId={opportunityId}
            projectId={projectId}
            referralId={referralId}
          >
            Start Step
          </StartCeReferralStepButton>
        )}
        {status === CeReferralStepStatus.InProgress && (
          <DynamicForm
            definition={formDefinition.definition}
            onSubmit={({ valuesByLinkId, confirmed }) => {
              submit({
                variables: {
                  referralId: referralId,
                  stepId: stepId,
                  input: valuesByLinkId,
                  confirmed,
                },
              });
            }}
            errors={errors}
            loading={submitLoading}
            FormActionProps={{
              submitButtonText: 'Submit',
              noDiscard: true,
            }}
            initialValues={formState}
          />
        )}
        {status === CeReferralStepStatus.Completed && formState && (
          <DynamicView
            definition={formDefinition.definition}
            values={formState}
          />
        )}
      </Stack>
    </CommonCard>
  );
};

export default ReferralStep;
