import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
} from '@mui/material';

import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { FixedServiceRanges, ServicePeriod, isFixedRange } from '../../types';
import CommonDialog from '@/components/elements/CommonDialog';
import DatePicker from '@/components/elements/input/DatePicker';
import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';

const CustomOption = {
  label: 'Custom Date Range',
  id: 'Custom',
};

const options = [
  { label: 'Today', id: 'Today' },
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
  // currently selected option. if there is an initial service period from search params, set the initial selection to "custom" with that date range
  const [selected, setSelected] = useState<Option | null>(
    initialValue ? CustomOption : null
  );

  // custom start date
  const [startDate, setStartDate] = useState<Date | null>(
    initialValue?.start || null
  );

  // custom end date
  const [endDate, setEndDate] = useState<Date | null>(
    initialValue?.end || null
  );

  // whether custom dialog is open
  const [open, setOpen] = useState<boolean>(false);

  const handleChange = useCallback(
    (_event: SyntheticEvent, value: Option | null) => {
      setSelected(value);
      if (value && isFixedRange(value.id)) {
        onChange(FixedServiceRanges[value.id]);
      }
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelected(null);
    onChange(undefined);
  }, [onChange]);

  useEffect(() => {
    // if selection changes and its not custom, clear out the start/end dates
    if (selected?.id !== CustomOption.id) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [selected]);

  const renderOption: GenericSelectProps<Option, false, false>['renderOption'] =
    useCallback(
      (props: React.HTMLAttributes<HTMLLIElement>, option: Option) => {
        if (option.id === CustomOption.id) {
          return (
            <li {...props}>
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
            </li>
          );
        }

        return <li {...props}>{option.label}</li>;
      },
      []
    );

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
          getOptionLabel={(option) => {
            // If custom option is selected, label it as the date range
            if (
              option.id === 'Custom' &&
              selected === option &&
              startDate &&
              endDate
            ) {
              return `${formatDateForDisplay(
                startDate
              )} - ${formatDateForDisplay(endDate)}`;
            }

            return option.label;
          }}
          textInputProps={{ placeholder: 'Select Date Range...' }}
          renderOption={renderOption}
          disableClearable
        />
        <Button
          color='error'
          variant='outlined'
          onClick={handleClear}
          disabled={disabled || !selected}
        >
          Reset Search
        </Button>
      </Stack>
      <CommonDialog
        open={open}
        onClose={() => setOpen(false)}
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
            disabled={!startDate || !endDate}
            onClick={() => {
              if (startDate && endDate) {
                onChange({ start: startDate, end: endDate });
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
