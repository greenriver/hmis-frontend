import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogProps,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { omit } from 'lodash-es';
import React, { useCallback, useState } from 'react';

import CommonDialog from '../CommonDialog';
import LoadingButton from '../LoadingButton';
import Uploader from '../upload/UploaderBase';

import ClientCardImageElement from '@/modules/client/components/ClientCardImageElement';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  hasErrors,
  partitionValidations,
} from '@/modules/errors/util';
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
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [mutate, { loading: updating }] = useUpdateClientImageMutation({
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
    },
  });
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
      if (newBlobId) {
        mutate({ variables: { clientId, imageBlobId: newBlobId } }).then(
          (result) => {
            const modelErrors = result.data?.updateClientImage?.errors || [];
            if (modelErrors.length > 0) {
              setErrors(partitionValidations(modelErrors));
            } else {
              handleClose(e);
            }
          }
        );
      }
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
    <CommonDialog
      {...omit(props, 'children')}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
        component='div'
      >
        <Typography sx={{ flexGrow: 1 }} variant='h5' component='p'>
          Upload Client Photo
        </Typography>
      </Box>
      <DialogContent>
        {fetching ? (
          <CircularProgress />
        ) : (
          client && (
            <Grid container spacing={2} justifyContent='space-around'>
              {client.image && (
                <>
                  <Grid item>
                    <Typography variant='body2' gutterBottom align='center'>
                      Current Photo
                    </Typography>
                    <ClientCardImageElement client={client} />
                    {client?.image && (
                      <Box>
                        <LoadingButton
                          variant='outlined'
                          color='error'
                          size='small'
                          fullWidth
                          disabled={mutationLoading}
                          startIcon={<DeleteIcon />}
                          onClick={handleDelete}
                          loading={deleting}
                        >
                          Remove Photo
                        </LoadingButton>
                      </Box>
                    )}
                  </Grid>
                  <Grid item>
                    <Typography variant='body2' gutterBottom align='center'>
                      New Photo
                    </Typography>
                    <ClientCardImageElement url={newPhotoSrc} />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Uploader
                  id='clientImageUploader'
                  onUpload={(upload, file) => {
                    setNewBlobId(upload.signedBlobId);
                    setNewPhotoSrc(URL.createObjectURL(file));
                    setErrors(emptyErrorState);
                  }}
                  onClear={() => {
                    setNewBlobId(undefined);
                    setNewPhotoSrc(undefined);
                    setErrors(emptyErrorState);
                  }}
                />
              </Grid>
              {hasErrors(errors) && (
                <Grid item xs={12}>
                  <Stack gap={2}>
                    <ApolloErrorAlert error={errors.apolloError} />
                    <ErrorAlert errors={errors.errors} fixable />
                  </Stack>
                </Grid>
              )}
            </Grid>
          )
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 2 }}>
        <Button variant='gray' onClick={handleClose} disabled={mutationLoading}>
          Cancel
        </Button>
        <LoadingButton
          loading={updating}
          disabled={!newBlobId || mutationLoading}
          onClick={handleSave}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </CommonDialog>
  );
};

export default ClientImageUploadDialog;
