import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import DynamicForm from './DynamicForm';

import formData from '@/modules/form/data/mock.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'DynamicForm',
  component: DynamicForm,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as ComponentMeta<typeof DynamicForm>;

const Template: ComponentStory<typeof DynamicForm> = (args) => (
  <DynamicForm {...args} onSubmit={(values) => console.log(values)} />
);
export const Default = Template.bind({});
Default.args = { definition: formDefinition };
