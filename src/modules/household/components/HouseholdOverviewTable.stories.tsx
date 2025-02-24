import { Meta, StoryObj } from '@storybook/react';

import HouseholdOverviewTable from './HouseholdOverviewTable';

import { enrollmentWithHoHMock } from '@/test/__mocks__/requests';

export default {
  component: HouseholdOverviewTable,
  parameters: {
    dashboardContext: 'enrollment',
    apolloClient: {
      mocks: [enrollmentWithHoHMock],
    },
  },
} as Meta<typeof HouseholdOverviewTable>;

type Story = StoryObj<typeof HouseholdOverviewTable>;

export const Default: Story = {
  args: {
    enrollmentId: '5',
  },
};
