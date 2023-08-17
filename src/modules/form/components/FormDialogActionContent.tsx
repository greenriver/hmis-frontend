import { LoadingButton } from '@mui/lab';
import { Box, Button, ButtonProps, Stack } from '@mui/material';
import { ReactNode } from 'react';

export const FormDialogActionContent = ({
  onDiscard,
  discardButtonText,
  onSubmit,
  submitButtonText,
  submitLoading,
  disabled,
  otherActions,
}: {
  onDiscard: ButtonProps['onClick'];
  onSubmit: ButtonProps['onClick'];
  submitLoading?: boolean;
  discardButtonText?: string;
  submitButtonText?: string;
  disabled?: boolean;
  otherActions?: ReactNode;
}) => {
  return (
    <Stack
      direction='row'
      justifyContent={'space-between'}
      sx={{ width: '100%' }}
    >
      <Box flexGrow={1}>{otherActions}</Box>
      <Stack gap={3} direction='row'>
        <Button
          onClick={onDiscard}
          variant='gray'
          data-testid='cancelDialogAction'
        >
          {discardButtonText || 'Cancel'}
        </Button>
        <LoadingButton
          onClick={onSubmit}
          type='submit'
          loading={submitLoading}
          data-testid='confirmDialogAction'
          sx={{ minWidth: '120px' }}
          disabled={disabled}
        >
          {submitButtonText || 'Save'}
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default FormDialogActionContent;
