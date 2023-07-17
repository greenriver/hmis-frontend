import { useEffect, useState } from 'react';

import * as storage from '@/modules/auth/api/storage';
import { EXPIRY_EVENT } from '@/modules/auth/components/Session/constants';

// expiration tracker, synced with local storage
export const useSessionExpiry = () => {
  const [expiry, setExpiry] = useState(storage.getSessionExpiry);

  // handle session user id changed (within the same tab)
  useEffect(() => {
    const handleSessionUserIdEvent = (evt: Event) => {
      const expiry = (evt as CustomEvent).detail;
      if (expiry) {
        setExpiry(expiry);
      } else {
        setExpiry(undefined);
      }
    };

    document.addEventListener(EXPIRY_EVENT, handleSessionUserIdEvent);
    return () =>
      document.removeEventListener(EXPIRY_EVENT, handleSessionUserIdEvent);
  }, []);
  return expiry;
};
