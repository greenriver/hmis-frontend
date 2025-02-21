import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import CommonCollapsibleCard from './CommonCollapsibleCard';

export default {
  component: CommonCollapsibleCard,
  render: function Component(args) {
    const [, setArgs] = useArgs();

    const onChange = () => {
      setArgs({ open: !args.open });
    };

    return <CommonCollapsibleCard {...args} onClick={onChange} />;
  },
  argTypes: {
    padContent: { control: 'boolean' },
    headerVariant: {
      control: { type: 'select' },
      options: ['border', undefined],
    },
    children: { control: false },
  },
} as Meta<typeof CommonCollapsibleCard>;

type Story = StoryObj<typeof CommonCollapsibleCard>;

export const Default: Story = {
  args: {
    title: 'Card that is Collapsible',
    children: (
      <>
        This is card content <br />
        This is card content <br />
        This is card content <br />
        This is card content <br />
        This is card content
      </>
    ),
  },
};
