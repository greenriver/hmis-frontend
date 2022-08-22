/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
