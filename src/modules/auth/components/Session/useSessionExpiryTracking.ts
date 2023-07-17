import { useEffect } from 'react';

import * as storage from '@/modules/auth/api/storage';
import {
  EXPIRY_EVENT,
  USER_ID_EVENT,
} from '@/modules/auth/components/Session/constants';
import { currentTimeInSeconds } from '@/utils/time';

const fireEvent = (expiry: storage.SessionExpiry | undefined) => {
  document.dispatchEvent(new CustomEvent(EXPIRY_EVENT, { detail: expiry }));
};

// session expiration tracker
// Translate storage and user id events into one expiration event
// Also syncs uid events to localstorage to share update with other tabs
export const useSessionExpiryTracking = () => {
  // handle changes from other tabs signaled via local storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      switch (e.key) {
        case storage.SESSION_STORAGE_KEY:
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
      const eventId = (evt as CustomEvent).detail;
      const expiry = eventId
        ? { userId: eventId, timestamp: currentTimeInSeconds() }
        : undefined;
      if (expiry) {
        fireEvent(expiry);
        storage.setSessionExpiry(expiry);
      } else {
        fireEvent(undefined);
        storage.clearSessionExpiry();
      }
    };

    document.addEventListener(USER_ID_EVENT, handleSessionUserIdEvent);
    return () =>
      document.removeEventListener(USER_ID_EVENT, handleSessionUserIdEvent);
  }, []);
};
