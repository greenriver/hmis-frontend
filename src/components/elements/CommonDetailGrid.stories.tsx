import { Meta, StoryObj } from '@storybook/react';

import CommonDetailGrid from './CommonDetailGrid';

export default {
  component: CommonDetailGrid,
} as Meta<typeof CommonDetailGrid>;

type Story = StoryObj<typeof CommonDetailGrid>;

export const Default: Story = {
  args: {
    rows: [
      { id: '1', label: 'Label 1', value: 'Value 1' },
      { id: '2', label: 'Label 2', value: 'Value 2' },
      { id: '3', label: 'Label 3', value: 'Value 3' },
      { id: '4', label: 'Label 4', value: 'Value 4' },
      { id: '5', label: 'Label 5', value: 'Value 5' },
      { id: '6', label: 'Label 6', value: 'Value 6' },
      { id: '7', label: 'Label 7', value: 'Value 7' },
      { id: '8', label: 'Label 8', value: 'Value 8' },
      { id: '9', label: 'Label 9', value: 'Value 9' },
      { id: '10', label: 'Label 10', value: 'Value 10' },
    ],
  },
};
