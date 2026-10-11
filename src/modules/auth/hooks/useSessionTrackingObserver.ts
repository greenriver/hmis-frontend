import { useEffect } from 'react';

import {
  HMIS_APP_SESSION_UID_EVENT,
  HMIS_REMOTE_SESSION_UID_EVENT,
} from '@/modules/auth/api/constants';
import * as storage from '@/modules/auth/api/storage';
import { RemoteSessionDetail } from '@/modules/auth/events';
import { currentTimeInSeconds } from '@/utils/time';

const fireEvent = (value: storage.HmisSessionTracking | undefined) => {
  document.dispatchEvent(
    new CustomEvent(HMIS_APP_SESSION_UID_EVENT, { detail: value })
  );
};

// The tracking record for a signed-in response, or undefined to keep `stored`.
export const nextSessionTracking = (
  {
    userId,
    remainingSecs,
    requestedAt,
  }: RemoteSessionDetail & { userId: string },
  stored: storage.HmisSessionTracking | undefined,
  now: number
): storage.HmisSessionTracking | undefined => {
  if (remainingSecs === undefined || requestedAt === undefined) {
    return { userId, timestamp: now };
  }
  // The newest request wins, not the latest expiry: every tab shares one
  // oauth2-proxy cookie, so the newest request carries the current token, and a
  // failed refresh must be able to pull the expiry earlier. A slow response from an
  // older request is dropped.
  if (
    stored?.userId === userId &&
    stored.requestedAt !== undefined &&
    stored.requestedAt > requestedAt
  ) {
    return undefined;
  }
  return {
    userId,
    timestamp: now,
    requestedAt,
    expiresAt: requestedAt + remainingSecs,
  };
};

// Translate storage and user id events into one expiration event
// Also syncs uid events to localstorage to share update with other tabs
export const useSessionTrackingObserver = () => {
  // handle changes from other tabs signaled via local storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      switch (e.key) {
        case storage.SESSION_TRACKING_STORAGE_KEY:
          fireEvent(e.newValue ? JSON.parse(e.newValue) : undefined);
          break;
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // handle session user id changed (within the same tab)
  useEffect(() => {
    const handleSessionUserIdEvent = (evt: Event) => {
      const { userId, remainingSecs, requestedAt } = (
        evt as CustomEvent<RemoteSessionDetail>
      ).detail;
      if (!userId) {
        fireEvent(undefined);
        storage.clearSessionTacking();
        return;
      }

      const tracking = nextSessionTracking(
        { userId, remainingSecs, requestedAt },
        storage.getSessionTracking(),
        currentTimeInSeconds()
      );
      if (!tracking) return;
      fireEvent(tracking);
      storage.setSessionTracking(tracking);
    };

    document.addEventListener(
      HMIS_REMOTE_SESSION_UID_EVENT,
      handleSessionUserIdEvent
    );
    return () =>
      document.removeEventListener(
        HMIS_REMOTE_SESSION_UID_EVENT,
        handleSessionUserIdEvent
      );
  }, []);
};
