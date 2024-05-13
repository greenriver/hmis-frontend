import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
import formData from '@/test/__mocks__/mockFormDefinition.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

const formDefinition: FormDefinitionJson = JSON.parse(JSON.stringify(formData));

export default {
  title: 'FormTree',
  component: FormTree,
  argTypes: { label: { control: 'text' } },
  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof FormTree>;

const Template: StoryFn<typeof FormTree> = (args) => <FormTree {...args} />;

export const Default = Template.bind({});
Default.args = { definition: formDefinition };
