import { Box, TextField, TextFieldProps } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import useState from 'storybook-addon-state';

import LabelWithContent from './LabelWithContent';
import MultiFieldInput, { MultiFieldInputProps } from './MultiFieldInput';

export default {
  title: 'MultiFieldInput',
  component: MultiFieldInput,
} as ComponentMeta<typeof MultiFieldInput>;

const Template: ComponentStory<typeof MultiFieldInput> = (args) => {
  const [values, setValues] = useState('values', args.values);
  return <MultiFieldInput {...args} values={values} onChange={setValues} />;
};

export const BasicInputs = Template.bind({});
BasicInputs.args = {
  values: {
    areaCode: '',
    prefix: '',
    suffix: '',
  },
  renderInputs: (inputs) => {
    return (
      <div>
        ( {inputs.areaCode?.node} ) {inputs.prefix?.node} -{' '}
        {inputs.suffix?.node}
      </div>
    );
  },
  inputs: [
    {
      name: 'areaCode',
      chars: 3,
    },
    {
      name: 'prefix',
      chars: 3,
    },
    {
      name: 'suffix',
      chars: 4,
    },
  ],
} as Partial<MultiFieldInputProps<JSX.IntrinsicElements['input']>>;

export const TextFields = Template.bind({});
TextFields.args = {
  values: {
    areaCode: '',
    prefix: '',
    suffix: '',
  },
  renderInput: ({ input, handlers, value, ref, key }) => (
    <TextField
      key={key}
      name={input.name}
      size='small'
      inputProps={{
        size: input.chars,
        ref,
      }}
      onChange={(e) => handlers.handleChange(e.target.value)}
      value={value}
    />
  ),
  renderInputs: (inputs) => {
    return (
      <LabelWithContent label='Phone number'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          ( {inputs.areaCode?.node} ) {inputs.prefix?.node} -{' '}
          {inputs.suffix?.node}
        </Box>
      </LabelWithContent>
    );
  },
  inputs: [
    {
      name: 'areaCode',
      chars: 3,
    },
    {
      name: 'prefix',
      chars: 3,
    },
    {
      name: 'suffix',
      chars: 4,
    },
  ],
} as Partial<MultiFieldInputProps<TextFieldProps>>;
