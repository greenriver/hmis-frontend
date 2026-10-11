import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import SessionStatusManager from './SessionStatusManager';
import { HMIS_SESSION_REMAINING_HEADER } from '@/modules/auth/api/constants';

export default {
  component: SessionStatusManager,
} as Meta<typeof SessionStatusManager>;

type Story = StoryObj<typeof SessionStatusManager>;

const args = {
  status: 'valid' as const,
  promptToExtend: true,
  promptToExtendBefore: 300,
};

// The dialog renders in a portal, so queries go through document.body rather
// than the story canvas.
const dialog = () => within(document.body);

// Answers the keepalive POST as the server would, with the token's remaining
// seconds in the header (JWT arm) or without it (Devise arm).
const stubKeepalive = (remainingSecs?: string) => () => {
  const originalFetch = window.fetch;
  window.fetch = async () =>
    new Response('{}', {
      status: 200,
      headers: remainingSecs
        ? { [HMIS_SESSION_REMAINING_HEADER]: remainingSecs }
        : {},
    });
  return () => {
    window.fetch = originalFetch;
  };
};

const clickKeepAlive = async () => {
  await userEvent.click(dialog().getByText('Keep me signed-in'));
};

export const PromptToExtend: Story = {
  args,
};

// Keepalive came back with the token still inside the warning window: the
// refresh failed.
export const RenewFailed: Story = {
  args,
  beforeEach: stubKeepalive('120'),
  play: async () => {
    await clickKeepAlive();
    await expect(
      await dialog().findByText("Your session can't be extended")
    ).toBeInTheDocument();
  },
};

export const RenewSucceeded: Story = {
  args,
  beforeEach: stubKeepalive('1500'),
  play: async () => {
    await clickKeepAlive();
    await waitFor(() =>
      expect(dialog().getByTestId('confirmDialogAction')).toBeEnabled()
    );
    await expect(
      dialog().queryByText("Your session can't be extended")
    ).not.toBeInTheDocument();
    await expect(
      dialog().getByText('Are you still there?')
    ).toBeInTheDocument();
  },
};

// Devise arm: no remaining-seconds header, so the failure dialog never shows.
export const RenewWithoutRemainingHeader: Story = {
  args,
  beforeEach: stubKeepalive(),
  play: async () => {
    await clickKeepAlive();
    await waitFor(() =>
      expect(dialog().getByTestId('confirmDialogAction')).toBeEnabled()
    );
    await expect(
      dialog().queryByText("Your session can't be extended")
    ).not.toBeInTheDocument();
  },
};

export const CloseAfterRenewFailed: Story = {
  args,
  beforeEach: stubKeepalive('120'),
  play: async () => {
    await clickKeepAlive();
    await dialog().findByText("Your session can't be extended");
    await userEvent.click(dialog().getByText('Close'));
    await waitFor(() =>
      expect(dialog().queryByRole('dialog')).not.toBeInTheDocument()
    );
  },
};
