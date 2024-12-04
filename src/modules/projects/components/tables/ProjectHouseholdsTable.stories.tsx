import { Meta, StoryObj } from '@storybook/react';

import ProjectHouseholdsTable from './ProjectHouseholdsTable';

// import { enrollmentWithHoHMock, RITA_ACKROYD } from '@/test/__mocks__/requests';

export default {
  component: ProjectHouseholdsTable,
  parameters: {
    // dashboardContext: 'enrollment',
    // apolloClient: {
    //   mocks: [enrollmentWithHoHMock],
    // },
  },
} as Meta<typeof ProjectHouseholdsTable>;

type Story = StoryObj<typeof ProjectHouseholdsTable>;

export const Default: Story = {
  args: {
    // clientId: RITA_ACKROYD.id,
    // enrollmentId: '5',
  },
};
