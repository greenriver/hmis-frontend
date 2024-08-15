import { Meta, StoryObj } from '@storybook/react';

import ClientDobAge from './ClientDobAge';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientDobAge',
  component: ClientDobAge,
} as Meta<typeof ClientDobAge>;

type Story = StoryObj<typeof ClientDobAge>;

export const Default: Story = {
  args: {
    client: RITA_ACKROYD as ClientFieldsFragment,
  },
};
