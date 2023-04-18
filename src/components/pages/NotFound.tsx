import * as Sentry from '@sentry/react';

import ErrorFallback from '@/modules/errors/components/ErrorFallback';

const NotFound = () => {
  Sentry.captureException(new Error('Page not found'));
  return <ErrorFallback text='Page not found.' />;
};

export default NotFound;
