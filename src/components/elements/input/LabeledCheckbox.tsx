import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  FormGroup,
  Typography,
} from '@mui/material';

export interface Props extends Omit<FormControlLabelProps, 'control'> {
  name?: string;
}

const LabeledCheckbox = ({ label, ...props }: Props) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox />}
        labelPlacement='end'
        label={<Typography variant='body2'>{label}</Typography>}
        {...props}
      />
    </FormGroup>
  );
};

export default LabeledCheckbox;
