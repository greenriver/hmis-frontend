/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_NAME: string;
  readonly PUBLIC_WAREHOUSE_URL: string;
  readonly PUBLIC_CAS_URL: string;
  readonly PUBLIC_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
