import { Meta, StoryObj } from '@storybook/react';

import HouseholdMemberTable from './HouseholdMemberTable';

import { enrollmentWithHoHMock } from '@/test/__mocks__/requests';

export default {
  component: HouseholdMemberTable,
  parameters: {
    dashboardContext: 'enrollment',
    apolloClient: {
      mocks: [enrollmentWithHoHMock],
    },
  },
} as Meta<typeof HouseholdMemberTable>;

type Story = StoryObj<typeof HouseholdMemberTable>;

export const Default: Story = {
  args: {
    enrollmentId: '5',
  },
};
