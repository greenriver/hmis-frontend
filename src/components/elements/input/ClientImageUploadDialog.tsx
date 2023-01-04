import {
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { omit } from 'lodash-es';
import React, { useCallback, useState } from 'react';

import { ClientCardImageElement } from '../ClientCard';
import Uploader from '../upload/Uploader';

import {
  useGetClientImageQuery,
  useUpdateClientImageMutation,
} from '@/types/gqlTypes';

export type ClientImageUploadDialogProps = {
  clientId: string;
} & DialogProps;

const ClientImageUploadDialog: React.FC<ClientImageUploadDialogProps> = ({
  clientId,
  onClose,
  ...props
}) => {
  const { data: { client } = {}, loading } = useGetClientImageQuery({
    variables: { id: clientId },
  });
  const [mutate, { loading: updating }] = useUpdateClientImageMutation();

  const [newPhotoSrc, setNewPhotoSrc] = useState<string | undefined>();
  const [newBlobId, setNewBlobId] = useState<string | undefined>();

  const handleClose = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      setNewPhotoSrc(undefined);
      setNewBlobId(undefined);
      if (onClose) onClose(e, 'escapeKeyDown');
    },
    [onClose]
  );

  const handleSave = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      if (newBlobId)
        mutate({ variables: { clientId, imageBlobId: newBlobId } }).then(() =>
          handleClose(e)
        );
    },
    [newBlobId, clientId, mutate, handleClose]
  );

  if (!loading && !client) return null;

  return (
    <Dialog {...omit(props, 'children')} onClose={onClose}>
      <DialogTitle>Upload Client Photo</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          client && (
            <Grid container spacing={2} justifyContent='space-around'>
              {client.image && (
                <>
                  <Grid item>
                    <Typography>Current Photo</Typography>
                    <ClientCardImageElement client={client} />
                  </Grid>
                  <Grid item>
                    <Typography>New Photo</Typography>
                    <ClientCardImageElement url={newPhotoSrc} />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Uploader
                  onUpload={(upload, file) => {
                    setNewBlobId(upload.blobId);
                    setNewPhotoSrc(URL.createObjectURL(file));
                  }}
                  onClear={() => {
                    setNewBlobId(undefined);
                    setNewPhotoSrc(undefined);
                  }}
                />
              </Grid>
            </Grid>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!newBlobId || updating}
          onClick={handleSave}
          endIcon={
            updating ? (
              <CircularProgress size={15} color='inherit' />
            ) : undefined
          }
        >
          Save
        </Button>
        <Button variant='outlined' onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientImageUploadDialog;
