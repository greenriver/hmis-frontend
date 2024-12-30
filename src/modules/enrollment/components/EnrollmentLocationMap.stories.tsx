import { Meta, StoryObj } from '@storybook/react';

import EnrollmentLocationMap from './EnrollmentLocationMap';
import { getEnrollmentGeolocationsMock } from '@/test/__mocks__/requests';

export default {
  component: EnrollmentLocationMap,
  parameters: {
    apolloClient: {
      mocks: [getEnrollmentGeolocationsMock],
    },
  },
} as Meta<typeof EnrollmentLocationMap>;

type Story = StoryObj<typeof EnrollmentLocationMap>;

export const Default: Story = {
  args: {
    enrollmentId: '1',
    clientName: 'John Doe',
  },
};
