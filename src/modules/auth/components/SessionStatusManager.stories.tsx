import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import React, { useState } from 'react';

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
  expireSession: fn(),
};

// The dialog renders in a portal, so queries go through document.body rather
// than the story canvas.
const dialog = () => within(document.body);

// Answers the keepalive POST as the server would, with the token's remaining
// seconds in the header (JWT arm) or without it (Devise arm).
const stubKeepalive =
  (remainingSecs?: string, status = 200) =>
  () => {
    const originalFetch = window.fetch;
    window.fetch = async () =>
      new Response('{}', {
        status,
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

// A server error may be transient, so the dialog stays open for a retry instead
// of reloading away unsaved work.
export const RenewServerError: Story = {
  args,
  beforeEach: stubKeepalive(undefined, 500),
  play: async () => {
    await clickKeepAlive();
    await expect(
      await dialog().findByText('Something went wrong. Please try again.')
    ).toBeInTheDocument();
    await expect(dialog().getByTestId('confirmDialogAction')).toBeEnabled();
    await expect(
      dialog().getByText('Are you still there?')
    ).toBeInTheDocument();
  },
};

// A network failure leaves the dialog open for a retry, same as a server error.
export const RenewNetworkError: Story = {
  args,
  beforeEach: () => {
    const originalFetch = window.fetch;
    window.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    return () => {
      window.fetch = originalFetch;
    };
  },
  play: async () => {
    await clickKeepAlive();
    await expect(
      await dialog().findByText('Something went wrong. Please try again.')
    ).toBeInTheDocument();
    await expect(dialog().getByTestId('confirmDialogAction')).toBeEnabled();
  },
};

// Leaves the warning window and comes back, as when the user signs in again in
// another tab and that session later nears expiry.
const ReenterWarningHarness: React.FC<
  React.ComponentProps<typeof SessionStatusManager>
> = (props) => {
  const [promptToExtend, setPromptToExtend] = useState(props.promptToExtend);
  return (
    <>
      <button
        type='button'
        onClick={() => setPromptToExtend((value) => !value)}
      >
        Toggle warning
      </button>
      <SessionStatusManager {...props} promptToExtend={promptToExtend} />
    </>
  );
};

export const WarningShowsAgainAfterDismissed: Story = {
  args,
  beforeEach: stubKeepalive('120'),
  render: (storyArgs) => <ReenterWarningHarness {...args} {...storyArgs} />,
  play: async ({ canvasElement }) => {
    await clickKeepAlive();
    await dialog().findByText("Your session can't be extended");
    await userEvent.click(dialog().getByText('Close'));
    await waitFor(() =>
      expect(dialog().queryByRole('dialog')).not.toBeInTheDocument()
    );

    const toggle = within(canvasElement).getByText('Toggle warning');
    await userEvent.click(toggle); // out of the warning window
    await userEvent.click(toggle); // back in

    await expect(
      await dialog().findByText('Are you still there?')
    ).toBeInTheDocument();
  },
};

// The session already timed out on the server: end it as expired, which clears
// the page and shows the timed-out notice, rather than reloading.
export const RenewSignedOut: Story = {
  args,
  beforeEach: stubKeepalive(undefined, 401),
  play: async ({ args }) => {
    await clickKeepAlive();
    await waitFor(() => expect(args.expireSession).toHaveBeenCalledOnce());
  },
};
