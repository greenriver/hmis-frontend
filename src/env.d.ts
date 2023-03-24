/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_NAME: string;
  readonly PUBLIC_WAREHOUSE_URL: string;
  readonly PUBLIC_CAS_URL: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly PUBLIC_PROTECTED_IDS: string;
  readonly PUBLIC_INITIAL_DELIMITER: string;
  readonly PUBLIC_PROTECTED_ID_KEY: string;
  readonly PUBLIC_ALLOW_SET_THEME: string;
  readonly PUBLIC_OKTA_SSO_PATH: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
