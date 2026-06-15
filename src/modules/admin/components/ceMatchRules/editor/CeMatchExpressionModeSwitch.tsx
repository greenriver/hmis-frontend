import CodeIcon from '@mui/icons-material/Code';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import {
  CeMatchExpressionMode,
  CeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { CeMatchRuleBooleanOperator } from '@/types/gqlTypes';

interface Props {
  mode: CeMatchExpressionMode;
  getValues: UseFormGetValues<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
}

const hasValue = (value?: string | null) => !!value?.trim();

const hasExpressionProgress = ({
  mode,
  structuredExpression,
  freeTextExpression,
}: CeMatchRuleFormValues) => {
  if (mode === 'freeText') return hasValue(freeTextExpression);

  return (
    structuredExpression.clauses.length > 1 ||
    structuredExpression.operator !== CeMatchRuleBooleanOperator.And ||
    structuredExpression.clauses.some(
      ({ source, customAssessmentFormIdentifier, field, value }) =>
        hasValue(source) ||
        hasValue(customAssessmentFormIdentifier) ||
        hasValue(field) ||
        hasValue(value)
    )
  );
};

const CeMatchExpressionModeSwitch: React.FC<Props> = ({
  mode,
  getValues,
  setValue,
}) => {
  const [pendingMode, setPendingMode] = useState<CeMatchExpressionMode>();

  const switchEditorMode = (nextMode: CeMatchExpressionMode) => {
    setValue('mode', nextMode, { shouldDirty: true });
    setPendingMode(undefined);
  };

  const handleSwitchEditorMode = () => {
    const nextMode = mode === 'structured' ? 'freeText' : 'structured';
    if (hasExpressionProgress(getValues())) {
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
