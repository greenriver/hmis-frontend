import { Meta, StoryFn } from '@storybook/react';

import React from 'react';
import GeolocationInput from './GeolocationInput';

export default {
  title: 'GeolocationInput',
  component: GeolocationInput,
  argTypes: { label: { control: 'text' }, horizontal: { control: 'boolean' } },
  // decorators: [
  //   (Story) => (
  //     <Box sx={{ width: 400 }}>
  //       <Story />
  //     </Box>
  //   ),
  // ],
} as Meta<typeof GeolocationInput>;

const Template: StoryFn<typeof GeolocationInput> = (args) => (
  <GeolocationInput {...args} />
);
export const Default = Template.bind({});
