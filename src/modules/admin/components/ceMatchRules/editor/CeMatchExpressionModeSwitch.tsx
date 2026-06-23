import CodeIcon from '@mui/icons-material/Code';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { Control, UseFormSetValue, useFormState } from 'react-hook-form';

import {
  CeMatchExpressionMode,
  CeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  mode: CeMatchExpressionMode;
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
}

const CeMatchExpressionModeSwitch: React.FC<Props> = ({
  mode,
  control,
  setValue,
}) => {
  const [pendingMode, setPendingMode] = useState<CeMatchExpressionMode>();
  const { dirtyFields } = useFormState({
    control,
    name: mode === 'freeText' ? 'freeTextExpression' : 'structuredExpression',
  });

  const switchEditorMode = (nextMode: CeMatchExpressionMode) => {
    setValue('mode', nextMode, { shouldDirty: true });
    setPendingMode(undefined);
  };

  const handleSwitchEditorMode = () => {
    const nextMode = mode === 'structured' ? 'freeText' : 'structured';
    const isDirty =
      mode === 'freeText'
        ? !!dirtyFields.freeTextExpression
        : !!dirtyFields.structuredExpression;

    if (isDirty) {
      setPendingMode(nextMode);
      return;
    }

    switchEditorMode(nextMode);
  };

  return (
    <>
      <Button
        size='small'
        variant='text'
        startIcon={<CodeIcon />}
        onClick={handleSwitchEditorMode}
      >
        {mode === 'structured'
          ? 'Switch to Advanced Expression Editor'
          : 'Switch to Structured Editor'}
      </Button>
      <ConfirmationDialog
        id='confirmSwitchExpressionEditor'
        open={!!pendingMode}
        title='Switch Expression Editor?'
        loading={false}
        confirmText='Switch Editor'
        onConfirm={() => pendingMode && switchEditorMode(pendingMode)}
        onCancel={() => setPendingMode(undefined)}
      >
        <Typography variant='body2'>
          Switching editors will clear your current progress.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default CeMatchExpressionModeSwitch;
