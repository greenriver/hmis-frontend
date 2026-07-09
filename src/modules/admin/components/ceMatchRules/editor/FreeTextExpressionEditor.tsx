import { Alert, Stack } from '@mui/material';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './ceMatchRuleFormUtil';
import ControlledCodeTextInput from '@/modules/form/components/rhf/ControlledCodeTextInput';

interface Props {
  control: Control<CeMatchRuleFormValues>;
}

const FreeTextExpressionEditor: React.FC<Props> = ({ control }) => (
  <Stack gap={2}>
    <Alert severity='info'>
      Use free text for custom functions or complex boolean logic that the
      structured builder does not support.
    </Alert>
    <ControlledCodeTextInput
      name='freeTextExpression'
      control={control}
      label='Expression'
      placeholder='current_age >= 18 AND veteran_status = 1'
      required
    />
  </Stack>
);

export default FreeTextExpressionEditor;
