import DeleteIcon from '@mui/icons-material/Delete';
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
  Box,
} from '@mui/material';
import { omit } from 'lodash-es';
import React, { useCallback, useState } from 'react';

import { ClientCardImageElement } from '../ClientCard';
import Uploader from '../upload/Uploader';

import {
  useDeleteClientImageMutation,
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
  const {
    data: { client } = {},
    loading: fetching,
    refetch: refetchClient,
  } = useGetClientImageQuery({
    variables: { id: clientId },
  });
  const [mutate, { loading: updating }] = useUpdateClientImageMutation();
  const [deleteImage, { loading: deleting }] = useDeleteClientImageMutation();

  const [newPhotoSrc, setNewPhotoSrc] = useState<string | undefined>();
  const [newBlobId, setNewBlobId] = useState<string | undefined>();

  const mutationLoading = updating || deleting;

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

  const handleDelete = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      deleteImage({ variables: { clientId } })
        .then(() => refetchClient())
        .then((data) => !data.data?.client?.image && handleClose(e));
    },
    [clientId, deleteImage, handleClose, refetchClient]
  );

  if (!fetching && !client) return null;

  return (
    <Dialog {...omit(props, 'children')} onClose={onClose}>
      <DialogTitle>Upload Client Photo</DialogTitle>
      <DialogContent>
        {fetching ? (
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
        {client?.image && (
          <Box flexGrow={1}>
            <Button
              variant='outlined'
              color='error'
              disabled={mutationLoading}
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              endIcon={
                deleting ? (
                  <CircularProgress size={15} color='inherit' />
                ) : undefined
              }
            >
              Remove Photo
            </Button>
          </Box>
        )}
        <Button
          disabled={!newBlobId || mutationLoading}
          onClick={handleSave}
          endIcon={
            updating ? (
              <CircularProgress size={15} color='inherit' />
            ) : undefined
          }
        >
          Save
        </Button>
        <Button
          variant='outlined'
          onClick={handleClose}
          disabled={mutationLoading}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientImageUploadDialog;
