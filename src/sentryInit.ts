import * as Sentry from '@sentry/react';
import { excludeGraphQLFetch } from 'apollo-link-sentry';
import { useEffect } from 'react';

import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';

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
      // Deliberately the V6 integration on router v7. The V7 one needs
      // @sentry/react >= 8.42.0, and that bump is still undecided. Safe to
      // leave: @sentry/react types its route and match params as `any`, so a
      // router signature change can't break this call.
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
    beforeSend(event, hint) {
      // attempt to skip double-reporting of graphql errors
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if ( hint?.originalException?.graphQLErrors || hint?.originalException?.networkError) return null;
      return event;
    },
  });
}
