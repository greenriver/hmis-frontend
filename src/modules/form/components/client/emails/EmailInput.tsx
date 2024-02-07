import { Grid, Stack } from '@mui/material';

import { getRequiredLabel } from '../../RequiredLabel';
import { EmailInputType } from '../types';

import TextInput from '@/components/elements/input/TextInput';

const EmailInput = ({
  value,
  onChange,
}: {
  value: EmailInputType;
  onChange: (value: EmailInputType) => void;
}) => {
  return (
    <Stack direction={'column'} rowGap={0}>
      <Grid container columnSpacing={8} rowSpacing={2}>
        <Grid item xs={7}>
          <TextInput
            value={value.value || ''}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
            label={getRequiredLabel('Email')}
          />
        </Grid>
        <Grid item xs={5}>
          <TextInput
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            label={getRequiredLabel('Notes')}
            multiline
            minRows={1}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default EmailInput;
