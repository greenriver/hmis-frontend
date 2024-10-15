import { Meta, StoryObj } from '@storybook/react';
import LoadingButton from './LoadingButton';

export default {
  component: LoadingButton,
} as Meta<typeof LoadingButton>;

type Story = StoryObj<typeof LoadingButton>;

export const Default: Story = {
  args: {
    loading: true,
    children: 'This button is loading',
    loadingPosition: 'start',
  },
};
