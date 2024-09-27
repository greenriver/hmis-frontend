import './sentryInit';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';

import App from './app/App';

window.gitCommitHash = import.meta.env.PUBLIC_GIT_COMMIT_HASH;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
