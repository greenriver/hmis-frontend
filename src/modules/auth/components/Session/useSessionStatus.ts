import { useCallback, useEffect, useMemo, useState } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import { useSessionExpiry } from '@/modules/auth/components/Session/useSessionExpiry';
import { currentTimeInSeconds } from '@/utils/time';

export type HmisSessionStatus = {
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
}: Props): HmisSessionStatus => {
  const expiry = useSessionExpiry();

  const { sessionDuration } = initialUser;
  const [initialUserId] = useState(initialUser.id);
  const [exitStatus, setExitStatus] = useState<'invalid' | 'expired'>();
  const [timeRemaining, setTimeRemaining] = useState(
    expiry ? sessionDuration : undefined
  );

  const updateTimeRemaining = useCallback(() => {
    const timestamp = expiry?.timestamp;

    if (timestamp) {
      const timeRemaining =
        sessionDuration - (currentTimeInSeconds() - timestamp);
      setTimeRemaining(timeRemaining > 0 ? timeRemaining : 0);
    }
  }, [expiry?.timestamp, sessionDuration]);

  // update time remaining
  useEffect(() => {
    if (!expiry?.timestamp) return;
    if (exitStatus) return;

    updateTimeRemaining();
    const now = currentTimeInSeconds();
    const timeouts: Array<NodeJS.Timeout> = [];

    // when to expire the session
    const expireTimeout = expiry.timestamp + sessionDuration - now;

    // seconds relative to session start to show warning
    const warnAfter = sessionDuration - promptToExtendBefore;
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
    promptToExtendBefore,
    sessionDuration,
    exitStatus,
    updateTimeRemaining,
  ]);

  useEffect(() => {
    // checking the value we are setting is normally dangerous but it's okay
    // here since it's only set once
    if (!exitStatus) {
      if (expiry?.userId !== initialUserId) {
        setExitStatus('invalid');
      } else if (timeRemaining !== undefined && timeRemaining <= 1) {
        setExitStatus('expired');
      }
    }
  }, [exitStatus, timeRemaining, expiry?.userId, initialUserId]);

  // debugging
  useEffect(() => {
    console.info('expiry', expiry, currentTimeInSeconds());
  }, [expiry]);
  useEffect(() => {
    console.info('time remaining', timeRemaining, currentTimeInSeconds());
  }, [timeRemaining]);
  useEffect(() => {
    console.info('exit status', exitStatus, currentTimeInSeconds());
  }, [exitStatus]);
  useEffect(() => {
    console.info('initial user id', initialUser.id, currentTimeInSeconds());
  }, [initialUser.id]);

  return useMemo<HmisSessionStatus>(() => {
    if (exitStatus) return { status: exitStatus, promptToExtend: false };

    if (timeRemaining && timeRemaining <= promptToExtendBefore) {
      return { status: 'valid', promptToExtend: true };
    }
    return { status: 'valid', promptToExtend: false };
  }, [exitStatus, timeRemaining, promptToExtendBefore]);
};
export default useSessionStatus;
