import { Meta, StoryObj } from '@storybook/react';

import ProfileLayout from './ProfileLayout';

import {
  clientDetailFormsMock,
  clientWithEnrollmentsMock,
  getClientPermissionMocks,
  RITA_ACKROYD,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ProfileLayout',
  component: ProfileLayout,
  parameters: {
    apolloClient: {
      mocks: [
        getClientPermissionMocks,
        clientDetailFormsMock,
        clientWithEnrollmentsMock,
      ],
    },
  },
} as Meta<typeof ProfileLayout>;

type Story = StoryObj<typeof ProfileLayout>;

export const Default: Story = {
  args: { client: RITA_ACKROYD as ClientFieldsFragment },
};
