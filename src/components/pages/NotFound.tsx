import * as Sentry from '@sentry/react';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';
import ErrorFallback from '@/modules/errors/components/ErrorFallback';

const NotFound = ({ text = 'Page not found.' }: { text?: string }) => {
  // Note: wee may or may not have an AuthProvider
  const { user } = useAuth();
  Sentry.captureException(new Error(text), {
    user: sentryUser(user),
  });

  return <ErrorFallback text={text} />;
};

export default NotFound;
