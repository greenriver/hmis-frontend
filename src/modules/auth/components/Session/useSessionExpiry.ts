import { useEffect, useState } from 'react';

import * as storage from '@/modules/auth/api/storage';
import { HMIS_APP_SESSION_UID_EVENT } from '@/modules/auth/components/Session/constants';

export const useSessionExpiry = () => {
  const [expiry, setExpiry] = useState(storage.getSessionTracking);

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

    document.addEventListener(
      HMIS_APP_SESSION_UID_EVENT,
      handleSessionUserIdEvent
    );
    return () =>
      document.removeEventListener(
        HMIS_APP_SESSION_UID_EVENT,
        handleSessionUserIdEvent
      );
  }, []);
  return expiry;
};
