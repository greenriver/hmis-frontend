import { Box, Paper, Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import GenericSelect from './GenericSelect';

interface Option {
  code: string;
  label: string;
}

const mockOptions: Option[] = [
  { code: 'option1', label: 'Option 1' },
  { code: 'option2', label: 'Option 2' },
  { code: 'option3', label: 'Option 3' },
  { code: 'option4', label: 'Option 4' },
];

export default {
  component: GenericSelect,
  decorators: [
    (Story) => (
      <Box sx={{ width: 500 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof GenericSelect>;

type Story = StoryObj<typeof GenericSelect<Option, false, false>>;

export const Default: Story = {
  args: {
    label: 'Select an option',
    options: mockOptions,
    getOptionLabel: (option) => option.label,
    isOptionEqualToValue: (option, value) => option.code === value.code,
    textInputProps: {
      placeholder: 'Choose...',
      helperText: 'This is helper text',
    },
  },
};

// Interactive story showing all variants side by side
export const AllVariants = () => {
  const [defaultValue, setDefaultValue] = useState<Option | null>(null);
  const [warningValue, setWarningValue] = useState<Option | null>(null);
  const [errorValue, setErrorValue] = useState<Option | null>(null);
  const [multipleValue, setMultipleValue] = useState<Option[]>([
    mockOptions[0],
    mockOptions[2],
  ]);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={3}>
        <GenericSelect<Option, false, false>
          label='Default (no color)'
          options={mockOptions}
          value={defaultValue}
          onChange={(_, value) => setDefaultValue(value as Option | null)}
          getOptionLabel={(option) => (option as Option).label}
          isOptionEqualToValue={(option, value) =>
            (option as Option).code === (value as Option).code
          }
          textInputProps={{
            placeholder: 'Choose...',
            helperText: 'Standard appearance',
          }}
        />
        <GenericSelect<Option, false, false>
          label='Warning variant'
          options={mockOptions}
          value={warningValue}
          onChange={(_, value) => setWarningValue(value as Option | null)}
          getOptionLabel={(option) => (option as Option).label}
          isOptionEqualToValue={(option, value) =>
            (option as Option).code === (value as Option).code
          }
          textInputProps={{
            placeholder: 'Choose...',
            helperText: 'Orange styling with light background',
          }}
          color='warning'
        />
        <GenericSelect<Option, false, false>
          label='Error variant'
          options={mockOptions}
          value={errorValue}
          onChange={(_, value) => setErrorValue(value as Option | null)}
          getOptionLabel={(option) => (option as Option).label}
          isOptionEqualToValue={(option, value) =>
            (option as Option).code === (value as Option).code
          }
          textInputProps={{
            placeholder: 'Choose...',
            helperText: 'Red styling with light background',
          }}
          color='error'
        />
        <GenericSelect<Option, false, false>
          label='Disabled field'
          options={mockOptions}
          value={mockOptions[1]}
          getOptionLabel={(option) => (option as Option).label}
          isOptionEqualToValue={(option, value) =>
            (option as Option).code === (value as Option).code
          }
          disabled
          textInputProps={{
            helperText: 'This field is disabled',
          }}
        />
        <GenericSelect<Option, true, false>
          label='Multiple select with warning'
          options={mockOptions}
          value={multipleValue}
          onChange={(_, value) => setMultipleValue(value as Option[])}
          getOptionLabel={(option) => (option as Option).label}
          isOptionEqualToValue={(option, value) =>
            (option as Option).code === (value as Option).code
          }
          textInputProps={{
            placeholder: 'Choose multiple...',
            helperText: 'Multiple select using warning color',
          }}
          color='warning'
          multiple
        />
      </Stack>
    </Paper>
  );
};
