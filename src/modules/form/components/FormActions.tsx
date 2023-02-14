import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { MouseEventHandler, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';

type ButtonConfig = {
  label: string;
  action: 'SAVE' | 'SUBMIT' | 'VALIDATE' | 'DISCARD';
  onSuccess: VoidFunction;
  rightAlignt?: boolean;
  buttonProps?: Omit<LoadingButtonProps, 'onClick'>;
};

export interface FormActionProps {
  config?: ButtonConfig[];
  onSubmit: MouseEventHandler;
  onSaveDraft?: (onSuccess?: VoidFunction) => void;
  onDiscard?: MouseEventHandler | string;
  submitButtonText?: string;
  saveDraftButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
}

const FormActions = ({
  config,
  onSubmit,
  onSaveDraft,
  onDiscard,
  submitButtonText = 'Submit',
  saveDraftButtonText = 'Save and Finish Later',
  discardButtonText = 'Discard',
  disabled,
  loading,
}: FormActionProps) => {
  const navigate = useNavigate();

  const getClickHandler = useCallback(
    (action: ButtonConfig['action'], onSuccess?: VoidFunction) => {
      if (action === 'DISCARD') {
        return (onDiscard as MouseEventHandler) || (() => navigate(-1));
      }
      if (action === 'SAVE') {
        if (!onSaveDraft) return;
        return (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          onSaveDraft(onSuccess);
        };
      }
      if (action === 'SUBMIT') {
        // if (!onSubmit) return;
        return onSubmit;
      }
    },
    [onDiscard, onSaveDraft, onSubmit, navigate]
  );

  if (config)
    return (
      <Stack
        direction='row'
        spacing={2}
        justifyContent={onSaveDraft ? 'space-between' : undefined}
      >
        <Stack direction='row' spacing={2}>
          {config.map(({ label, action, onSuccess, buttonProps }) => {
            const isSubmit = action === 'SAVE' || action === 'SUBMIT';

            return (
              <LoadingButton
                type={isSubmit ? 'submit' : undefined}
                disabled={disabled}
                onClick={getClickHandler(action, onSuccess)}
                loading={loading}
                {...buttonProps}
              >
                {label}
              </LoadingButton>
            );
          })}
        </Stack>
      </Stack>
    );

  return (
    <Stack
      direction='row'
      spacing={2}
      justifyContent={onSaveDraft ? 'space-between' : undefined}
    >
      <Stack direction='row' spacing={2}>
        <LoadingButton
          data-testid='submitFormButton'
          type='submit'
          disabled={disabled}
          onClick={onSubmit}
          sx={{ opacity: 1 }}
          loading={loading}
        >
          {submitButtonText}
        </LoadingButton>
        {onSaveDraft && (
          <LoadingButton
            data-testid='saveFormButton'
            type='submit'
            disabled={disabled}
            onClick={handleSaveDraft}
            sx={{ backgroundColor: 'white' }}
            loading={loading}
          >
            {saveDraftButtonText}
          </LoadingButton>
        )}
      </Stack>
      {onDiscard && typeof onDiscard === 'string' ? (
        <ButtonLink
          data-testid='discardFormButton'
          variant='gray'
          to={onDiscard}
          disabled={disabled || loading}
        >
          {discardButtonText}
        </ButtonLink>
      ) : (
        <Button
          data-testid='discardFormButton'
          variant='gray'
          onClick={(onDiscard as MouseEventHandler) || (() => navigate(-1))}
          disabled={disabled || loading}
        >
          {discardButtonText}
        </Button>
      )}
    </Stack>
  );
};

export default FormActions;
