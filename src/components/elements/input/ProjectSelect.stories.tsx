import { Box } from '@mui/material';
import { ComponentStory, Meta } from '@storybook/react';
import { useState } from 'react';

import ProjectSelect, { Option } from './ProjectSelect';

export default {
  title: 'Input Elements/ProjectSelect',
  component: ProjectSelect,
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof ProjectSelect>;

const Template: ComponentStory<typeof ProjectSelect> = (args) => {
  const [value, setValue] = useState<Option | Option[] | null>(
    args.multiple ? [] : null
  );
  return (
    <ProjectSelect
      {...args}
      value={value}
      onChange={(_, value) => setValue(value)}
    />
  );
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
