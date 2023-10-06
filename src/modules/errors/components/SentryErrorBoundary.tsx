import { ErrorBoundary } from '@sentry/react';
import { ReactNode } from 'react';

import { AlertErrorFallback } from './ErrorFallback';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

const SentryErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <ErrorBoundary
      fallback={(props) => <AlertErrorFallback {...props} />}
      beforeCapture={(scope) => {
        const userObj = sentryUser(user);
        if (userObj) scope.setUser(userObj);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SentryErrorBoundary;
