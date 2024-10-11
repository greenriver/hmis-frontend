import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';
import CommonToggle from './CommonToggle';

export default {
  component: CommonToggle,
  // https://github.com/storybookjs/storybook/discussions/21680#discussioncomment-7698496
  render: function Component(args) {
    const [, setArgs] = useArgs();

    const onChange = (value: string) => {
      setArgs({ value });
    };

    return <CommonToggle {...args} onChange={onChange} />;
  },
} as Meta<typeof CommonToggle>;

type Story = StoryObj<typeof CommonToggle>;
export const Default: Story = {
  args: {
    items: [
      { value: 'YES', label: 'Yes' },
      { value: 'NO', label: 'No' },
    ],
    value: 'YES',
  },
};
