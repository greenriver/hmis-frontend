import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import LogoutFailedDialog from './LogoutFailedDialog';

export default {
  component: LogoutFailedDialog,
} as Meta<typeof LogoutFailedDialog>;

type Story = StoryObj<typeof LogoutFailedDialog>;

const args = {
  loading: false,
  onRetry: fn(),
  onDismiss: fn(),
};

// The dialog renders in a portal, so queries go through document.body rather
// than the story canvas.
const dialog = () => within(document.body);

export const Default: Story = {
  args,
  play: async () => {
    await expect(
      dialog().getByText('You are still signed in')
    ).toBeInTheDocument();
    await expect(
      dialog().getByText(/you are still signed in\. Anyone using this computer/)
    ).toBeInTheDocument();
    await expect(
      dialog().getByText(/close all of your browser windows to make sure/)
    ).toBeInTheDocument();
  },
};

export const Retrying: Story = {
  args: { ...args, loading: true },
};

export const ConfirmRetries: Story = {
  args,
  play: async ({ args }) => {
    await userEvent.click(dialog().getByTestId('confirmDialogAction'));
    await expect(args.onRetry).toHaveBeenCalled();
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};

export const CancelDismisses: Story = {
  args,
  play: async ({ args }) => {
    await userEvent.click(dialog().getByTestId('cancelDialogAction'));
    await expect(args.onDismiss).toHaveBeenCalled();
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
