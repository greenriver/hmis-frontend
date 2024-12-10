import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import NumberInput from './NumberInput';

export default {
  component: NumberInput,
  argTypes: { label: { control: 'text' } },
  render: (args: any) => {
    const [{ value }, updateArgs] = useArgs();
    const onChange = (event: any) => updateArgs({ value: event.target.value });
    return <NumberInput {...args} onChange={onChange} value={value} />;
  },
} as Meta<typeof NumberInput>;

type Story = StoryObj<typeof NumberInput>;

export const Labeled: Story = {
  args: { label: 'Enter amount', min: 0, max: 10 },
};
