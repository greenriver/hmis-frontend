import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import NumberInput from './NumberInput';

export default {
  title: 'Input Elements/NumberInput',
  component: NumberInput,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof NumberInput>;

type Story = StoryObj<typeof NumberInput>;

export const Labeled: Story = {
  args: { label: 'Enter amount', min: 0, max: 10 },
};
