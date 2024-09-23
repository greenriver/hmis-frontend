import { Meta, StoryObj } from '@storybook/react';

import ClickToShow from './ClickToShow';

export default {
  component: ClickToShow,
} as Meta<typeof ClickToShow>;

type Story = StoryObj<typeof ClickToShow>;

export const Default: Story = { args: { children: 'Hidden Value' } };
