import { Alert, Stack } from '@mui/material';

import TextInput from '@/components/elements/input/TextInput';

interface Props {
  value: string;
  onChange: (value: string) => void;
  validationError?: string;
}

const FreeTextExpressionEditor: React.FC<Props> = ({
  value,
  onChange,
  validationError,
}) => (
  <Stack gap={2}>
    <Alert severity='info'>
      Use free text for custom functions or complex boolean logic that the
      structured builder does not support.
    </Alert>
    {validationError && <Alert severity='error'>{validationError}</Alert>}
    <TextInput
      label='Expression'
      value={value}
      minRows={6}
      multiline
      placeholder='current_age >= 18 AND veteran_status = 1'
      onChange={(event) => onChange(event.target.value)}
    />
  </Stack>
);

export default FreeTextExpressionEditor;
