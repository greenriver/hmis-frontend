import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';

import DynamicView from './DynamicView';

import formData from '@/test/__mocks__/mockFormDefinition.json';
import { generateMockValuesForDefinition } from '@/test/utils/testUtils';
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
} as Meta<typeof DynamicView>;

const Template: StoryFn<typeof DynamicView> = (args) => (
  <DynamicView {...args} />
);

export const Default = Template.bind({});
Default.args = {
  definition: formDefinition,
  values: {
    ...generateMockValuesForDefinition(formDefinition),
    ssn: '123456789',
    'multi-open': [
      {
        code: 'they/them',
      },
      {
        customOptionLabel: 'Add "other"',
        code: 'other',
      },
    ],
    image_blob_id: '9999',
    file_id: '9999',
  },
};

export const Empty = Template.bind({});
Empty.args = { definition: formDefinition };

// Disabled because storybook-addon-state package is not supported with storybook 7
// export const WithValues = Template.bind({});
// WithValues.args = {
//   definition: formDefinition,
//   initialValues: ViewStory.args?.values,
//   errors: emptyErrorState,
// };

// const InteractiveTemplate: ComponentStory<typeof DynamicView> = (args) => {
//   const [values, setValues] = useState('formValues', {});
//   const [editable, setEditable] = useState('editable', {});

//   const component = editable ? (
//     <DynamicForm
//       {...args}
//       errors={{ errors: [], warnings: [] }}
//       initialValues={values}
//       onSubmit={({ values }) => setValues(values)}
//     />
//   ) : (
//     <DynamicView {...args} values={values} />
//   );

//   return (
//     <Box>
//       <Box
//         borderBottom={1}
//         borderColor='grey.300'
//         sx={(theme) => ({
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           p: 1,
//           zIndex: 1000,
//           backgroundColor: theme.palette.grey[100],
//           boxShadow: theme.shadows[2],
//         })}
//       >
//         <FormControlLabel
//           control={
//             <Switch checked={!!editable} onChange={(e, v) => setEditable(v)} />
//           }
//           label={`Switch to ${editable ? 'viewable' : 'editable'}`}
//         />
//       </Box>
//       <Box pt='60px'>{component}</Box>
//     </Box>
//   );
// };

// export const Interactive = InteractiveTemplate.bind({});
// Interactive.args = { definition: formDefinition };
