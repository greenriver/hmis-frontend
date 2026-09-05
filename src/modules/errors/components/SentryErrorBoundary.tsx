import { ErrorBoundary } from '@sentry/react';
import { ReactNode } from 'react';

import { AlertErrorFallback } from './ErrorFallback';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

const SentryErrorBoundary = ({
  children,
  resetKeys,
}: {
  children: ReactNode;
  // Values that clear the error when they change. Sentry's ErrorBoundary has no equivalent, so
  // this is handled in AlertErrorFallback.
  resetKeys?: unknown[];
}) => {
  const { user } = useAuth();

  return (
    <ErrorBoundary
      fallback={(props) => (
        <AlertErrorFallback {...props} resetKeys={resetKeys} />
      )}
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
