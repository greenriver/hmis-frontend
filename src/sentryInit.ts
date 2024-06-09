import * as Sentry from '@sentry/react';
import { excludeGraphQLFetch } from 'apollo-link-sentry';
import { useEffect } from 'react';

import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const dsn = import.meta.env.PUBLIC_SENTRY_DSN;
const hostname = window.location.hostname;
const environment = /\b(qa|training|staging)\b/.test(hostname)
  ? 'staging'
  : 'production';

if (dsn) {
  Sentry.init({
    dsn,
    beforeBreadcrumb: excludeGraphQLFetch, // filter redundant fetch breadcrumbs. See docs for apollo-link-sentry v4
    environment: environment,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    initialScope: {
      tags: { hostname: hostname },
    },
    // beforeSend(event, hint) {
    //   // attempt to skip double-reporting of unhandled errors
    //   //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   //if (hint?.originalException.graphQLErrors) return null

    //   console.info(JSON.stringify(event))
    //   console.info(JSON.stringify(hint))
    //   return event
    // }
  });
}
