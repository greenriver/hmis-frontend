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
      const { userId, remainingSecs } = (
        evt as CustomEvent<RemoteSessionDetail>
      ).detail;
      if (!userId) {
        fireEvent(undefined);
        storage.clearSessionTracking();
        return;
      }

      const now = currentTimeInSeconds();
      const tracking: storage.HmisSessionTracking = { userId, timestamp: now };
      if (remainingSecs !== undefined) {
        tracking.expiresAt = storage.laterExpiresAt(
          storage.getSessionTracking(),
          userId,
          now + remainingSecs
        );
      }
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
