import { Meta, StoryObj } from '@storybook/react';

import ClientSsn from './ClientSsn';

import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  component: ClientSsn,
} as Meta<typeof ClientSsn>;

type Story = StoryObj<typeof ClientSsn>;

export const Default: Story = {
  args: {
    client: { ssn: '000112222' } as ClientFieldsFragment,
  },
};
