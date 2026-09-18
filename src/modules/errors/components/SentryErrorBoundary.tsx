import { ErrorBoundary, FallbackRender } from '@sentry/react';
import { ReactNode, useCallback, useRef } from 'react';

import { AlertErrorFallback } from './ErrorFallback';

import { sentryUser } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';

const SentryErrorBoundary = ({
  children,
  resetKeys,
}: {
  children: ReactNode;
  // Clear the error when these change. Sentry's ErrorBoundary has no equivalent, so it's
  // implemented in AlertErrorFallback; see the note on its resetKeys prop.
  resetKeys?: unknown[];
}) => {
  const { user } = useAuth();

  // Sentry renders `fallback` as a component type, so it must keep one identity across renders: an
  // inline function, or a dep on resetKeys here, would remount AlertErrorFallback and discard the
  // keys it compares against. Hence the ref.
  const resetKeysRef = useRef(resetKeys);
  resetKeysRef.current = resetKeys;

  const fallback = useCallback<FallbackRender>(
    (props) => (
      <AlertErrorFallback {...props} resetKeys={resetKeysRef.current} />
    ),
    []
  );

  return (
    <ErrorBoundary
      fallback={fallback}
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
