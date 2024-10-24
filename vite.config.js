import dns from 'dns';
import { resolve } from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';

import mkcert from 'vite-plugin-mkcert';

dns.setDefaultResultOrder('ipv4first');

const VISUALIZER = false; // enable to generate bundle visualization on build
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
      // Note: even though sourcemaps are public, we upload them to get additional Sentry tooling around releases
      ...(env.SENTRY_ORG && env.SENTRY_PROJECT && env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
              release: {
                uploadLegacySourcemaps: {
                  paths: ['dist/assets/'],
                  urlPrefix: '~/assets/',
                },
                name: env.PUBLIC_GIT_COMMIT_HASH,
                setCommits: {
                  repo: 'greenriver/hmis-frontend',
                  commit: env.FULL_GITHASH,
                },
              },
              // reactComponentAnnotation: { enabled: true, },
              telemetry: false,
              debug: false,
            }),
          ]
        : []),
    ],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    esbuild: {
      // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      // Drop log statements when minifying
      pure: ['console.log', 'console.info', 'console.debug'],
    },
    test: {
      watch: false,
    },
    build: {
      rollupOptions: {
        plugins: [
          VISUALIZER && visualizer({ filename: 'bundle_analysis.html' }),
        ],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
        onwarn(warning, defaultHandler) {
          if (warning.code === 'SOURCEMAP_ERROR') {
            return;
          }
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          defaultHandler(warning);
        },
      },
      commonjsOptions: { transformMixedEsModules: true },
      sourcemap: true,
      minify: mode === 'development' ? false : 'esbuild',
    },
    ...(command !== 'build' && {
      preview: {
        open: false,
        port: 5173, // expected in capybara system test instructions
        strictPort: true,
      },
      server: {
        port: 5173,
        open: true,
        host: env.HMIS_HOST || 'hmis.dev.test',
        https:
          env.SERVER_HTTPS === undefined ? true : env.SERVER_HTTPS === 'true',
        proxy: {
          '/hmis': warehouseProxyServer,
          '/dev-assets/theme': warehouseProxyServer,
        },
      },
    }),
  };
});
