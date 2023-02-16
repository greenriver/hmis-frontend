import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { Stack } from '@mui/material';
import { findIndex } from 'lodash-es';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';

type ButtonConfig = {
  id: string;
  label: string;
  action: 'SAVE' | 'SUBMIT' | 'VALIDATE' | 'DISCARD' | 'NAVIGATE';
  onSuccess: VoidFunction;
  rightAlignt?: boolean;
  buttonProps?: Omit<LoadingButtonProps, 'onClick'>;
};

export interface FormActionProps {
  config?: ButtonConfig[];
  onSubmit: (onSuccess?: VoidFunction) => void;
  onSaveDraft?: (onSuccess?: VoidFunction) => void;
  onDiscard?: MouseEventHandler | string;
  submitButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
}

const FormActions = ({
  config,
  onSubmit,
  onSaveDraft,
  onDiscard,
  submitButtonText,
  discardButtonText,
  disabled,
  loading,
}: FormActionProps) => {
  const navigate = useNavigate();

  const [leftConfig, rightConfig] = useMemo(() => {
    if (config) {
      // If any buttons are marked "rightAlign", split up the config array
      const idx = findIndex(config, { rightAlign: true });
      if (idx === -1) return [config, []];

      const left = config.slice(0, idx);
      const right = config.slice(idx);
      return [left, right];
    }

    // Default button configuration
    return [
      [
        {
          key: 'submit',
          label: submitButtonText || 'Save Changes',
          action: 'SUBMIT',
          buttonProps: { variant: 'contained' },
        },
        {
          key: 'discard',
          label: discardButtonText || 'Discard',
          action: 'DISCARD',
          buttonProps: { variant: 'gray' },
        },
      ],
      [],
    ];
  }, [config, submitButtonText, discardButtonText]);

  const [lastClicked, setLastClicked] = useState();

  const getClickHandler = useCallback(
    ({ action, onSuccess, id }: ButtonConfig) => {
      if (action === 'DISCARD') {
        return (onDiscard as MouseEventHandler) || (() => navigate(-1));
      }
      if (action === 'SAVE') {
        if (!onSaveDraft) return;
        return (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          setLastClicked(id);
          onSaveDraft(onSuccess);
        };
      }
      if (action === 'SUBMIT') {
        if (!onSubmit) return;
        return (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          setLastClicked(id);
          onSubmit(onSuccess);
        };
      }

      if (action === 'NAVIGATE') {
        return onSuccess;
      }
    },
    [onDiscard, onSaveDraft, onSubmit, navigate]
  );

  const renderButton = (buttonConfig: ButtonConfig) => {
    const { id, label, action, buttonProps } = buttonConfig;
    const isSubmit = action === 'SAVE' || action === 'SUBMIT';

    if (action === 'DISCARD' && onDiscard && typeof onDiscard === 'string') {
      // Special case for onDiscard that is a link
      return (
        <ButtonLink
          data-testid={`formButton-${id}`}
          key={id}
          to={onDiscard}
          disabled={disabled || loading}
          {...buttonProps}
        >
          {label}
        </ButtonLink>
      );
    }

    return (
      <LoadingButton
        key={id}
        data-testid={`formButton-${id}`}
        type={isSubmit ? 'submit' : undefined}
        disabled={disabled || loading}
        onClick={getClickHandler(buttonConfig)}
        loading={loading && lastClicked === id}
        {...buttonProps}
      >
        {label}
      </LoadingButton>
    );
  };
  return (
    <Stack
      direction='row'
      spacing={2}
      justifyContent={rightConfig.length > 0 ? 'space-between' : undefined}
    >
      {[leftConfig, rightConfig].map((configs) => (
        <Stack direction='row' spacing={2} sx={{ backgroundColor: 'white' }}>
          {configs.map((c) => renderButton(c))}
        </Stack>
      ))}
    </Stack>
  );
};

export default FormActions;
