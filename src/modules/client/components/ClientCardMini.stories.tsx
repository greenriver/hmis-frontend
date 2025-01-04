import { Meta, StoryObj } from '@storybook/react';

import ClientCardMini from './ClientCardMini';

import { clientImageLookupMock, RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  component: ClientCardMini,
  parameters: {
    apolloClient: {
      mocks: [clientImageLookupMock],
    },
  },
} as Meta<typeof ClientCardMini>;

type Story = StoryObj<typeof ClientCardMini>;

export const Default: Story = {
  args: {
    client: RITA_ACKROYD as ClientFieldsFragment,
  },
};

export const WithoutImage: Story = {
  args: {
    client: RITA_ACKROYD as ClientFieldsFragment,
    hideImage: true,
  },
};

export const WithFewerDetails: Story = {
  args: {
    client: {
      ...RITA_ACKROYD,
      pronouns: [],
      dob: null,
    } as ClientFieldsFragment,
    hideImage: true,
  },
};
