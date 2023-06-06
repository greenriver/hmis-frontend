import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Button, ButtonProps, Typography } from '@mui/material';
import { camelCase, get } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';

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
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [deleteRecord, { loading }] = useMutation<Mutation, MutationVariables>(
    queryDocument,
    {
      variables,
      onCompleted: (result) => {
        const errors = get(result, [idPath.split('.')[0], 'errors']) || [];
        const id = get(result, idPath);
        if (errors.length > 0) {
          setErrorState(partitionValidations(errors));
        } else if (id) {
          setShowDialog(false);
          if (onSuccess) onSuccess();
        }
      },
      onError: (apolloError) =>
        setErrorState({ ...emptyErrorState, apolloError }),
    }
  );
  const handleDelete = useCallback(() => {
    deleteRecord();
  }, [deleteRecord]);

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
        errorState={errorState}
        color='error'
        {...ConfirmationDialogProps}
      >
        <>
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
