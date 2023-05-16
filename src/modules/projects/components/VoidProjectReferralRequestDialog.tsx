import { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { cache } from '@/providers/apolloClient';
import {
  ProjectAllFieldsFragment,
  ReferralRequestFieldsFragment,
  ValidationError,
  useVoidReferralRequestMutation,
} from '@/types/gqlTypes';

interface Props {
  project: ProjectAllFieldsFragment;
  referralRequest: ReferralRequestFieldsFragment;
  onClose: VoidFunction;
}

const clearCache = (projectId: string) => {
  cache.evict({
    id: `Project:${projectId}`,
    fieldName: 'referralRequests',
  });
};

const VoidProjectReferralRequestDialog: React.FC<Props> = ({
  project,
  referralRequest,
  onClose,
}) => {
  const [mutate, { loading, error }] = useVoidReferralRequestMutation();
  const { id: referralRequestId } = referralRequest;
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const handleConfirm = useCallback(() => {
    if (referralRequestId) {
      setErrors([]);
      mutate({ variables: { id: referralRequestId } }).then((result) => {
        const errors = result.data?.voidReferralRequest?.errors;
        if (errors?.length) {
          setErrors(errors);
        } else {
          clearCache(project.id);
          onClose();
        }
      });
    }
  }, [referralRequestId, mutate, onClose, project.id]);
  return (
    <ConfirmationDialog
      id='voidReferral'
      open={true}
      title='Cancel Referral Request'
      onConfirm={handleConfirm}
      onCancel={onClose}
      loading={loading}
      color='error'
      confirmText='Confirm Cancellation'
    >
      {error && <ApolloErrorAlert error={error} />}
      <ErrorAlert errors={errors} />

      <p>{`This will cancel the referral request at ${project.projectName} for ${referralRequest.unitType.description} requested by ${referralRequest.requestorName} for the estimated date needed of ${referralRequest.neededBy}.`}</p>
    </ConfirmationDialog>
  );
};
export default VoidProjectReferralRequestDialog;
