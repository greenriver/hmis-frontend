import { Box, Divider, ListItemIcon, MenuItem } from '@mui/material';
import { sub } from 'date-fns';
import { ChangeEvent, useCallback, useState } from 'react';
import { ServicePeriod } from '../../types';
import TextInput from '@/components/elements/input/TextInput';
import { CalendarIcon } from '@/components/elements/SemanticIcons';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';

const today = new Date();

type FixedRange = 'Yesterday' | 'LastWeek' | 'LastTwoWeeks' | 'LastMonth';
type Option = FixedRange | 'Custom';

const fixedRanges: Record<FixedRange, ServicePeriod> = {
  Yesterday: { start: sub(today, { days: 1 }), end: sub(today, { days: 1 }) },
  LastWeek: { start: sub(today, { days: 7 }), end: today },
  LastTwoWeeks: { start: sub(today, { days: 14 }), end: today },
  LastMonth: { start: sub(today, { days: 30 }), end: today },
};

function isFixedRange(value: string): value is FixedRange {
  return !!value && Object.keys(fixedRanges).includes(value);
}

interface Props {
  onChange: (value: ServicePeriod) => void;
}

const ServiceDateRangeSelect: React.FC<Props> = ({ onChange }) => {
  const [selected, setSelected] = useState<Option | ''>('');

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.value as Option;
      setSelected(selected);

      if (isFixedRange(selected)) {
        onChange(fixedRanges[selected]);
      } else if (selected === 'Custom') {
        // todo
      }
    },
    [onChange]
  );
  return (
    <TextInput
      select
      label='Service Date Range'
      value={selected}
      onChange={handleChange}
      SelectProps={{
        placeholder: 'select',
        autoWidth: true,
        displayEmpty: true,
        renderValue: (value: any) => {
          if (!value)
            return (
              <Box component='span' color='text.secondary'>
                Select date range...
              </Box>
            );
          if (value === 'Custom') return 'custom date range...';

          const label = value.replace(/([A-Z])/g, ' $1').trim();
          const range = fixedRanges[value as FixedRange];
          const startLabel = formatDateForDisplay(range.start);
          const endLabel = formatDateForDisplay(range.end);
          if (startLabel === endLabel) {
            return `${label} (${startLabel})`;
          }
          return `${label} (${startLabel} - ${endLabel})`;
        },
      }}
    >
      <MenuItem value={'Yesterday'}>Yesterday</MenuItem>
      <MenuItem value={'LastWeek'}>Last Week</MenuItem>
      <MenuItem value={'LastTwoWeeks'}>Last Two Weeks</MenuItem>
      <MenuItem value={'LastMonth'}>Last Month</MenuItem>
      <Divider />
      <MenuItem value={'Custom'}>
        <ListItemIcon>
          <CalendarIcon fontSize='small' />
        </ListItemIcon>
        Custom Date Range
      </MenuItem>
    </TextInput>
  );
};

export default ServiceDateRangeSelect;
