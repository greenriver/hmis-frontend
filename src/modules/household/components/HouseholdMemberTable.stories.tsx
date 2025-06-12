import { Meta, StoryObj } from '@storybook/react';

import HouseholdMemberTable from './HouseholdMemberTable';

import {
  enrollmentWithHoHMock,
  fakeHousehold,
  fakeProject,
  getGlobalFeatureFlagsMock,
} from '@/test/__mocks__/requests';
import { HouseholdFieldsFragment } from '@/types/gqlTypes';

export default {
  component: HouseholdMemberTable,
  parameters: {
    dashboardContext: 'enrollment',
    apolloClient: {
      mocks: [enrollmentWithHoHMock, getGlobalFeatureFlagsMock],
    },
  },
} as Meta<typeof HouseholdMemberTable>;

type Story = StoryObj<typeof HouseholdMemberTable>;

export const Default: Story = {
  args: {
    household: fakeHousehold() as unknown as HouseholdFieldsFragment,
    project: fakeProject(),
    canEdit: true,
  },
};
