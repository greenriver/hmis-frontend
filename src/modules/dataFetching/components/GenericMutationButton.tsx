import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Button, ButtonProps } from '@mui/material';
import { get } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';

type GenericMutationButtonProps<Mutation, MutationVariables> = {
  ButtonProps?: ButtonProps;
  buttonTooltip?: string;
  ConfirmationDialogProps: Partial<ConfirmationDialogProps> &
    Pick<ConfirmationDialogProps, 'title' | 'confirmText'>;
  children?: ReactNode;
  dialogContent: ReactNode;
  queryDocument: TypedDocumentNode<Mutation, MutationVariables>;
  variables: MutationVariables;
  idPath: string;
  onSuccess?: VoidFunction;
};

const GenericMutationButton = <Mutation, MutationVariables>({
  children,
  buttonTooltip,
  ButtonProps,
  ConfirmationDialogProps,
  dialogContent,
  queryDocument,
  variables,
  idPath,
  onSuccess,
}: GenericMutationButtonProps<Mutation, MutationVariables>) => {
  const [showDialog, setShowDialog] = useState(false);

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDialog(true);
  };

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [mutate, { loading }] = useMutation<Mutation, MutationVariables>(
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
      // refetchQueries,
      // awaitRefetchQueries,
    }
  );

  const handleConfirm = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <ButtonTooltipContainer title={buttonTooltip}>
        <Button onClick={onClick} variant='outlined' {...ButtonProps}>
          {children}
        </Button>
      </ButtonTooltipContainer>
      <ConfirmationDialog
        id='confirm-mutation'
        open={showDialog}
        cancelText='Close'
        onConfirm={handleConfirm}
        onCancel={() => setShowDialog(false)}
        loading={loading}
        errorState={errorState}
        {...ConfirmationDialogProps}
      >
        {dialogContent}
      </ConfirmationDialog>
    </>
  );
};
export default GenericMutationButton;
