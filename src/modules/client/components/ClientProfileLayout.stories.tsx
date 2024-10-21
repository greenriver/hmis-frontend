import { Meta, StoryObj } from '@storybook/react';

import ClientProfileLayout from './ClientProfileLayout';

import {
  clientDetailFormsMock,
  clientWithEnrollmentsMock,
  getClientPermissionMocks,
  RITA_ACKROYD,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  component: ClientProfileLayout,
  parameters: {
    apolloClient: {
      mocks: [
        getClientPermissionMocks,
        clientDetailFormsMock,
        clientWithEnrollmentsMock,
      ],
    },
  },
} as Meta<typeof ClientProfileLayout>;

type Story = StoryObj<typeof ClientProfileLayout>;

export const Default: Story = {
  args: { client: RITA_ACKROYD as ClientFieldsFragment },
};
