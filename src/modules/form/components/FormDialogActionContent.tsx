import { LoadingButton } from '@mui/lab';
import { Box, Button, ButtonProps, Stack } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

export interface FormDialogActionProps {
  onDiscard: ButtonProps['onClick'];
  onSubmit: ButtonProps['onClick'];
  submitLoading?: boolean;
  discardButtonText?: string;
  submitButtonText?: string;
  disabled?: boolean;
  disabledReason?: string;
  otherActions?: ReactNode;
  PrimaryActionProps?: ButtonProps;
}

export const FormDialogActionContent = ({
  onDiscard,
  discardButtonText,
  onSubmit,
  submitButtonText,
  submitLoading,
  disabled,
  disabledReason,
  otherActions,
  PrimaryActionProps,
}: FormDialogActionProps) => {
  const primaryAction = useMemo(
    () => (
      <LoadingButton
        onClick={onSubmit}
        type='submit'
        loading={submitLoading}
        data-testid='confirmDialogAction'
        sx={{ minWidth: '120px' }}
        disabled={disabled}
        {...PrimaryActionProps}
      >
        {submitButtonText || 'Save'}
      </LoadingButton>
    ),
    [PrimaryActionProps, disabled, onSubmit, submitButtonText, submitLoading]
  );

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
          color='grayscale'
          data-testid='cancelDialogAction'
        >
          {discardButtonText || 'Cancel'}
        </Button>

        {disabled && disabledReason ? (
          <ButtonTooltipContainer title={disabledReason} placement='bottom'>
            {primaryAction}
          </ButtonTooltipContainer>
        ) : (
          primaryAction
        )}
      </Stack>
    </Stack>
  );
};

export default FormDialogActionContent;
