import { useCallback, useEffect, useMemo, useState } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import { sessionExpiresAt } from '@/modules/auth/api/storage';
import { useSessionTracking } from '@/modules/auth/hooks/useSessionTracking';
import { currentTimeInSeconds } from '@/utils/time';

export type HmisSessionProps = {
  status: 'invalid' | 'expired' | 'valid';
  promptToExtend: boolean;
  // ends the session as timed out, e.g. when the server says it already has
  expireSession: () => void;
};

// how often to check for a warning or expiry that a sleeping timer missed
export const WALL_CLOCK_CHECK_MS = 5000;

interface Props {
  initialUser: HmisUser;
  promptToExtendBefore: number; // prompt when X seconds remain in session
}
const useSessionStatus = ({
  initialUser,
  promptToExtendBefore,
}: Props): HmisSessionProps => {
  // expiry will change from network events
  const tracking = useSessionTracking();

  // useState prevents user from changing underneath us.
  // During impersonation the session UID header reports the impersonated user, so
  // tracking.userId holds that id. Compare it against initialUser.id, which is the
  // same impersonated id, not against the true user.
  const [{ sessionDuration, id: initialUserId }] = useState(initialUser);
  // if this session has ended
  const [exitStatus, setExitStatus] = useState<'invalid' | 'expired'>();
  const expireSession = useCallback(
    () => setExitStatus((current) => current ?? 'expired'),
    []
  );
  // how long until the session expires
  const [timeRemaining, setTimeRemaining] = useState(
    tracking ? sessionDuration : undefined
  );

  // Timers don't count time the computer spends asleep, so they fire late after
  // a wake. Reschedule from the wall clock when the page is shown again.
  const [pageShownAt, setPageShownAt] = useState<number>();
  useEffect(() => {
    const handlePageShown = () => {
      if (document.visibilityState === 'visible') setPageShownAt(Date.now());
    };
    document.addEventListener('visibilitychange', handlePageShown);
    window.addEventListener('focus', handlePageShown);
    return () => {
      document.removeEventListener('visibilitychange', handlePageShown);
      window.removeEventListener('focus', handlePageShown);
    };
  }, []);

  // update time remaining in response to expiry changes
  const sessionExited = !!exitStatus;
  const expiresAt = tracking?.timestamp
    ? sessionExpiresAt(tracking, sessionDuration)
    : undefined;
  useEffect(() => {
    if (!expiresAt) return;
    if (sessionExited) return;

    const updateTimeRemaining = () => {
      const value = expiresAt - currentTimeInSeconds();
      setTimeRemaining(value > 0 ? value : 0);
    };

    updateTimeRemaining();
    const now = currentTimeInSeconds();
    const timeouts: Array<NodeJS.Timeout> = [];

    // when to expire the session
    const expireTimeout = expiresAt - now;

    // when to show session expiration warning
    const warnTimeout = expireTimeout - promptToExtendBefore;

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

    // Waking with the page already shown fires neither visibilitychange nor focus,
    // so also poll the wall clock for a warning or expiry the timers missed.
    let pendingDeadlines = [expiresAt - promptToExtendBefore, expiresAt].filter(
      (deadline) => deadline > now
    );
    const wallClockCheck = setInterval(() => {
      const checkedAt = currentTimeInSeconds();
      if (pendingDeadlines.every((deadline) => deadline > checkedAt)) return;
      pendingDeadlines = pendingDeadlines.filter(
        (deadline) => deadline > checkedAt
      );
      updateTimeRemaining();
    }, WALL_CLOCK_CHECK_MS);

    // cleanup events
    return () => {
      for (const timeout of timeouts) clearTimeout(timeout);
      clearInterval(wallClockCheck);
    };
  }, [sessionExited, expiresAt, promptToExtendBefore, pageShownAt]);

  // check if the session has ended due to expiration or invalid
  useEffect(() => {
    // checking the value we are setting is normally dangerous but it's okay
    // here since it's only set once
    if (exitStatus) return;

    if (tracking?.userId !== initialUserId) {
      // Add a small delay to allow for temporary inconsistencies to resolve
      const timeout = setTimeout(() => {
        // Check again after delay
        if (tracking?.userId !== initialUserId) {
          setExitStatus('invalid');
        }
      }, 500);

      return () => clearTimeout(timeout);
    } else if (timeRemaining !== undefined && timeRemaining <= 1) {
      setExitStatus('expired');
    }
  }, [exitStatus, timeRemaining, tracking?.userId, initialUserId]);

  return useMemo<HmisSessionProps>(() => {
    if (exitStatus) {
      return { status: exitStatus, promptToExtend: false, expireSession };
    }

    if (timeRemaining && timeRemaining - 1 <= promptToExtendBefore) {
      return { status: 'valid', promptToExtend: true, expireSession };
    }
    return { status: 'valid', promptToExtend: false, expireSession };
  }, [exitStatus, timeRemaining, promptToExtendBefore, expireSession]);
};
export default useSessionStatus;
