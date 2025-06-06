import { DocumentNode, TypedDocumentNode, useMutation } from '@apollo/client';
import { Typography } from '@mui/material';
import { capitalize, get } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';

export interface DeleteMutationConfirmationDialogProps<
  Mutation,
  MutationVariables,
> {
  open: boolean;
  onClose: VoidFunction;
  ConfirmationDialogProps?: Omit<
    ConfirmationDialogProps,
    'loading' | 'children' | 'onConfirm' | 'onCancel' | 'open'
  >;
  onSuccess?: VoidFunction;
  queryDocument: TypedDocumentNode<Mutation, MutationVariables>;
  variables: MutationVariables;
  idPath: string;
  recordName?: string;
  confirmationDialogContent?: ReactNode;
  verb?: string;
  refetchQueries?: DocumentNode[];
  awaitRefetchQueries?: boolean;
}

// todo @martha - what happens here? should it get combined?
const DeleteMutationConfirmationDialog = <Mutation, MutationVariables>({
  variables,
  queryDocument,
  open,
  onClose,
  idPath,
  ConfirmationDialogProps,
  recordName = 'record',
  onSuccess,
  confirmationDialogContent,
  verb = 'delete',
  refetchQueries,
  awaitRefetchQueries,
}: DeleteMutationConfirmationDialogProps<Mutation, MutationVariables>) => {
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
          onClose();
          if (onSuccess) onSuccess();
        }
      },
      onError: (apolloError) =>
        setErrorState({ ...emptyErrorState, apolloError }),
      refetchQueries,
      awaitRefetchQueries,
    }
  );
  const handleDelete = useCallback(() => {
    deleteRecord();
  }, [deleteRecord]);

  return (
    <ConfirmationDialog
      id='deleteRecordDialog'
      open={open}
      title={`${capitalize(verb)} ${recordName}`}
      confirmText={`Yes, ${verb} ${recordName}`}
      cancelText='Close'
      onConfirm={handleDelete}
      onCancel={onClose}
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
  );
};
export default DeleteMutationConfirmationDialog;
