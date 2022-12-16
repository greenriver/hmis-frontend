import { Button, Stack } from '@mui/material';
import { MouseEventHandler } from 'react';

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
}: FormActionProps) => (
  <Stack
    direction='row'
    spacing={2}
    justifyContent={onSaveDraft ? 'space-between' : undefined}
  >
    <Stack direction='row' spacing={2}>
      <Button
        variant='contained'
        type='submit'
        disabled={disabled}
        // disabled={!!loading || (warnings.length > 0 && !dialogDismissed)}
        onClick={onSubmit}
        sx={{ opacity: 1 }}
      >
        {submitButtonText}
      </Button>
      {onSaveDraft && (
        <Button
          variant='outlined'
          type='submit'
          disabled={disabled}
          onClick={onSaveDraft}
          sx={{ backgroundColor: 'white' }}
        >
          {saveDraftButtonText}
        </Button>
      )}
    </Stack>
    {onDiscard && typeof onDiscard === 'string' ? (
      <ButtonLink variant='gray' to={onDiscard}>
        {discardButtonText}
      </ButtonLink>
    ) : (
      <Button variant='gray' onClick={onDiscard as MouseEventHandler}>
        {discardButtonText}
      </Button>
    )}
  </Stack>
);

export default FormActions;
