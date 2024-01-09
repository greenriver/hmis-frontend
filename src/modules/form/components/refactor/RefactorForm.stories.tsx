import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';

import RefactorForm from './RefactorForm';
// import { Default as ViewStory } from './viewable/DynamicView.stories';

import { emptyErrorState } from '@/modules/errors/util';
import formData from '@/modules/form/data/mock.json';
import { FormDefinitionJson } from '@/types/gqlTypes';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'RefactorForm',
  component: RefactorForm,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 800 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof RefactorForm>;

const Template: StoryFn<typeof RefactorForm> = (args) => (
  // eslint-disable-next-line no-console
  <RefactorForm
    {...args}
    showSavePrompt
    onSubmit={(values) => console.log(values)}
  />
);

export const Default = Template.bind({});
Default.args = { definition: formDefinition, errors: emptyErrorState };

export const WithWarnIfEmpty = Template.bind({});
WithWarnIfEmpty.args = {
  definition: formDefinition,
  warnIfEmpty: true,
  errors: emptyErrorState,
};

// export const WithValues = Template.bind({});
// WithValues.args = {
//   definition: formDefinition,
//   initialValues: ViewStory.args?.values,
//   errors: emptyErrorState,
// };
