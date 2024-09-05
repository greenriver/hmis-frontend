import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import SsnInput from './SsnInput';

export default {
  title: 'Input Elements/SsnInput',
  component: SsnInput,
  argTypes: {
    label: { control: 'text' },
    onlylast4: { control: 'boolean' },
    value: { control: 'text' },
  },
  render: (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ value }, updateArgs] = useArgs();
    const onChange = (value: any) => updateArgs({ value });
    return <SsnInput {...args} onChange={onChange} value={value} />;
  },
} as Meta<typeof SsnInput>;

type Story = StoryObj<typeof SsnInput>;

export const Default: Story = {};
export const Labeled: Story = {
  args: { label: 'Social Security Number', helperText: 'Helper text here' },
};
