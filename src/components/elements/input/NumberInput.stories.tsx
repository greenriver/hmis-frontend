import { Box } from '@mui/material';
import { Meta, ComponentStory } from '@storybook/react';

import NumberInput from './NumberInput';

export default {
  title: 'NumberInput',
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

const Template: ComponentStory<typeof NumberInput> = (args) => (
  <NumberInput {...args} />
);

export const Labeled = Template.bind({});
Labeled.args = { label: 'Enter amount', min: 0, max: 10 };
