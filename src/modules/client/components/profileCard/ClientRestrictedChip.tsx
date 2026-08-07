import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Chip, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { useSetClientRestrictedMutation } from '@/types/gqlTypes';

interface Props {
  clientId: string;
  restricted: boolean;
  canMarkRestricted: boolean;
}

const ClientRestrictedChip: React.FC<Props> = ({
  clientId,
  restricted,
  canMarkRestricted,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [setClientRestricted, { loading }] = useSetClientRestrictedMutation();

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
  }, []);

  const handleConfirm = useCallback(() => {
    setClientRestricted({
      variables: {
        clientId,
        restricted: !restricted,
      },
      onCompleted: (data) => {
        const mutationErrors = data.setClientRestricted?.errors || [];
        if (mutationErrors.length > 0) {
          setErrors(partitionValidations(mutationErrors));
          return;
        }
        handleClose();
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });
  }, [clientId, handleClose, restricted, setClientRestricted]);

  // If the client is not restricted and the user does not have permission to mark restricted,
  // don't show the chip at all.
  if (!restricted && !canMarkRestricted) return null;

  const clickable = canMarkRestricted;
  const Icon = restricted ? LockIcon : LockOpenIcon;
  return (
    <>
      <Chip
        label={restricted ? 'Restricted Record' : 'Unrestricted Record'}
        icon={<Icon fontSize='small' />}
        color={restricted ? 'warning' : 'default'}
        clickable={clickable}
        onClick={clickable ? () => setDialogOpen(true) : undefined}
        data-testid='clientRestrictedChip'
        sx={{ flexShrink: 0 }}
        variant='status'
      />
      <ConfirmationDialog
        id='setClientRestricted'
        open={dialogOpen}
        title={restricted ? 'Remove Restriction' : 'Restrict Record'}
        confirmText={restricted ? 'Remove Restriction' : 'Restrict'}
        onConfirm={handleConfirm}
        onCancel={handleClose}
        loading={loading}
        errorState={errors}
      >
        {restricted ? (
          <>
            <Typography>Remove restriction for this client record?</Typography>
            <Typography sx={{ mt: 2 }}>
              Users who can view clients will be able to find and open this
              record again, even if they do not have permission to view
              restricted client records.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              You can restrict them again later.
            </Typography>
          </>
        ) : (
          <>
            <Typography>Restrict this client?</Typography>
            <Typography sx={{ mt: 2 }}>
              This client record will only be visible to users who have
              permission to view restricted clients at one of the client's
              projects.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              This can be updated or changed again later.
            </Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};

export default ClientRestrictedChip;
