import { Alert, Stack } from '@mui/material';
import { useState } from 'react';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import { emptyErrorState, ErrorState } from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import {
  ReferralMode,
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
  console.log(setErrors);

  const { data: { projectCanAcceptReferral } = {} } =
    useGetProjectCanAcceptReferralQuery({
      variables: {
        destinationProjectId: targetProjectId,
        sourceEnrollmentId,
        referralMode: ReferralMode.CoordinatedEntry,
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
          onSubmit={() => {
            console.log('submitting');
          }}
          errors={errors}
          // loading={submitLoading}
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
