import { Box, FormControlLabel, Switch } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import useState from 'storybook-addon-state';

import DynamicForm from '../DynamicForm';

import DynamicView from './DynamicView';

import formData from '@/modules/form/data/mock.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'DynamicView',
  component: DynamicView,
  decorators: [
    (Story) => (
      <Box sx={{ width: 800 }}>
        <Story />
      </Box>
    ),
  ],
} as ComponentMeta<typeof DynamicView>;

const Template: ComponentStory<typeof DynamicView> = (args) => (
  <DynamicView {...args} />
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
    'choice-1': {
      code: 'YES',
      label: 'Yes',
    },
    'string-4': 'Something',
    '4.05.2': {
      code: 'YES',
      label: 'Yes',
    },
    '4.05.A': {
      code: 'NO',
      label: 'No',
    },
    '4.06.2': {
      code: 'CLIENT_REFUSED',
      label: 'Client refused',
    },
    '4.07.2': {
      code: 'CLIENT_DOESN_T_KNOW',
      label: "Client doesn't know",
    },
    '4.07.A': {
      code: 'YES',
      label: 'Yes',
    },
    n1: '1',
    n2: '11',
    n3: '111',
    c1: true,
    c3: true,
    image_blob_id: '9999',
    file_id: '9999',
  },
};

export const Empty = Template.bind({});
Empty.args = { definition: formDefinition };

const InteractiveTemplate: ComponentStory<typeof DynamicView> = (args) => {
  const [values, setValues] = useState('formValues', {});
  const [editable, setEditable] = useState('editable', {});

  const component = editable ? (
    <DynamicForm
      {...args}
      errors={{ errors: [], warnings: [] }}
      initialValues={values}
      onSubmit={({ values }) => setValues(values)}
    />
  ) : (
    <DynamicView {...args} values={values} />
  );

  return (
    <Box>
      <Box
        borderBottom={1}
        borderColor='grey.300'
        sx={(theme) => ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          p: 1,
          zIndex: 1000,
          backgroundColor: theme.palette.grey[100],
          boxShadow: theme.shadows[2],
        })}
      >
        <FormControlLabel
          control={
            <Switch checked={!!editable} onChange={(e, v) => setEditable(v)} />
          }
          label={`Switch to ${editable ? 'viewable' : 'editable'}`}
        />
      </Box>
      <Box pt='60px'>{component}</Box>
    </Box>
  );
};

export const Interactive = InteractiveTemplate.bind({});
Interactive.args = { definition: formDefinition };
