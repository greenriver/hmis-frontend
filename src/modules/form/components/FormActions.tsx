import { LoadingButton } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';

export interface FormActionProps {
  onSubmit: MouseEventHandler;
  onSaveDraft?: MouseEventHandler;
  onDiscard?: MouseEventHandler | string;
  submitButtonText?: string;
  saveDraftButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
}

const FormActions = ({
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
            onClick={onSaveDraft}
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
