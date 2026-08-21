import { Meta, StoryObj } from '@storybook/react';

import ClientProfileCard from './ClientProfileCard';

import {
  clientImageLookupMock,
  getClientPermissionMocks,
  getRootPermissionsMock,
  RITA_ACKROYD,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  component: ClientProfileCard,
  parameters: {
    apolloClient: {
      mocks: [
        clientImageLookupMock,
        clientImageLookupMock,
        clientImageLookupMock,
        clientImageLookupMock,
        getClientPermissionMocks,
        getClientPermissionMocks,
        getClientPermissionMocks,
        getClientPermissionMocks,
        getRootPermissionsMock,
        getRootPermissionsMock,
        getRootPermissionsMock,
        getRootPermissionsMock,
      ],
    },
  },
} as Meta<typeof ClientProfileCard>;

type Story = StoryObj<typeof ClientProfileCard>;

export const Default: Story = {
  args: { client: RITA_ACKROYD as ClientFieldsFragment },
};

export const WithFewerDetails: Story = {
  args: {
    client: {
      ...RITA_ACKROYD,
      pronouns: [],
      ssn: null,
      dob: null,
    } as ClientFieldsFragment,
  },
};

export const WithRestrictedAccess: Story = {
  args: {
    client: {
      ...RITA_ACKROYD,
      restricted: true,
    } as ClientFieldsFragment,
  },
};
