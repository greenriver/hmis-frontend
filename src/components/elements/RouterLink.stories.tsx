import { Meta, StoryObj } from '@storybook/react';
import RouterLink from './RouterLink';

export default {
  component: RouterLink,
} as Meta<typeof RouterLink>;

type Story = StoryObj<typeof RouterLink>;

export const Default: Story = {
  args: {
    to: '/',
    children: 'This is a router link',
  },
};
