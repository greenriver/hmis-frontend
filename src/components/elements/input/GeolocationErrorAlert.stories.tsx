import { Meta, StoryObj } from '@storybook/react';

import GeolocationErrorAlert from './GeolocationErrorAlert';
import { LocationPositionError } from '@/hooks/useGeolocation';

export default {
  component: GeolocationErrorAlert,
} as Meta<typeof GeolocationErrorAlert>;

type Story = StoryObj<typeof GeolocationErrorAlert>;

export const Default: Story = {
  args: { error: LocationPositionError.PERMISSION_DENIED },
};
