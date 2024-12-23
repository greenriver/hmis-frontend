import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';

import { modifyFormDefinition } from '../util/formUtil';
import DynamicForm from './DynamicForm';
import { Default as ViewStory } from './viewable/DynamicView.stories';

import { emptyErrorState } from '@/modules/errors/util';
import formData from '@/test/__mocks__/mockFormDefinition.json';
import { generateMockValuesForDefinition } from '@/test/utils/testUtils';
import { FormDefinitionJson, ItemType } from '@/types/gqlTypes';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  component: DynamicForm,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof DynamicForm>;

const Template: StoryFn<typeof DynamicForm> = (args) => (
  // eslint-disable-next-line no-console
  <DynamicForm {...args} onSubmit={(values) => console.log(values)} />
);

export const Default = Template.bind({});
Default.args = { definition: formDefinition, errors: emptyErrorState };

export const WithWarnIfEmpty = Template.bind({});
WithWarnIfEmpty.args = {
  definition: modifyFormDefinition(
    formDefinition,
    (item) => (item.warnIfEmpty = true)
  ),
  warnIfEmpty: true,
  errors: emptyErrorState,
};

export const WithRequired = Template.bind({});
WithRequired.args = {
  definition: modifyFormDefinition(
    formDefinition,
    (item) => (item.required = true)
  ),
  errors: emptyErrorState,
};

export const WithValues = Template.bind({});
WithValues.args = {
  definition: formDefinition,
  initialValues: ViewStory.args?.values,
  errors: emptyErrorState,
};

// Render the DynamicForm with values, modified such that every item is marked "readOnly" in the FormDefinition
export const WithValuesAsReadOnly = Template.bind({});
WithValuesAsReadOnly.args = {
  definition: modifyFormDefinition(
    formDefinition,
    (item) => (item.readOnly = true)
  ),
  initialValues: ViewStory.args?.values,
  errors: emptyErrorState,
};

// Render a mini form that doesn't have a top-level group
const miniForm = {
  item: [
    {
      type: ItemType.String,
      required: true,
      linkId: 'name',
      text: 'Staff name',
    },
    {
      type: ItemType.Integer,
      required: false,
      readOnly: true,
      linkId: 'age',
      text: "Client's age (read-only)",
    },
  ],
} as FormDefinitionJson;
export const MiniForm = Template.bind({});
MiniForm.args = {
  definition: miniForm,
  initialValues: generateMockValuesForDefinition(miniForm),
  errors: emptyErrorState,
  hideSubmit: true,
};

// Render the DynamicForm with all fields having extra long labels
export const WithExtraLongLabels = Template.bind({});
WithExtraLongLabels.args = {
  definition: modifyFormDefinition(
    formDefinition,
    (item) =>
      (item.text = item.text
        ? item.text +
          ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sagittis aliquet ex in rutrum. Curabitur posuere ligula nec dignissim egestas. Nunc erat quam, feugiat porttitor ligula sed, porta tincidunt erat.'
        : item.text)
  ),
  errors: emptyErrorState,
};
