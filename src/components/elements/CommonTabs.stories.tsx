import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import CommonTabs from '@/components/elements/CommonTabs';

export default {
  component: CommonTabs,
} as Meta<typeof CommonTabs>;

type Story = StoryObj<typeof CommonTabs>;
export const Default: Story = {
  args: {
    tabDefinitions: [
      {
        title: 'First tab',
        key: 'first',
        contents: (
          <>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </>
        ),
      },
      {
        title: 'Second Tab',
        key: 'second',
        contents: <Button>Click here</Button>,
      },
    ],
  },
};
