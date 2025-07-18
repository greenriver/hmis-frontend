import { Alert, Stack } from '@mui/material';
import { useState } from 'react';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import {
  ReferralMode,
  useCreateDirectCeReferralMutation,
  useGetDirectReferralFormQuery,
  useGetProjectCanAcceptReferralQuery,
} from '@/types/gqlTypes';

interface Props {
  sourceEnrollmentId: string;
  targetProjectId: string;
  targetUnitGroupId: string;
  onSuccess: () => void;
}

const SendReferralSubForm: React.FC<Props> = ({
  sourceEnrollmentId,
  targetProjectId,
  targetUnitGroupId,
  // onSuccess,
}) => {
  const {
    data: { directReferralForm: formDefinition } = {},
    loading: definitionLoading,
    error: definitionError,
  } = useGetDirectReferralFormQuery({
    variables: {
      sourceEnrollmentId,
      targetUnitGroupId,
    },
  });

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const { data: { projectCanAcceptReferral } = {} } =
    useGetProjectCanAcceptReferralQuery({
      variables: {
        destinationProjectId: targetProjectId,
        sourceEnrollmentId,
        referralMode: ReferralMode.CoordinatedEntry,
      },
    });

  const [submit, { loading: submitLoading }] =
    useCreateDirectCeReferralMutation({
      onCompleted: (data) => {
        const errors = data.createDirectCeReferral?.errors;
        if (errors && errors.length > 0) {
          setErrors(partitionValidations(errors));
          return;
        }

        setErrors(emptyErrorState);

        // todo @martha- show success
        console.log(data);
        //
        // const status = data.submitCeReferralStep?.referral?.status;
        // const wayfind =
        //   status &&
        //   [CeReferralStatus.Rejected, CeReferralStatus.Accepted].includes(status);
        //
        // navigate({
        //   pathname: referralPath,
        //   search: wayfind
        //     ? new URLSearchParams({ wayfinding: 'true' }).toString()
        //     : undefined,
        // });
      },
      onError: (apolloError) => {
        setErrors({ ...emptyErrorState, apolloError });
      },
    });

  if (definitionError) throw definitionError;
  if (!definitionLoading && !formDefinition) {
    throw new Error(
      `Failed to find referral form definition for project ${targetProjectId}`
    );
  }

  return (
    <Stack gap={2}>
      {definitionLoading && <LoadingSkeleton width={'100%'} count={1} />}
      {projectCanAcceptReferral === false && (
        <Alert severity='warning'>
          At least one client in the household already has an open enrollment in
          this project.
        </Alert>
      )}
      {formDefinition && (
        <DynamicForm
          definition={formDefinition.definition}
          // todo @martha - move this up
          onSubmit={({ valuesByLinkId, confirmed }) => {
            submit({
              variables: {
                targetUnitGroupId,
                sourceEnrollmentId,
                input: valuesByLinkId,
                confirmed,
                formDefinitionId: formDefinition.id,
              },
            });
          }}
          loading={submitLoading}
          errors={errors}
          FormActionProps={{
            submitButtonText: 'Refer Household',
            discardButtonText: 'Cancel',
          }}
        />
      )}
    </Stack>
  );
};

export default SendReferralSubForm;
