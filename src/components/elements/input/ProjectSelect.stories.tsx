import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';

import ProjectSelect, { ProjectSelectValue } from './ProjectSelect';

export default {
  title: 'ProjectSelect',
  component: ProjectSelect,
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as ComponentMeta<typeof ProjectSelect>;

const Template: ComponentStory<typeof ProjectSelect> = (args) => {
  const [value, setValue] = useState<ProjectSelectValue>(
    args.multiple ? [] : null
  );
  return <ProjectSelect {...args} value={value} onChange={setValue} />;
};

export const Default = Template.bind({});

export const Labeled = Template.bind({});
Labeled.args = {
  label: 'Choose Project',
  textInputProps: {
    placeholder: 'Select a project..',
    helperText: 'Projects from CoC MA-501 are available.',
  },
};

export const Multi = Template.bind({});
Multi.args = {
  multiple: true,
  textInputProps: {
    placeholder: 'All Projects',
  },
};
