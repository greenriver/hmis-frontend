import { ComponentStory, Meta } from '@storybook/react';
import { useEffect } from 'react';
import useState from 'storybook-addon-state';

import SsnInput from './SsnInput';

export default {
  title: 'SsnInput',
  component: SsnInput,
  argTypes: {
    label: { control: 'text' },
    onlylast4: { control: 'boolean' },
    value: { control: 'text' },
  },
} as Meta<typeof SsnInput>;

const Template: ComponentStory<typeof SsnInput> = (args) => {
  const [value, setValue] = useState('ssnInputValue', args.value);

  useEffect(() => setValue(args.value), [args.value]);

  return <SsnInput {...args} value={value} onChange={setValue} />;
};
export const Default = Template.bind({});
export const Labeled = Template.bind({});
Labeled.args = {
  label: 'Social Security Number',
  helperText: 'Helper text here',
};
