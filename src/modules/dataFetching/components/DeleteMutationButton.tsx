import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Button, ButtonProps, Typography } from '@mui/material';
import { camelCase, get } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';

interface DeleteMutationButtonProps<MutationVariables> {
  ButtonProps?: ButtonProps;
  ConfirmationDialogProps?: Omit<
    ConfirmationDialogProps,
    'loading' | 'children' | 'onConfirm' | 'onCancel' | 'open'
  >;
  onSuccess?: VoidFunction;
  queryDocument: TypedDocumentNode<MutationVariables, MutationVariables>;
  variables: MutationVariables;
  idPath: string;
  children: ReactNode;
  recordName?: string;
  confirmationDialogContent?: ReactNode;
  verb?: string;
}

const DeleteMutationButton = <Mutation, MutationVariables>({
  variables,
  queryDocument,
  children,
  idPath,
  ButtonProps,
  ConfirmationDialogProps,
  recordName = 'record',
  onSuccess,
  confirmationDialogContent,
  verb = 'delete',
}: DeleteMutationButtonProps<MutationVariables>) => {
  const [showDialog, setShowDialog] = useState(false);

  const [deleteRecord, { loading, error }] = useMutation<
    Mutation,
    MutationVariables
  >(queryDocument, { variables });
  const handleDelete = useCallback(() => {
    deleteRecord().then((result) => {
      // fixme: should probably look for errors[] in mutation response
      const id = get(result, idPath);
      if (id) {
        setShowDialog(false);
        if (onSuccess) onSuccess();
      }
    });
  }, [deleteRecord, idPath, onSuccess]);

  return (
    <>
      <Button
        data-testid={`deleteRecordButton-${camelCase(recordName)}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDialog(true);
        }}
        variant='outlined'
        color='error'
        {...ButtonProps}
      >
        {children}
      </Button>
      <ConfirmationDialog
        id='deleteRecordDialog'
        open={showDialog}
        title={`${verb} ${recordName}`}
        confirmText={`Yes, ${verb} ${recordName}`}
        cancelText='Close'
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
        loading={loading}
        errorState={{ apolloError: error, errors: [], warnings: [] }}
        color='error'
        {...ConfirmationDialogProps}
      >
        <>
          {error && <ApolloErrorAlert error={error} />}

          {confirmationDialogContent ? (
            confirmationDialogContent
          ) : (
            <>
              <Typography>
                {`Are you sure you want to ${verb} this ${recordName}?`}
              </Typography>
              <Typography>This action cannot be undone.</Typography>
            </>
          )}
        </>
      </ConfirmationDialog>
    </>
  );
};
export default DeleteMutationButton;
