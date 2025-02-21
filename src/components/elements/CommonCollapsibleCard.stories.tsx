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
    titleBorder: { control: 'boolean' },
    collapsible: { control: 'boolean' },
    children: { control: false },
    actions: { control: false },
  },
} as Meta<typeof CommonCollapsibleCard>;

type Story = StoryObj<typeof CommonCollapsibleCard>;

const cardContent = (
  <>
    This is card content <br />
    This is card content <br />
    This is card content <br />
    This is card content <br />
    This is card content
  </>
);

// export const Default: Story = {
//   args: {
//     title: 'Card with Action Button',
//     children: cardContent,
//     actions: <Button>Click Me</Button>,
//   },
// };

// export const TableContent: Story = {
//   args: {
//     title: 'Card with Table Content (No Padding)',
//     padContent: false,
//     children: (
//       <GenericTable
//         rows={DummyTableRows}
//         columns={[CLIENT_COLUMNS.name, CLIENT_COLUMNS.age]}
//       />
//     ),
//   },
// };

export const Default: Story = {
  args: {
    title: 'Card that is Collapsible',
    children: cardContent,
  },
};
