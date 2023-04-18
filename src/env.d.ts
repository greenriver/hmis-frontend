/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SENTRY_DSN: string;
  readonly PUBLIC_PROTECTED_IDS: string;
  readonly PUBLIC_INITIAL_DELIMITER: string;
  readonly PUBLIC_PROTECTED_ID_KEY: string;
  readonly PUBLIC_ALLOW_SET_THEME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
