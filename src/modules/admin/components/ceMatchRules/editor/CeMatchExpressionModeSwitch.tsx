import CodeIcon from '@mui/icons-material/Code';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import {
  Control,
  UseFormGetValues,
  UseFormReset,
  UseFormSetValue,
  useFormState,
} from 'react-hook-form';

import {
  CeMatchExpressionMode,
  CeMatchRuleFormValues,
  defaultCeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';

interface Props {
  mode: CeMatchExpressionMode;
  control: Control<CeMatchRuleFormValues>;
  defaultValues: CeMatchRuleFormValues;
  getValues: UseFormGetValues<CeMatchRuleFormValues>;
  isNewRule: boolean;
  reset: UseFormReset<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
}

const CeMatchExpressionModeSwitch: React.FC<Props> = ({
  mode,
  control,
  defaultValues,
  getValues,
  isNewRule,
  reset,
  setValue,
}) => {
  const [pendingMode, setPendingMode] = useState<CeMatchExpressionMode>();

  const { dirtyFields } = useFormState({
    control,
    name: mode === 'freeText' ? 'freeTextExpression' : 'structuredExpression',
  });

  const switchEditorMode = (nextMode: CeMatchExpressionMode) => {
    const resetValues = isNewRule
      ? // If this is a new rule, reset to a blank form.
        defaultCeMatchRuleFormValues()
      : // If we are editing an existing rule, reset to the currently-saved values.
        defaultValues;

    reset({
      ...getValues(),
      mode: nextMode,
      freeTextExpression: resetValues.freeTextExpression,
      structuredExpression: resetValues.structuredExpression,
    });

    setValue('mode', nextMode, { shouldDirty: true });
    setPendingMode(undefined);
  };

  const handleSwitchEditorMode = () => {
    const nextMode = mode === 'structured' ? 'freeText' : 'structured';
    const isDirty =
      mode === 'freeText'
        ? !!dirtyFields.freeTextExpression
        : !!dirtyFields.structuredExpression;

    // If the form is dirty, ask the user to confirm before switching
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
          Switching editors will clear your unsaved changes.{' '}
          <strong>This cannot be undone.</strong>
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default CeMatchExpressionModeSwitch;
