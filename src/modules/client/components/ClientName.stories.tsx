import { Meta, StoryObj } from '@storybook/react';

import ClientName from './ClientName';

export default {
  title: 'ClientName',
  component: ClientName,
} as Meta<typeof ClientName>;

type Story = StoryObj<typeof ClientName>;

export const Default: Story = {
  args: {
    client: {
      firstName: 'Rita',
      middleName: 'Jane',
      lastName: 'Ackroyd',
    },
  },
};

export const WithAllNameComponents: Story = {
  args: {
    client: {
      firstName: 'Rita',
      middleName: 'Jane',
      lastName: 'Ackroyd',
      nameSuffix: 'Jr',
    },
  },
};

export const WithLink: Story = {
  args: {
    client: {
      id: 5,
      firstName: 'Rita',
      lastName: 'Ackroyd',
    },
    linkToProfile: true,
  },
};
