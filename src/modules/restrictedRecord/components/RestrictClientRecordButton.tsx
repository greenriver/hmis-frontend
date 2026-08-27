import { Button, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  RestrictedRecordIcon,
  UnrestrictedRecordIcon,
} from '@/components/elements/SemanticIcons';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { useSetClientRestrictedMutation } from '@/types/gqlTypes';

interface Props {
  clientId: string;
  restricted: boolean;
}

const RestrictClientRecordButton: React.FC<Props> = ({
  clientId,
  restricted,
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

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        data-testid='restrictClientRecordButton'
        startIcon={
          restricted ? <UnrestrictedRecordIcon /> : <RestrictedRecordIcon />
        }
        variant='outlined'
        color='primary'
        fullWidth
      >
        {restricted
          ? 'Remove Client Record Restriction'
          : 'Restrict Client Record'}
      </Button>
      <ConfirmationDialog
        id='setClientRestricted'
        open={dialogOpen}
        title={
          restricted
            ? 'Remove Client Record Restriction'
            : 'Restrict Client Record'
        }
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
              Users who can view clients will be able to search for this client
              and view their details, even if they do not have permission to
              view restricted client records.
            </Typography>
          </>
        ) : (
          <>
            <Typography>Restrict this client?</Typography>
            <Typography sx={{ mt: 2 }}>
              This client record will only be searchable by users who have
              permission to view restricted clients at one of the client's
              projects.
            </Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};

export default RestrictClientRecordButton;
