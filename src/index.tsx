import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';

import App from './App';

if (import.meta.env.PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.PUBLIC_SENTRY_DSN });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
