import { Meta, StoryObj } from '@storybook/react';

import ClientSearchResultCard from './ClientSearchResultCard';

import {
  clientImageLookupMock,
  clientWithEnrollmentsMock,
  getClientPermissionMocks,
  RITA_ACKROYD,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientSearchResultCard',
  component: ClientSearchResultCard,
  parameters: {
    apolloClient: {
      mocks: [
        getClientPermissionMocks,
        clientWithEnrollmentsMock,
        clientImageLookupMock,
      ],
    },
  },
} as Meta<typeof ClientSearchResultCard>;

type Story = StoryObj<typeof ClientSearchResultCard>;

// FIXME: image does not appear in story
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
      ssn: null,
      dob: null,
    } as ClientFieldsFragment,
    hideImage: true,
  },
};
