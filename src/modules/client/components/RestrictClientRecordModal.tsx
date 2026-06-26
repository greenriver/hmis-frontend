import { Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { useSetClientRestrictedMutation } from '@/types/gqlTypes';

export type RestrictClientRecordModalMode = 'restrict' | 'remove';

interface Props {
  clientId: string;
  lockVersion: number;
  mode: RestrictClientRecordModalMode | null;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
}

const MODAL_COPY: Record<
  RestrictClientRecordModalMode,
  {
    title: string;
    heading: string;
    body: string;
    confirmText: string;
    color: 'primary' | 'error';
  }
> = {
  restrict: {
    title: 'Restrict Record',
    heading: 'Restrict this record?',
    body: 'This record will only be visible to all users at projects where the client is or has been enrolled. This can be updated or changed again later.',
    confirmText: 'Restrict Record',
    color: 'primary',
  },
  remove: {
    title: 'Remove Restriction',
    heading: 'Remove restriction for this record?',
    body: 'This record will be visible to all users with client access at projects where the client is or has been enrolled. This can be updated or changed again later.',
    confirmText: 'Remove Restriction',
    color: 'error',
  },
};

const RestrictClientRecordModal: React.FC<Props> = ({
  clientId,
  lockVersion,
  mode,
  onClose,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [setClientRestricted, { loading }] = useSetClientRestrictedMutation();

  const handleConfirm = useCallback(() => {
    if (!mode) return;

    setClientRestricted({
      variables: {
        clientId,
        lockVersion,
        restricted: mode === 'restrict',
      },
      onCompleted: (data) => {
        const validationErrors = data.setClientRestricted?.errors || [];
        if (validationErrors.length > 0) {
          setErrors(partitionValidations(validationErrors));
          return;
        }

        setErrors(emptyErrorState);
        onSuccess?.();
        onClose();
      },
      onError: (apolloError) =>
        setErrors({ ...emptyErrorState, apolloError }),
    });
  }, [clientId, lockVersion, mode, onClose, onSuccess, setClientRestricted]);

  if (!mode) return null;

  const copy = MODAL_COPY[mode];

  return (
    <ConfirmationDialog
      id='restrictClientRecord'
      open
      title={copy.title}
      confirmText={copy.confirmText}
      color={copy.color}
      loading={loading}
      onConfirm={handleConfirm}
      onCancel={onClose}
      errorState={errors}
    >
      <Typography variant='h6' component='p' gutterBottom>
        {copy.heading}
      </Typography>
      <Typography>{copy.body}</Typography>
    </ConfirmationDialog>
  );
};

export default RestrictClientRecordModal;
