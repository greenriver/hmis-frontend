import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
} from '@mui/material';

import { sub } from 'date-fns';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { ServicePeriod } from '../../types';
import CommonDialog from '@/components/elements/CommonDialog';
import DatePicker from '@/components/elements/input/DatePicker';
import GenericSelect from '@/components/elements/input/GenericSelect';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';

const today = new Date();

const fixedRanges: Record<string, ServicePeriod> = {
  Yesterday: { start: sub(today, { days: 1 }), end: sub(today, { days: 1 }) },
  LastWeek: { start: sub(today, { days: 7 }), end: today },
  LastTwoWeeks: { start: sub(today, { days: 14 }), end: today },
  LastMonth: { start: sub(today, { days: 30 }), end: today },
};
type FixedRange = keyof typeof fixedRanges;
function isFixedRange(value: string): value is FixedRange {
  return !!value && Object.keys(fixedRanges).includes(value);
}

const CustomOption = {
  label: 'Custom Date Range',
  id: 'Custom',
  groupLabel: 'Custom',
};
const options = [
  { label: 'Yesterday', id: 'Yesterday' },
  { label: 'Last Week', id: 'LastWeek' },
  { label: 'Last Two Weeks', id: 'LastTwoWeeks' },
  { label: 'Last Month', id: 'LastMonth' },
  CustomOption,
];

type Option = (typeof options)[0];
interface Props {
  initialValue?: ServicePeriod;
  onChange: (value?: ServicePeriod) => void;
  disabled?: boolean;
}

const ServiceDateRangeSelect: React.FC<Props> = ({
  initialValue, // initial value from serach params
  onChange,
  disabled,
}) => {
  const [selected, setSelected] = useState<Option | null>(
    initialValue ? CustomOption : null
  );
  const [startDate, setStartDate] = useState<Date | null>(
    initialValue?.start || null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialValue?.end || null
  );
  const [open, setOpen] = useState<boolean>(false);

  const handleChange = useCallback(
    (_event: SyntheticEvent, value: Option | null) => {
      setSelected(value);
      if (value && isFixedRange(value.id)) onChange(fixedRanges[value.id]);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelected(null);
    onChange(undefined);
  }, [onChange]);

  useEffect(() => {
    if (selected?.id !== 'Custom') {
      setStartDate(null);
      setEndDate(null);
    }
  }, [selected]);

  return (
    <>
      <Stack direction='row' gap={2}>
        <GenericSelect<Option, false, undefined>
          value={selected || null}
          onChange={handleChange}
          options={options}
          fullWidth={false}
          sx={{ width: '60%' }}
          blurOnSelect
          disabled={disabled}
          getOptionLabel={(option) =>
            option.id === 'Custom' &&
            selected === option &&
            startDate &&
            endDate
              ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(
                  endDate
                )}`
              : option.label
          }
          textInputProps={{ placeholder: 'Select Date Range...' }}
          renderOption={(props, option) => {
            const datePickerLink = (
              <Link
                component='button'
                variant='body1'
                onClick={() => setOpen(true)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {option.label}
              </Link>
            );

            return (
              <li {...props}>
                {option.id === 'Custom' ? datePickerLink : option.label}
              </li>
            );
          }}
          disableClearable
        />
        <Button
          color='error'
          variant='outlined'
          onClick={handleClear}
          disabled={disabled || !selected}
        >
          Clear Results
        </Button>
      </Stack>
      <CommonDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setStartDate(null);
          setEndDate(null);
          setSelected(null);
        }}
        enableBackdropClick
      >
        <DialogTitle>Service Period</DialogTitle>
        <DialogContent>
          <Stack gap={2} my={2}>
            <DatePicker
              label='Start Date'
              value={startDate}
              onChange={setStartDate}
              sx={{ width: '200px' }}
              max={new Date()}
            />
            <DatePicker
              label='End Date'
              value={endDate}
              onChange={setEndDate}
              sx={{ width: '200px' }}
              max={new Date()}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            onClick={() => {
              if (startDate && endDate) {
                onChange({ start: startDate, end: endDate });
              } else {
                setStartDate(null);
                setEndDate(null);
                onChange(undefined);
              }
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default ServiceDateRangeSelect;
