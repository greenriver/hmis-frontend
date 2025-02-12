import { Card } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import ProjectHouseholdsTable from './ProjectHouseholdsTable';
import { getProjectHouseholdsMock } from '@/test/__mocks__/requests';

export default {
  component: ProjectHouseholdsTable,
  parameters: {
    dashboardContext: 'project',
    apolloClient: {
      mocks: [getProjectHouseholdsMock],
    },
  },
  decorators: [
    (Story) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
} as Meta<typeof ProjectHouseholdsTable>;

type Story = StoryObj<typeof ProjectHouseholdsTable>;

export const Default: Story = {};
