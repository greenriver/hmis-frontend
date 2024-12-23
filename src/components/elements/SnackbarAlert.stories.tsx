import { Meta, StoryObj } from '@storybook/react';
import SnackbarAlert from './SnackbarAlert';

const meta: Meta<typeof SnackbarAlert> = {
  component: SnackbarAlert,
  parameters: {
    layout: 'centered',
  },
  // Add controls for commonly adjusted props
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls the visibility of the snackbar',
    },
    title: {
      control: 'text',
      description: 'Optional title text for the alert',
    },
    children: {
      control: 'text',
      description: 'Main content of the alert',
    },
    alertProps: {
      control: 'object',
      description: 'Props passed to the underlying MUI Alert component',
    },
  },
};

export default meta;

type Story = StoryObj<typeof SnackbarAlert>;

// Basic success message
export const Success: Story = {
  args: {
    open: true,
    onClose: () => console.info('Close clicked'),
    children: 'Operation completed successfully',
    alertProps: {
      severity: 'success',
    },
  },
};

// Error message with title
export const Error: Story = {
  args: {
    open: true,
    onClose: () => console.log('Close clicked'),
    title: 'Error',
    children: 'Something went wrong. Please try again.',
    alertProps: {
      severity: 'error',
    },
  },
};

// Example with no title
export const NoTitle: Story = {
  args: {
    open: true,
    onClose: () => console.log('Close clicked'),
    children: 'Simple notification without a title',
    alertProps: {
      severity: 'success',
    },
  },
};

// Example with longer content
export const LongContent: Story = {
  args: {
    open: true,
    onClose: () => console.log('Close clicked'),
    title: 'System Notification',
    children: `This is a longer notification message that demonstrates how the SnackbarAlert
      component handles multiple lines of text. It might contain important information that
      needs more space to be properly communicated to the user.`,
    alertProps: {
      severity: 'info',
      sx: { height: '100%' },
    },
  },
};
