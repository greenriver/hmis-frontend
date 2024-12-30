import { Meta, StoryObj } from '@storybook/react';

import HouseholdMemberTable from './HouseholdMemberTable';

import { enrollmentWithHoHMock, RITA_ACKROYD } from '@/test/__mocks__/requests';

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
    clientId: RITA_ACKROYD.id,
    enrollmentId: '5',
  },
};
