import { DocumentNode, TypedDocumentNode, useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, ButtonProps, IconButton, Typography } from '@mui/material';
import { camelCase, capitalize, get } from 'lodash-es';
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
  children?: ReactNode;
  recordName?: string;
  confirmationDialogContent?: ReactNode;
  verb?: string;
  deleteIcon?: boolean;
  onlyIcon?: boolean;
  className?: string;
  refetchQueries?: DocumentNode[];
  awaitRefetchQueries?: boolean;
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
  deleteIcon = false,
  onlyIcon = false,
  className,
  refetchQueries,
  awaitRefetchQueries,
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
      refetchQueries,
      awaitRefetchQueries,
    }
  );
  const handleDelete = useCallback(() => {
    deleteRecord();
  }, [deleteRecord]);
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDialog(true);
  };

  return (
    <>
      {onlyIcon ? (
        <IconButton
          data-testid={`deleteRecordButton-${camelCase(recordName)}`}
          onClick={onClick}
          size='small'
          className={className}
          {...ButtonProps}
        >
          <DeleteIcon fontSize='small' />
        </IconButton>
      ) : (
        <Button
          data-testid={`deleteRecordButton-${camelCase(recordName)}`}
          onClick={onClick}
          variant='outlined'
          color='error'
          startIcon={deleteIcon ? <DeleteIcon /> : undefined}
          className={className}
          {...ButtonProps}
        >
          {children}
        </Button>
      )}
      <ConfirmationDialog
        id='deleteRecordDialog'
        open={showDialog}
        title={`${capitalize(verb)} ${recordName}`}
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
