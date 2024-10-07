import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import ProjectSelect from './ProjectSelect';
import { projectsForSelectMock } from '@/test/__mocks__/requests';

export default {
  component: ProjectSelect,
  parameters: {
    apolloClient: {
      mocks: [projectsForSelectMock],
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof ProjectSelect>;

type Story = StoryObj<typeof ProjectSelect>;

export const Default: Story = {};

export const Labeled: Story = {
  args: {
    label: 'Choose Project',
    textInputProps: {
      placeholder: 'Select a project..',
      helperText: 'Projects from CoC MA-501 are available.',
    },
  },
};

export const Multi: Story = {
  args: {
    multiple: true,
    textInputProps: {
      placeholder: 'All Projects',
    },
  },
};
