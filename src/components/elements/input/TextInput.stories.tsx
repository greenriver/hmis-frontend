import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import TextInput from './TextInput';

export default {
  title: 'TextInput',
  component: TextInput,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (args) => (
  <TextInput {...args} />
);
export const Default = Template.bind({});
export const Labeled = Template.bind({});
Labeled.args = { label: 'Label', helperText: 'Helper text here' };
