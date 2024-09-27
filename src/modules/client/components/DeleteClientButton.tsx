import { Button, ButtonProps, Link, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { cache } from '@/app/apolloClient';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { defaultRenderError } from '@/modules/errors/components/WarningAlert';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import {
  DeleteClientMutation,
  useDeleteClientMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export interface DeleteClientButtonProps extends ButtonProps {
  clientId: string;
  clientLockVersion: number;
  onSuccess?: (data: DeleteClientMutation) => any;
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
  clientLockVersion,
  onSuccess,
  ...props
}) => {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteClient, { loading }] = useDeleteClientMutation();

  const handleDelete = useCallback(
    (confirmed?: boolean) => {
      deleteClient({
        variables: {
          input: { id: clientId, confirmed, clientLockVersion },
        },
        onCompleted: (data) => {
          const errors = data.deleteClient?.errors || [];

          if (errors.length > 0) {
            setErrors(partitionValidations(errors));
          } else {
            setErrors(emptyErrorState);
            cache.evict({
              id: `Client:${clientId}`,
            });
            if (onSuccess) onSuccess(data);
          }
          setDeleting(false);
        },
        onError: (apolloError) =>
          setErrors({ ...emptyErrorState, apolloError }),
      });
    },
    [deleteClient, clientId, clientLockVersion, onSuccess]
  );

  const { renderValidationDialog } = useValidationDialog({
    errorState: errors,
  });

  return (
    <>
      <Button
        variant='outlined'
        color='error'
        fullWidth
        onClick={() => setDeleting(true)}
        data-testid='deleteClientButton'
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
      {renderValidationDialog({
        confirmText: 'Delete client anyway',
        onConfirm: () => handleDelete(true),
        loading,
        renderError: (error, ...args) => {
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
                      to={generateSafePath(
                        EnrollmentDashboardRoutes.EDIT_HOUSEHOLD,
                        {
                          clientId: clientId,
                          enrollmentId: enrollment.id,
                        }
                      )}
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
        },
      })}
    </>
  );
};

export default DeleteClientButton;
