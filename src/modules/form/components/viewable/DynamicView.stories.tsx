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
Default.args = { definition: formDefinition };
