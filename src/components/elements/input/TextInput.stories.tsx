import { Box, Typography } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import TextInput from './TextInput';

export default {
  component: TextInput,
  argTypes: { label: { control: 'text' }, horizontal: { control: 'boolean' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof TextInput>;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};
export const Labeled: Story = {
  args: {
    label: 'Label',
    helperText: 'Helper text here',
  },
};
export const LabeledWithElement: Story = {
  args: {
    label: <Typography variant='h4'>H4 label</Typography>,
  },
};
export const MaxLength: Story = {
  args: { label: 'Max string length', max: 6 },
};
