import { Meta, StoryObj } from '@storybook/react';

import LabelWithContent from './LabelWithContent';

export default {
  component: LabelWithContent,
} as Meta<typeof LabelWithContent>;

type Story = StoryObj<typeof LabelWithContent>;

export const Default: Story = {
  args: {
    label: 'Title',
    children: <div>Content</div>,
  },
};

// export const WithBorder: Story = {
//   args: {
//     title: 'Title',
//     actions: <Button>Action Button</Button>,
//     children: <div>Content</div>,
//     headerVariant: 'border',
//   },
// };
