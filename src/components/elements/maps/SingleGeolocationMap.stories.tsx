import { Meta, StoryObj } from '@storybook/react';

import SingleGeolocationMap from './SingleGeolocationMap';

export default {
  component: SingleGeolocationMap,
} as Meta<typeof SingleGeolocationMap>;

type Story = StoryObj<typeof SingleGeolocationMap>;

export const Default: Story = {
  args: {
    coordinates: { latitude: 42.853245, longitude: -72.558579 },
  },
};
