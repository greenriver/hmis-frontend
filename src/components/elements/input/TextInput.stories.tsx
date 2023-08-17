import { Box, Typography } from '@mui/material';
import { ComponentStory, Meta } from '@storybook/react';

import TextInput from './TextInput';

export default {
  title: 'TextInput',
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

const Template: ComponentStory<typeof TextInput> = (args) => (
  <TextInput {...args} />
);
export const Default = Template.bind({});
export const Labeled = Template.bind({});
Labeled.args = { label: 'Label', helperText: 'Helper text here' };

export const LabeledWithElement = Template.bind({});
LabeledWithElement.args = {
  label: <Typography variant='h4'>H4 label</Typography>,
};

export const MaxLength = Template.bind({});
MaxLength.args = { label: 'Max string length', max: 6 };
