import { Meta, StoryObj } from '@storybook/react';

import ClientEnrollmentCard from './ClientEnrollmentCard';

import {
  clientWithEnrollmentsMock,
  clientWithoutEnrollmentsMock,
  RITA_ACKROYD,
  RITA_ACKROYD_WITHOUT_ENROLLMENTS,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientEnrollmentCard',
  component: ClientEnrollmentCard,
  parameters: {
    apolloClient: {
      mocks: [clientWithEnrollmentsMock],
    },
  },
} as Meta<typeof ClientEnrollmentCard>;

type Story = StoryObj<typeof ClientEnrollmentCard>;

export const Default: Story = {
  args: {
    client: RITA_ACKROYD as ClientFieldsFragment,
  },
};

export const NoEnrollments: Story = {
  args: {
    client: RITA_ACKROYD_WITHOUT_ENROLLMENTS as ClientFieldsFragment,
  },
  parameters: {
    apolloClient: {
      mocks: [clientWithoutEnrollmentsMock],
    },
  },
};
