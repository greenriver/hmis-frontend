import { Alert, Stack } from '@mui/material';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './CeMatchRuleForm';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';

interface Props {
  control: Control<CeMatchRuleFormValues>;
  validationError?: string;
}

const FreeTextExpressionEditor: React.FC<Props> = ({
  control,
  validationError,
}) => (
  <Stack gap={2}>
    <Alert severity='info'>
      Use free text for custom functions or complex boolean logic that the
      structured builder does not support.
    </Alert>
    {validationError && <Alert severity='error'>{validationError}</Alert>}
    <ControlledTextInput
      name='freeTextExpression'
      control={control}
      label='Expression'
      minRows={6}
      multiline
      placeholder='current_age >= 18 AND veteran_status = 1'
      required
      shouldUnregister={false}
    />
  </Stack>
);

export default FreeTextExpressionEditor;
