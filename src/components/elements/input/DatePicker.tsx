import { DateType } from '@date-io/type';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';
import { format } from 'date-fns';

import TextField from './TextField';

interface Props
  extends Omit<
    DatePickerProps<DateType, DateType>,
    'onChange' | 'value' | 'renderInput'
  > {
  onChange: (date: string | null) => void;
  value: string | null;
}

const DatePicker: React.FC<Props> = ({ value, onChange, ...props }) => (
  <MuiDatePicker
    {...props}
    value={value ? new Date(value) : null}
    renderInput={(params) => <TextField {...params} />}
    onChange={(newValue) => {
      const formatted = newValue ? format(newValue, 'dd/MM/yyyy') : newValue;
      onChange(formatted);
    }}
  />
);

export default DatePicker;
