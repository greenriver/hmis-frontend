import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import React from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import * as storage from '@/modules/auth/api/storage';
import useSessionStatus, {
  WALL_CLOCK_CHECK_MS,
} from '@/modules/auth/hooks/useSessionStatus';

const user: HmisUser = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  sessionDuration: 1800,
  impersonating: false,
};

const SessionStatusHarness: React.FC = () => {
  const { status, expireSession } = useSessionStatus({
    initialUser: user,
    promptToExtendBefore: 300,
  });
  return (
    <>
      <div data-testid='sessionStatus'>{status}</div>
      <button type='button' onClick={expireSession}>
        Expire session
      </button>
    </>
  );
};

export default {
  component: SessionStatusHarness,
} as Meta<typeof SessionStatusHarness>;

type Story = StoryObj<typeof SessionStatusHarness>;

const RealDate = Date;

// Moves the browser clock forward without running pending timers, as waking
// from sleep does.
const skipAhead = (seconds: number) => {
  const offset = seconds * 1000;
  class ShiftedDate extends RealDate {
    constructor(value?: number | string | Date) {
      super(value ?? RealDate.now() + offset);
    }

    static now() {
      return RealDate.now() + offset;
    }
  }
  window.Date = ShiftedDate as DateConstructor;
};

// A JWT session with 30 minutes left.
const startSession = () => {
  const now = RealDate.now() / 1000;
  storage.setSessionTracking({
    userId: user.id,
    timestamp: now,
    requestedAt: now,
    expiresAt: now + 1800,
  });
  return () => {
    window.Date = RealDate;
    storage.clearSessionTacking();
  };
};

// Turns off the wall-clock check, so only the page event under test can catch
// the expiry.
const startSessionWithoutWallClockCheck = () => {
  const endSession = startSession();
  const originalSetInterval = window.setInterval;
  window.setInterval = (() => 0) as unknown as typeof window.setInterval;
  return () => {
    window.setInterval = originalSetInterval;
    endSession();
  };
};

const status = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('sessionStatus');

export const ExpiresWhenShownAfterSleep: Story = {
  beforeEach: startSessionWithoutWallClockCheck,
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('valid');

    skipAhead(60 * 60);
    // The expiry timer is still pending, so nothing changes until the page is shown.
    await expect(status(canvasElement)).toHaveTextContent('valid');

    document.dispatchEvent(new Event('visibilitychange'));
    await within(canvasElement).findByText('expired');
  },
};

export const ExpiresWhenFocusedAfterSleep: Story = {
  beforeEach: startSessionWithoutWallClockCheck,
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('valid');

    skipAhead(60 * 60);
    window.dispatchEvent(new Event('focus'));
    await within(canvasElement).findByText('expired');
  },
};

// Waking with the page already shown fires no event, so the wall-clock check
// catches it.
export const ExpiresAfterSleepWithoutPageEvent: Story = {
  beforeEach: startSession,
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('valid');

    skipAhead(60 * 60);
    await within(canvasElement).findByText(
      'expired',
      {},
      { timeout: WALL_CLOCK_CHECK_MS + 1000 }
    );
  },
};

// A keepalive answered 401: the session ends as expired with time still on the
// countdown.
export const ExpiresWhenServerSaysSo: Story = {
  beforeEach: startSession,
  play: async ({ canvasElement }) => {
    await expect(status(canvasElement)).toHaveTextContent('valid');

    await userEvent.click(within(canvasElement).getByText('Expire session'));
    await within(canvasElement).findByText('expired');
  },
};
