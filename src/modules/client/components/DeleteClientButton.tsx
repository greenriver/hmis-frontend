import { Button, ButtonProps, Link, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { defaultRenderError } from '@/modules/errors/components/WarningAlert';
import WarningDialog from '@/modules/errors/components/WarningDialog';
import { useWarningDialog } from '@/modules/errors/hooks/useWarningDialog';
import {
  ErrorState,
  emptyErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  DeleteClientMutation,
  useDeleteClientMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export interface DeleteClientButtonProps extends ButtonProps {
  clientId: string;
  onCompleted?: (data: DeleteClientMutation) => any;
}

interface DeleteClientWarningData {
  confirmText?: string;
  text?: string;
  enrollments?: {
    id: string;
    name: string | null;
    entryDate: string | null;
    exitDate: string | null;
  }[];
}

const DeleteClientButton: React.FC<DeleteClientButtonProps> = ({
  clientId,
  onCompleted,
  ...props
}) => {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteClient, { loading }] = useDeleteClientMutation();

  const handleDelete = useCallback(
    (confirmed?: boolean) => {
      deleteClient({
        variables: { input: { id: clientId, confirmed } },
        onCompleted: (data) => {
          const errors = data.deleteClient?.errors || [];

          if (errors.length > 0) {
            setErrors(partitionValidations(errors));
          } else {
            setErrors(emptyErrorState);
          }
          if (onCompleted) onCompleted(data);
          setDeleting(false);
        },
        onError: (apolloError) =>
          setErrors({ ...emptyErrorState, apolloError }),
      });
    },
    [deleteClient, clientId, onCompleted]
  );

  const { showWarningDialog, warningDialogProps } = useWarningDialog({
    errorState: errors,
    onConfirm: () => handleDelete(true),
    loading,
  });

  const warningDialogConfirmText = useMemo(
    () =>
      errors.warnings.find((err) => err.data?.confirmText)?.data?.confirmText ||
      'Confirm',
    [errors.warnings]
  );

  return (
    <>
      <Button
        variant='outlined'
        color='error'
        fullWidth
        onClick={() => setDeleting(true)}
        {...props}
      >
        Delete Client
      </Button>
      <ConfirmationDialog
        id='deleteFile'
        open={!!deleting}
        title='Delete Client'
        onConfirm={() => deleting && handleDelete()}
        onCancel={() => setDeleting(false)}
        loading={loading}
      >
        {deleting && (
          <>
            <Typography>
              Are you sure you want to delete this client?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
      {showWarningDialog && (
        <WarningDialog
          {...warningDialogProps}
          confirmText={warningDialogConfirmText}
          renderError={(error, ...args) => {
            if (!error.data) return defaultRenderError(error, ...args);

            const { text, enrollments = [] } =
              error.data as DeleteClientWarningData;

            return (
              <li key={error.fullMessage}>
                <Typography variant='body2' gutterBottom>
                  {error.fullMessage}
                </Typography>
                {text && (
                  <Typography variant='body2' gutterBottom>
                    {error.data?.text}
                  </Typography>
                )}
                <ul>
                  {enrollments?.map((enrollment) => (
                    <li key={enrollment.id}>
                      <Link
                        component={RouterLink}
                        to={generateSafePath(DashboardRoutes.EDIT_HOUSEHOLD, {
                          clientId: clientId,
                          enrollmentId: enrollment.id,
                        })}
                      >
                        {enrollment.name} (
                        {parseAndFormatDateRange(
                          enrollment.entryDate,
                          enrollment.exitDate
                        )}
                        )
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }}
        />
      )}
    </>
  );
};

export default DeleteClientButton;
