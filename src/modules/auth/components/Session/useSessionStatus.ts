import { useCallback, useEffect, useMemo, useState } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import { useSessionExpiry } from '@/modules/auth/components/Session/useSessionExpiry';
import { currentTimeInSeconds } from '@/utils/time';

export type SessionStatus = 'expiresSoon' | 'invalid' | 'expired' | 'valid';

const getTimeRemaining = (
  timestamp: number | undefined,
  duration: number | undefined
) => {
  if (!(timestamp && duration)) return undefined;

  let timeRemaining = undefined;
  timeRemaining = duration - (currentTimeInSeconds() - timestamp);
  timeRemaining = timeRemaining > 0 ? timeRemaining : 0;
  return timeRemaining;
};

interface Props {
  initialUser: HmisUser;
  warnBefore: number;
}
const useSessionStatus = ({
  initialUser,
  warnBefore,
}: Props): SessionStatus => {
  const expiry = useSessionExpiry();

  const { sessionDuration } = initialUser;
  const [initialUserId] = useState(initialUser.id);
  const [exitStatus, setExitStatus] = useState<'invalid' | 'expired'>();
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration);

  const updateTimeRemaining = useCallback(() => {
    const calc = getTimeRemaining(expiry?.timestamp, sessionDuration);
    if (calc !== undefined) {
      setTimeRemaining(calc);
    }
  }, [expiry?.timestamp, sessionDuration]);

  useEffect(() => {
    if (!expiry?.timestamp) return;
    if (exitStatus) return;

    updateTimeRemaining();
    const now = currentTimeInSeconds();
    const timeouts: Array<NodeJS.Timeout> = [];

    // when to expire the session
    const expireTimeout = expiry.timestamp + sessionDuration - now;

    // seconds relative to session start to show warning
    const warnAfter = sessionDuration - warnBefore;
    // when to show session expiration warning
    const warnTimeout =
      expiry.timestamp + (warnAfter > 0 ? warnAfter : 0) - now;

    if (expireTimeout > 0) {
      timeouts.push(
        setTimeout(
          updateTimeRemaining,
          warnTimeout > 0 ? warnTimeout * 1000 : 0
        )
      );
    }
    timeouts.push(
      setTimeout(
        updateTimeRemaining,
        expireTimeout > 0 ? expireTimeout * 1000 : 0
      )
    );

    // cleanup events
    return () => {
      for (const timeout in timeouts) clearTimeout(timeout);
    };
  }, [
    expiry?.timestamp,
    warnBefore,
    sessionDuration,
    exitStatus,
    updateTimeRemaining,
  ]);

  useEffect(() => {
    // checking the value we are setting is normally dangerous but it's okay
    // here since it's only set once
    if (!exitStatus) {
      if (expiry?.userId !== initialUserId) setExitStatus('invalid');
      else if (timeRemaining <= 1) setExitStatus('expired');
    }
  }, [exitStatus, timeRemaining, expiry?.userId, initialUserId]);

  return useMemo(() => {
    if (exitStatus) return exitStatus;

    if (timeRemaining && timeRemaining <= warnBefore) {
      return 'expiresSoon';
    }
    return 'valid';
  }, [exitStatus, timeRemaining, warnBefore]);
};
export default useSessionStatus;
