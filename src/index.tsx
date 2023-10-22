import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';

import App from './App';

if (import.meta.env.PUBLIC_SENTRY_DSN) {
  const hostname = window.location.hostname;
  const environment = /\b(qa|training|staging)\b/.test(hostname)
    ? 'staging'
    : 'production';
  Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN,
    environment,
    initialScope: {
      tags: { hostname: hostname },
    },
  });
}

window.gitCommitHash = import.meta.env.PUBLIC_GIT_COMMIT_HASH;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
