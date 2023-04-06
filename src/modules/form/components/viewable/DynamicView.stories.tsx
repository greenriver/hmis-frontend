import { Box } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import DynamicForm from './DynamicView';

import formData from '@/modules/form/data/mock.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'DynamicView',
  component: DynamicForm,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 800 }}>
        <Story />
      </Box>
    ),
  ],
} as ComponentMeta<typeof DynamicForm>;

const Template: ComponentStory<typeof DynamicForm> = (args) => (
  <DynamicForm {...args} />
);

export const Default = Template.bind({});
Default.args = {
  definition: formDefinition,
  values: {
    'string-1': 'test',
    'int-1': '3',
    'curr-1': '10',
    'boolean-1': true,
    'date-1': '2023-04-06T04:00:00.000Z',
    ssn: '123456789',
    'text-1':
      'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test ',
    'choice-2': {
      code: 'CLIENT_REFUSED',
      label: 'Client refused',
    },
    'multi-choice': [
      {
        code: 'CLIENT_REFUSED',
        label: 'Client refused',
      },
      {
        code: 'CLIENT_DOESN_T_KNOW',
        label: "Client doesn't know",
      },
    ],
    undefined: [
      {
        code: 'they/them',
      },
      {
        customOptionLabel: 'Add "other"',
        code: 'other',
      },
    ],
    'radio-1': {
      code: 'CLIENT_DOESN_T_KNOW',
      label: "Client doesn't know",
    },
    'vertical-radio-1': {
      code: 'YES',
      label: 'Yes',
    },
  },
};

export const Empty = Template.bind({});
Empty.args = { definition: formDefinition };
