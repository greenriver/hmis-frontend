import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Button, ButtonProps, Typography } from '@mui/material';
import { capitalize, get, lowerCase } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';

interface DeleteMutationButtonProps<MutationVariables> {
  ButtonProps?: ButtonProps;
  ConfirmationDialogProps?: ConfirmationDialogProps;
  onSuccess?: VoidFunction;
  queryDocument: TypedDocumentNode<MutationVariables, MutationVariables>;
  variables: MutationVariables;
  idPath: string;
  children: ReactNode;
  recordName?: string;
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
}: DeleteMutationButtonProps<MutationVariables>) => {
  const [showDialog, setShowDialog] = useState(false);

  const [deleteRecord, { loading, error }] = useMutation<
    Mutation,
    MutationVariables
  >(queryDocument, {
    variables,
    onCompleted: (result) => {
      //idPath
      const id = get(result, idPath);
      //res.deleteAssessment?.assessment?.id;
      if (id) {
        setShowDialog(false);
        if (onSuccess) onSuccess();
      }
    },
  });
  const handleDelete = useCallback(() => {
    deleteRecord();
  }, [deleteRecord]);

  return (
    <>
      <Button
        data-testid={`deleteRecordButton-${recordName}`}
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
        title={`Delete ${capitalize(recordName)}`}
        confirmText={`Yes, delete ${lowerCase(recordName)}`}
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
        loading={loading}
        errorState={{ apolloError: error, errors: [], warnings: [] }}
        {...ConfirmationDialogProps}
      >
        <>
          <Typography>
            {`Are you sure you want to delete this ${lowerCase(recordName)}?`}
          </Typography>
          <Typography>This action cannot be undone.</Typography>
        </>
      </ConfirmationDialog>
    </>
  );
};
export default DeleteMutationButton;
