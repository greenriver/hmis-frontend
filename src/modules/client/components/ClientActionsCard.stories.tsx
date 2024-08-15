import { Meta, StoryObj } from '@storybook/react';

import ClientActionsCard from './ClientActionsCard';

import {
  getClientPermissionMocks,
  RITA_ACKROYD,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientActionsCard',
  component: ClientActionsCard,
  parameters: {
    apolloClient: {
      mocks: [getClientPermissionMocks],
    },
  },
} as Meta<typeof ClientActionsCard>;

type Story = StoryObj<typeof ClientActionsCard>;

export const Default: Story = {
  args: {
    client: RITA_ACKROYD as ClientFieldsFragment,
  },
};
