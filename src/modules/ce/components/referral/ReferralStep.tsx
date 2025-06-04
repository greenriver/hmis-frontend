import { Box, Divider, Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReferralStepDetails from './ReferralStepDetails';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import { BackIcon } from '@/components/elements/SemanticIcons';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/referral/ReferralPage';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { FormActionTypes } from '@/modules/form/types';
import {
  createInitialValuesFromSavedValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import {
  CeReferralStatus,
  CeReferralStepStatus,
  useGetCeReferralStepQuery,
  useSubmitCeReferralStepMutation,
} from '@/types/gqlTypes';

interface Props {}
const ReferralStep: React.FC<Props> = ({}) => {
  const { referralId, stepId } = useSafeParams() as {
    referralId: string;
    stepId: string;
  };
  const { referralPath } = useReferralContext();
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
        pathname: referralPath,
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

  const editable =
    status === CeReferralStepStatus.InProgress && step?.access.canPerformStep;

  if (fetchLoading) return <Loading />;
  if (fetchError) throw fetchError;
  if (!step || !formDefinition) return <NotFound />;

  if (
    [CeReferralStepStatus.Unavailable, CeReferralStepStatus.Available].includes(
      step.status
    )
  ) {
    // The step has to be started from the Referral Steps page
    return <NotFound />;
  }

  return (
    <Stack direction='column' gap={2}>
      <Box sx={{ alignSelf: 'start' }}>
        <ButtonLink variant='text' startIcon={<BackIcon />} to={referralPath}>
          Back to All Tasks
        </ButtonLink>
      </Box>
      <CommonCard title={name}>
        <Stack gap={2}>
          <ReferralStepDetails step={step} />
          <Divider />
          {editable ? (
            <DynamicForm
              definition={formDefinition.definition}
              onSubmit={({ valuesByLinkId, confirmed }) => {
                submit({
                  variables: {
                    referralId: referralId,
                    stepId: stepId,
                    input: valuesByLinkId,
                    formDefinitionId: formDefinition.id,
                    confirmed,
                  },
                });
              }}
              errors={errors}
              loading={submitLoading}
              FormActionProps={{
                config: [
                  {
                    id: 'submit',
                    label: 'Submit',
                    action: FormActionTypes.Submit,
                    buttonProps: { variant: 'contained' },
                  },
                ],
              }}
              initialValues={formState}
            />
          ) : (
            <DynamicView
              definition={formDefinition.definition}
              values={formState}
            />
          )}
        </Stack>
      </CommonCard>
    </Stack>
  );
};

export default ReferralStep;
