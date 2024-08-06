import { Meta, StoryFn } from '@storybook/react';

import React from 'react';
import GeolocationInput from './GeolocationInput';

export default {
  title: 'GeolocationInput',
  component: GeolocationInput,
} as Meta<typeof GeolocationInput>;

const Template: StoryFn<typeof GeolocationInput> = (args) => (
  <GeolocationInput {...args} />
);
export const Default = Template.bind({});
