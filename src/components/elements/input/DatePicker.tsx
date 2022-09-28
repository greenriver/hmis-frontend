import { DateType } from '@date-io/type';
import { SxProps, Theme } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';

import TextInput, { TextInputProps } from './TextInput';

interface Props
  extends Omit<DatePickerProps<DateType, DateType>, 'renderInput'> {
  sx?: SxProps<Theme>;
  textInputProps?: TextInputProps;
}

const DatePicker: React.FC<Props> = ({
  sx,
  textInputProps,
  ...props
}: Props) => (
  <MuiDatePicker
    {...props}
    renderInput={(params) => (
      <TextInput sx={sx} {...textInputProps} {...params} />
    )}
  />
);

export default DatePicker;
