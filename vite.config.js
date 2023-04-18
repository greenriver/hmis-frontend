import dns from 'dns';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

dns.setDefaultResultOrder('ipv4first');

const DEFAULT_WAREHOUSE_SERVER = 'https://hmis-warehouse.dev.test';

// https://github.com/vitejs/vite/issues/2433#issuecomment-1487472995
function sourcemapExclude(opts) {
  return {
    name: 'sourcemap-exclude',
    transform(code, id) {
      if (opts?.excludeNodeModules && id.includes('node_modules')) {
        return {
          code,
          map: { mappings: '' },
        };
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const warehouseProxyServer = {
    target: env.HMIS_SERVER_URL || DEFAULT_WAREHOUSE_SERVER,
    changeOrigin: true, // sets Host header
    headers: {
      Origin: env.HMIS_SERVER_URL || DEFAULT_WAREHOUSE_SERVER,
    },
    secure: false,
  };

  return {
    envPrefix: 'PUBLIC_',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      react(),
      mkcert(),
      sourcemapExclude({ excludeNodeModules: true }),
      // Note: leaving source map upload disabled, because source maps are public.
      /*
      ...(env.SENTRY_ORG && env.SENTRY_PROJECT && env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              include: 'dist/assets/',
              urlPrefix: '~/assets/',
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
              release: env.PUBLIC_GIT_COMMIT_HASH,
              setCommits: {
                repo: 'greenriver/hmis-frontend',
                commit: env.FULL_GITHASH,
              },
              telemetry: false,
              debug: false,
            }),
          ]
        : []),
        */
    ],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    esbuild: {
      // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    build: {
      rollupOptions: {
        plugins: [
          // visualizer({ filename: 'bundle_analysis.html' })
        ],
      },
      sourcemap: true,
    },
    ...(command !== 'build' && {
      preview: {
        // cypress expects on 5173
        port: 5173,
        strictPort: true,
      },
      server: {
        port: 5173,
        open: true,
        host: env.HMIS_HOST || 'hmis.dev.test',
        https: true,
        proxy: {
          '/hmis': warehouseProxyServer,
          '/assets/theme': warehouseProxyServer,
        },
      },
    }),
  };
});
