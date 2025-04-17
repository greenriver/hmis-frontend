import DeleteIcon from '@mui/icons-material/Delete';
import { Button, ButtonProps, IconButton } from '@mui/material';
import { camelCase } from 'lodash-es';
import { ReactNode, useState } from 'react';
import DeleteMutationConfirmationDialog, {
  DeleteMutationConfirmationDialogProps,
} from '@/modules/dataFetching/components/DeleteMutationConfirmationDialog';

type DeleteMutationButtonProps<Mutation, MutationVariables> = {
  ButtonProps?: ButtonProps;
  recordName?: string;
  children?: ReactNode;
  deleteIcon?: boolean;
  onlyIcon?: boolean;
  className?: string;
} & Omit<
  DeleteMutationConfirmationDialogProps<Mutation, MutationVariables>,
  'open' | 'onClose'
>;

const DeleteMutationButton = <Mutation, MutationVariables>({
  children,
  ButtonProps,
  recordName = 'record',
  deleteIcon = false,
  onlyIcon = false,
  className,
  ...rest
}: DeleteMutationButtonProps<Mutation, MutationVariables>) => {
  const [showDialog, setShowDialog] = useState(false);

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
          aria-label={`Delete ${recordName}`}
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
      <DeleteMutationConfirmationDialog
        recordName={recordName}
        open={showDialog}
        onClose={() => setShowDialog(false)}
        {...rest}
      />
    </>
  );
};
export default DeleteMutationButton;
