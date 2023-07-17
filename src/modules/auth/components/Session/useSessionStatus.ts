import { useEffect, useMemo, useState } from 'react';

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
  // expiry will change from network events
  const expiry = useSessionExpiry();

  // useState prevents user from changing underneath us
  const [{ sessionDuration, id: initialUserId }] = useState(initialUser);
  // if this session has ended
  const [exitStatus, setExitStatus] = useState<'invalid' | 'expired'>();
  // how long until the session expires
  const [timeRemaining, setTimeRemaining] = useState(
    expiry ? sessionDuration : undefined
  );

  // update time remaining in response to timestamp changes
  const sessionExited = !!exitStatus;
  useEffect(() => {
    const timestamp = expiry?.timestamp;
    if (!timestamp) return;
    if (sessionExited) return;

    const updateTimeRemaining = () => {
      const value = sessionDuration - (currentTimeInSeconds() - timestamp);
      setTimeRemaining(value > 0 ? value : 0);
    };

    updateTimeRemaining();
    const now = currentTimeInSeconds();
    const timeouts: Array<NodeJS.Timeout> = [];

    // when to expire the session
    const expireTimeout = timestamp + sessionDuration - now;

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
      for (const timeout of timeouts) clearTimeout(timeout);
    };
  }, [sessionExited, expiry?.timestamp, promptToExtendBefore, sessionDuration]);

  // check if the session has ended due to expiration or invalid
  useEffect(() => {
    // checking the value we are setting is normally dangerous but it's okay
    // here since it's only set once
    if (exitStatus) return;

    if (expiry?.userId !== initialUserId) {
      setExitStatus('invalid');
    } else if (timeRemaining !== undefined && timeRemaining <= 1) {
      setExitStatus('expired');
    }
  }, [exitStatus, timeRemaining, expiry?.userId, initialUserId]);

  // debugging
  /*
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
    console.info('initial user id', initialUserId, currentTimeInSeconds());
  }, [initialUserId]);
  */

  return useMemo<HmisSessionStatus>(() => {
    if (exitStatus) return { status: exitStatus, promptToExtend: false };

    if (timeRemaining && timeRemaining - 1 <= promptToExtendBefore) {
      return { status: 'valid', promptToExtend: true };
    }
    return { status: 'valid', promptToExtend: false };
  }, [exitStatus, timeRemaining, promptToExtendBefore]);
};
export default useSessionStatus;
