import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import FormTreeView from '@/modules/admin/components/forms/FormTreeView';
import formData from '@/test/__mocks__/mockFormDefinition.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'FormTreeView',
  component: FormTreeView,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof FormTreeView>;

const Template: StoryFn<typeof FormTreeView> = (args) => (
  // eslint-disable-next-line no-console
  <FormTreeView {...args} />
);

export const Default = Template.bind({});
Default.args = { definition: formDefinition };
