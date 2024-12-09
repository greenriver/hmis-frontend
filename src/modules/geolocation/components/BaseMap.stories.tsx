import { Meta, StoryObj } from '@storybook/react';

import BaseMap from './BaseMap';

export default {
  component: BaseMap,
} as Meta<typeof BaseMap>;

type Story = StoryObj<typeof BaseMap>;

export const Default: Story = {
  args: {
    coordinates: { latitude: 42.853245, longitude: -72.558579 },
  },
};
