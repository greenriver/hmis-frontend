import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

const DEFAULT_THROW = import.meta.env.MODE !== 'production';

interface Props {
  error: Error;
  blocking?: boolean;
}

const RecoverableError: React.FC<Props> = ({
  error,
  blocking = DEFAULT_THROW,
}) => {
  const { user } = useAuth();
  useEffect(() => {
    if (blocking) {
      throw error;
    } else {
      Sentry.captureException(error, { user: sentryUser(user) });
    }
  }, [user, error, blocking]);
  return undefined;
};

export default RecoverableError;
