import { Meta, StoryObj } from '@storybook/react';

import { LocationPositionError } from '../hooks/useGeolocation';
import GeolocationErrorAlert from './GeolocationErrorAlert';

export default {
  component: GeolocationErrorAlert,
} as Meta<typeof GeolocationErrorAlert>;

type Story = StoryObj<typeof GeolocationErrorAlert>;

export const Default: Story = {
  args: { error: LocationPositionError.PERMISSION_DENIED },
};
