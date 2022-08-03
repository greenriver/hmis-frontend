import { DateType } from '@date-io/type';
import { SxProps } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';

import TextInput from './TextInput';

interface Props
  extends Omit<DatePickerProps<DateType, DateType>, 'renderInput'> {
  sx?: SxProps;
}

const DatePicker: React.FC<Props> = ({ sx, ...props }: Props) => (
  <MuiDatePicker
    {...props}
    renderInput={(params) => <TextInput sx={sx} {...params} />}
  />
);

export default DatePicker;
