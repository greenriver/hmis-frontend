import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

interface Props {
  error: Error;
  blocking?: boolean;
}

const RecoverableError: React.FC<Props> = ({ error, blocking = false }) => {
  const { user } = useAuth();
  useEffect(() => {
    if (blocking || import.meta.env.MODE !== 'production') {
      throw error;
    } else {
      Sentry.captureException(error, { user: sentryUser(user) });
    }
  }, [user, error, blocking]);
  return undefined;
};

export default RecoverableError;
