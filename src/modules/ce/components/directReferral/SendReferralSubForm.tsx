import { useState } from 'react';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import { emptyErrorState, ErrorState } from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { useGetDirectReferralFormQuery } from '@/types/gqlTypes';

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
      targetProjectId,
      sourceEnrollmentId,
      targetUnitGroupId,
    },
  });

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  console.log(setErrors);

  if (definitionError) throw definitionError;
  if (!definitionLoading && !formDefinition) {
    throw new Error(
      `Failed to find referral form definition for project ${targetProjectId}`
    );
  }

  return (
    <>
      {definitionLoading && (
        <LoadingSkeleton width={'100%'} count={1} sx={{ my: 2 }} />
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
    </>
  );
};

export default SendReferralSubForm;
