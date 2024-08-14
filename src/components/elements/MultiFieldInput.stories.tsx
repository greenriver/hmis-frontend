import { Box, TextField, TextFieldProps } from '@mui/material';
import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import LabelWithContent from './LabelWithContent';
import MultiFieldInput, { MultiFieldInputProps } from './MultiFieldInput';

export default {
  title: 'Input Elements/MultiFieldInput',
  component: MultiFieldInput,
  render: (args: MultiFieldInputProps<any>) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ values }, updateArgs] = useArgs();
    const onChange = (values: any) => updateArgs({ values: values });
    return <MultiFieldInput {...args} onChange={onChange} values={values} />;
  },
} as Meta<typeof MultiFieldInput>;

type Story = StoryObj<typeof MultiFieldInput>;

export const BasicInputs: Story = {
  args: {
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
  } as Partial<MultiFieldInputProps<JSX.IntrinsicElements['input']>>,
};

export const TextFields: Story = {
  args: {
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
  } as Partial<MultiFieldInputProps<TextFieldProps>>,
};
