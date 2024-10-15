import { Meta, StoryObj } from '@storybook/react';
import ButtonLink from './ButtonLink';

export default {
  component: ButtonLink,
} as Meta<typeof ButtonLink>;

type Story = StoryObj<typeof ButtonLink>;

export const Default: Story = {
  args: {
    to: '/',
    children: 'This is a button link',
  },
};
