import { ErrorBoundary } from '@sentry/react';
import { ReactNode } from 'react';

import { alertErrorFallback, fullPageErrorFallback } from './ErrorFallback';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

const SentryErrorBoundary = ({
  children,
  fullpage = false,
}: {
  children: ReactNode;
  fullpage?: boolean;
}) => {
  const { user } = useAuth();
  return (
    <ErrorBoundary
      fallback={fullpage ? fullPageErrorFallback : alertErrorFallback}
      beforeCapture={(scope) => {
        scope.setUser(sentryUser(user));
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SentryErrorBoundary;
