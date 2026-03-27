import { useEffect, useMemo, useState } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import { useSessionTracking } from '@/modules/auth/hooks/useSessionTracking';
import { currentTimeInSeconds } from '@/utils/time';

const POLL_INTERVAL_SECS = 30; // Check session status every 30 seconds

export type HmisSessionProps = {
  status: 'invalid' | 'expired' | 'valid';
  promptToExtend: boolean;
};

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

  // useState prevents user from changing underneath us
  // When impersonating, use the true user's ID for session tracking
  const [{ sessionDuration, id: initialUserId, trueUser }] =
    useState(initialUser);
  const sessionTrackingUserId = trueUser?.id || initialUserId;
  // if this session has ended
  const [exitStatus, setExitStatus] = useState<'invalid' | 'expired'>();
  // how long until the session expires
  const [timeRemaining, setTimeRemaining] = useState(
    tracking ? sessionDuration : undefined
  );

  // update time remaining in response to timestamp changes
  const sessionExited = !!exitStatus;
  useEffect(() => {
    const timestamp = tracking?.timestamp;
    if (!timestamp) return;
    if (sessionExited) return;

    const updateTimeRemaining = () => {
      const value = sessionDuration - (currentTimeInSeconds() - timestamp);
      setTimeRemaining(value > 0 ? value : 0);
    };

    // Update immediately and then poll regularly
    updateTimeRemaining();
    const pollInterval = setInterval(
      updateTimeRemaining,
      POLL_INTERVAL_SECS * 1000
    );

    const now = currentTimeInSeconds();
    const timeouts: Array<NodeJS.Timeout> = [];

    // when to expire the session
    const expireTimeout = timestamp + sessionDuration - now;

    // seconds relative to session start to show warning
    const warnAfter = sessionDuration - promptToExtendBefore;
    // when to show session expiration warning
    const warnTimeout =
      tracking.timestamp + (warnAfter > 0 ? warnAfter : 0) - now;

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
      clearInterval(pollInterval);
      for (const timeout of timeouts) clearTimeout(timeout);
    };
  }, [
    sessionExited,
    tracking?.timestamp,
    promptToExtendBefore,
    sessionDuration,
  ]);

  // check if the session has ended due to expiration or invalid
  useEffect(() => {
    // checking the value we are setting is normally dangerous but it's okay
    // here since it's only set once
    if (exitStatus) return;

    if (tracking?.userId !== sessionTrackingUserId) {
      // Add a small delay to allow for temporary inconsistencies to resolve
      const timeout = setTimeout(() => {
        // Check again after delay
        if (tracking?.userId !== sessionTrackingUserId) {
          setExitStatus('invalid');
        }
      }, 500);

      return () => clearTimeout(timeout);
    } else if (timeRemaining !== undefined && timeRemaining <= 1) {
      setExitStatus('expired');
    }
  }, [exitStatus, timeRemaining, tracking?.userId, sessionTrackingUserId]);

  // Debugging: log session status every 30 seconds (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const pollInterval = setInterval(() => {
      console.debug('Session status poll:');
      console.debug('  timeRemaining (seconds):', timeRemaining);
      console.debug('  promptToExtendBefore (seconds):', promptToExtendBefore);
      console.debug('  exitStatus:', exitStatus);
      console.debug('  tracking.userId:', tracking?.userId);
      console.debug('  sessionTrackingUserId:', sessionTrackingUserId);
    }, POLL_INTERVAL_SECS * 1000);

    return () => clearInterval(pollInterval);
  }, [
    timeRemaining,
    promptToExtendBefore,
    exitStatus,
    tracking?.userId,
    sessionTrackingUserId,
  ]);

  return useMemo<HmisSessionProps>(() => {
    if (exitStatus) return { status: exitStatus, promptToExtend: false };

    if (timeRemaining && timeRemaining - 1 <= promptToExtendBefore) {
      return { status: 'valid', promptToExtend: true };
    }
    return { status: 'valid', promptToExtend: false };
  }, [exitStatus, timeRemaining, promptToExtendBefore]);
};
export default useSessionStatus;
