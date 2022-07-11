import { DateType } from '@date-io/type';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';

import TextField from './TextField';

// interface Props
//   extends Omit<DatePickerProps<DateType, DateType>, 'value' | 'renderInput'> {
//   onChange: (date: string | null) => void;
//   value: string | null;
// }

const DatePicker: React.FC<
  Omit<DatePickerProps<DateType, DateType>, 'renderInput'>
> = (props) => (
  <MuiDatePicker
    {...props}
    renderInput={(params) => <TextField {...params} />}
  />
);

export default DatePicker;
