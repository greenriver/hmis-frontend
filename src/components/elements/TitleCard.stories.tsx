import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import TitleCard from './TitleCard';

export default {
  component: TitleCard,
} as Meta<typeof TitleCard>;

type Story = StoryObj<typeof TitleCard>;

export const Default: Story = {
  args: {
    title: 'Title',
    actions: <Button>Action Button</Button>,
    children: <div>Content</div>,
  },
};

export const WithBorder: Story = {
  args: {
    title: 'Title',
    actions: <Button>Action Button</Button>,
    children: <div>Content</div>,
    headerVariant: 'border',
  },
};
