import { Alert, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
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
  onSuccess: VoidFunction;
}

const SendReferralSubForm: React.FC<Props> = ({
  sourceEnrollmentId,
  targetProjectId,
  targetUnitGroupId,
  onSuccess,
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
        onSuccess();
      },
      onError: (apolloError) => {
        setErrors({ ...emptyErrorState, apolloError });
      },
    });

  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ valuesByLinkId, valuesByFieldName, confirmed }) => {
      if (!formDefinition) return;

      submit({
        variables: {
          targetUnitGroupId,
          sourceEnrollmentId,
          valuesByLinkId,
          valuesByFieldName,
          confirmed,
          formDefinitionId: formDefinition.id,
        },
      });
    },
    [formDefinition, sourceEnrollmentId, submit, targetUnitGroupId]
  );

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
          onSubmit={handleSubmit}
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
