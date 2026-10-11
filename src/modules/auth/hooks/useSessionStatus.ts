import { useEffect, useMemo, useState } from 'react';

import { HmisUser } from '@/modules/auth/api/sessions';
import { sessionExpiresAt } from '@/modules/auth/api/storage';
import { useSessionTracking } from '@/modules/auth/hooks/useSessionTracking';
import { currentTimeInSeconds } from '@/utils/time';

export type HmisSessionProps = {
  status: 'invalid' | 'expired' | 'valid';
  promptToExtend: boolean;
};

type Phase = 'active' | 'warning' | 'expired';

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
  const [phase, setPhase] = useState<Phase>('active');

  // Check the wall clock every second rather than scheduling timeouts, which fire
  // late after the computer sleeps. setPhase only re-renders when the phase changes.
  const sessionExited = !!exitStatus;
  const expiresAt = tracking?.timestamp
    ? sessionExpiresAt(tracking, sessionDuration)
    : undefined;
  useEffect(() => {
    if (!expiresAt) return;
    if (sessionExited) return;

    const updatePhase = () => {
      const timeRemaining = expiresAt - currentTimeInSeconds();
      if (timeRemaining <= 1) setPhase('expired');
      else if (timeRemaining - 1 <= promptToExtendBefore) setPhase('warning');
      else setPhase('active');
    };
    updatePhase();
    const interval = setInterval(updatePhase, 1000);
    return () => clearInterval(interval);
  }, [sessionExited, expiresAt, promptToExtendBefore]);

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
    } else if (phase === 'expired') {
      setExitStatus('expired');
    }
  }, [exitStatus, phase, tracking?.userId, initialUserId]);

  return useMemo<HmisSessionProps>(() => {
    if (exitStatus) return { status: exitStatus, promptToExtend: false };
    return { status: 'valid', promptToExtend: phase === 'warning' };
  }, [exitStatus, phase]);
};
export default useSessionStatus;
