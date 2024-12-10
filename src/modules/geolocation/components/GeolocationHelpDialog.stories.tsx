import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';
import GeolocationHelpDialog from './GeolocationHelpDialog';

const BasicUsage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <GeolocationHelpDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default {
  component: GeolocationHelpDialog,
  render: () => <BasicUsage />,
} as Meta<typeof GeolocationHelpDialog>;

type Story = StoryObj<typeof GeolocationHelpDialog>;

export const Default: Story = { args: { open: true } };
