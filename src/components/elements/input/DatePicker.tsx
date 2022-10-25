import { DateType } from '@date-io/type';
import { SxProps, Theme } from '@mui/material';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';

import TextInput, { TextInputProps } from './TextInput';

import { DynamicInputCommonProps } from '@/modules/form/formUtil';

interface Props
  extends Omit<DatePickerProps<DateType, DateType>, 'renderInput'> {
  sx?: SxProps<Theme>;
  textInputProps?: TextInputProps;
}

const DatePicker: React.FC<Props> = ({
  sx,
  textInputProps,
  error,
  ...props
}: Props & DynamicInputCommonProps) => (
  <MuiDatePicker
    {...props}
    renderInput={(params) => (
      <TextInput sx={sx} {...textInputProps} {...params} error={error} />
    )}
  />
);

export default DatePicker;
