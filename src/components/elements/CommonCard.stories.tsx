import { Meta, StoryObj } from '@storybook/react';

import { CommonCard } from './CommonCard';

export default {
  component: CommonCard,
} as Meta<typeof CommonCard>;

type Story = StoryObj<typeof CommonCard>;

export const Default: Story = {
  args: {
    title: 'Title',
    // titleComponent: 'h5',
    children: <div>Content</div>,
  },
};
