import { Stack } from '@mui/material';
import { findIndex, findLastIndex } from 'lodash-es';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormActionTypes } from '../types';

import ButtonLink from '@/components/elements/ButtonLink';
import LoadingButton from '@/components/elements/LoadingButton';
import AssessmentLastUpdated from '@/modules/hmis/components/AssessmentLastUpdated';

type ButtonConfig = {
  id: string;
  label: string;
  action: FormActionTypes;
  onSuccess?: VoidFunction;
  centerAlign?: boolean;
  buttonProps?: any; //Omit<LoadingButtonProps, 'onClick'>;
};

export interface FormActionProps {
  config?: ButtonConfig[];
  onSubmit: (
    e: React.MouseEvent<HTMLButtonElement>,
    onSuccess?: VoidFunction
  ) => void;
  onSaveDraft?: (onSuccess?: VoidFunction) => void;
  onDiscard?: MouseEventHandler | string;
  submitButtonText?: string;
  discardButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
  lastSaved?: string;
  lastSubmitted?: string;
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
  lastSaved,
  lastSubmitted,
}: FormActionProps) => {
  const navigate = useNavigate();

  const [leftConfig, centerConfig, rightConfig] = useMemo(() => {
    if (config) {
      const centerFrom = findIndex(config, { centerAlign: true });
      const centerTo = findLastIndex(config, { centerAlign: true });
      if (centerFrom === -1) return [config, [], []];

      const left = config.slice(0, centerFrom);
      const center = config.slice(centerFrom, centerTo + 1);
      const right = config.slice(centerTo + 1);
      return [left, center, right];
    }

    // Default button configuration
    return [
      [
        {
          id: 'submit',
          label: submitButtonText || 'Save Changes',
          action: FormActionTypes.Submit,
          buttonProps: { variant: 'contained' },
        },
        {
          id: 'discard',
          label: discardButtonText || 'Discard',
          action: FormActionTypes.Discard,
          buttonProps: { variant: 'gray' },
        },
      ] as ButtonConfig[],
      [],
      [],
    ];
  }, [config, submitButtonText, discardButtonText]);

  const [lastClicked, setLastClicked] = useState<string>();

  const getClickHandler = useCallback(
    ({ action, onSuccess, id }: ButtonConfig) => {
      if (action === FormActionTypes.Discard) {
        return (onDiscard as MouseEventHandler) || (() => navigate(-1));
      }
      if (action === FormActionTypes.Save) {
        if (!onSaveDraft) return;
        return (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          setLastClicked(id);
          onSaveDraft(onSuccess);
        };
      }
      if (action === FormActionTypes.Submit) {
        if (!onSubmit) return;
        return (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          setLastClicked(id);
          onSubmit(e, onSuccess);
        };
      }

      if (action === FormActionTypes.Navigate) {
        return onSuccess;
      }
    },
    [onDiscard, onSaveDraft, onSubmit, navigate]
  );

  const renderButton = (buttonConfig: ButtonConfig) => {
    const { id, label, action, buttonProps } = buttonConfig;
    const isSubmit =
      action === FormActionTypes.Save || action === FormActionTypes.Submit;

    if (
      action === FormActionTypes.Discard &&
      onDiscard &&
      typeof onDiscard === 'string'
    ) {
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
    <Stack direction='row' spacing={2} justifyContent={'space-between'}>
      <Stack direction='row' spacing={2}>
        {leftConfig.map((c) => renderButton(c))}
      </Stack>
      {centerConfig.length === 0 && (
        <AssessmentLastUpdated
          lastSaved={lastSaved}
          lastSubmitted={lastSubmitted}
        />
      )}

      {centerConfig && centerConfig.length > 0 && (
        <Stack alignItems={'center'}>
          <Stack direction='row' spacing={2}>
            {centerConfig.map((c) => renderButton(c))}
          </Stack>
          <AssessmentLastUpdated
            lastSaved={lastSaved}
            lastSubmitted={lastSubmitted}
            sx={{
              fontSize: 12,
              pb: 0,
              mb: -1,
            }}
          />
        </Stack>
      )}
      {rightConfig && rightConfig.length > 0 && (
        <Stack direction='row' spacing={2}>
          {rightConfig.map((c) => renderButton(c))}
        </Stack>
      )}
    </Stack>
  );
};

export default FormActions;
