import { useEffect, useState } from 'react';

import { HMIS_APP_SESSION_UID_EVENT } from '@/modules/auth/api/constants';
import * as storage from '@/modules/auth/api/storage';

export const useSessionTracking = () => {
  const [tracking, setTracking] = useState(storage.getSessionTracking);

  useEffect(() => {
    const handleSessionUserIdEvent = (evt: Event) => {
      const { detail } = evt as CustomEvent<
        storage.HmisSessionTracking | undefined
      >;
      setTracking(detail || undefined);
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
  return tracking;
};
