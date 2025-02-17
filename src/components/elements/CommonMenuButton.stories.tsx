import { Meta, StoryObj } from '@storybook/react';
import CommonMenuButton, { CommonMenuItem } from './CommonMenuButton';

export default {
  component: CommonMenuButton,
} as Meta<typeof CommonMenuButton>;

type Story = StoryObj<typeof CommonMenuButton>;

const menuItems: CommonMenuItem[] = [
  { key: 'one', title: 'Link One', to: '/one' },
  { key: 'two', title: 'Link Two', to: '/two' },
  { key: 'three', title: 'Link Three longer text', to: '/three' },
];
export const Default: Story = {
  args: {
    title: 'Menu',
    items: menuItems,
  },
};

export const Outlined: Story = {
  args: {
    title: 'Menu',
    ButtonProps: { variant: 'outlined' },
    items: menuItems,
  },
};
export const IconOnly: Story = {
  args: {
    title: 'Menu',
    ButtonProps: {
      'aria-label': 'Action menu',
    },
    iconButton: true,
    items: menuItems,
  },
};
