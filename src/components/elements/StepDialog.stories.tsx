import { Meta, StoryObj } from '@storybook/react';
import StepDialog from './StepDialog';

export default {
  component: StepDialog,
} as Meta<typeof StepDialog>;

type Story = StoryObj<typeof StepDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Stepper Dialog Demo',
    stepDefinitions: [
      {
        key: 'one',
        title: 'One',
        content: 'hello first tab',
      },
      {
        key: 'two',
        title: 'Two',
        content: 'this is the second tab',
      },
    ],
  },
};
