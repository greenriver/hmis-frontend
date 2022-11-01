import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
} from '@mui/material';

import { DynamicInputCommonProps } from '@/modules/form/components/DynamicField';

export interface Props
  extends Omit<FormControlLabelProps, 'control' | 'label'> {
  name?: string;
}

const LabeledCheckbox = ({
  label,
  error,
  ...props
}: Props & DynamicInputCommonProps) => (
  <FormGroup>
    <FormControlLabel
      control={<Checkbox />}
      labelPlacement='end'
      label={label}
      sx={{
        color: error ? (theme) => theme.palette.error.main : undefined,
        '.MuiCheckbox-root': {
          color: error ? (theme) => theme.palette.error.main : undefined,
        },
      }}
      {...props}
    />
  </FormGroup>
);

export default LabeledCheckbox;
