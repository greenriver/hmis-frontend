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
// Behind the SSO stack the API proxies to the HMIS backend's oauth2-proxy front
// door, not the warehouse's. oauth2-proxy-hmis injects `Authorization: Bearer
// <id_token>`, and only oauth2-proxy-hmis-backend can validate that token: it
// shares the `_oauth2_proxy_hmis` cookie and `hmis-frontend` client, and sets
// skip_jwt_bearer_tokens.
const DEFAULT_BACKEND_SERVER = 'https://hmis-backend.dev.test';

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

  // HMIS host for this dev server, override with `HMIS_HOST=hmis-2.dev.test yarn dev`
  const devHmisHost = env.HMIS_HOST || 'hmis.dev.test';
  const usePolling = env.SERVER_WATCH_USE_POLLING === 'true';

  // Opt in to running behind the warehouse's local SSO stack (Keycloak + Dex,
  // brought up with the warehouse's docker/docker-compose.auth.yml override).
  // The browser then reaches this dev server only at https://hmis.dev.test:
  // Traefik -> oauth2-proxy-hmis -> host.docker.internal:5173, never port 5173
  // directly. The settings below all follow from that topology.
  const behindOAuthProxy = env.HMIS_BEHIND_OAUTH_PROXY === 'true';

  // Strip any trailing slash: warehouseProxyServer sends this value verbatim as
  // the Origin header, and the warehouse's CSRF check compares Origin against
  // request.base_url, which Rack always builds without a trailing slash. A stray
  // slash silently breaks every non-GET /hmis request, including all GraphQL.
  const warehouseServerUrl = (
    env.HMIS_SERVER_URL ||
    (behindOAuthProxy ? DEFAULT_BACKEND_SERVER : DEFAULT_WAREHOUSE_SERVER)
  ).replace(/\/+$/, '');

  // warehouseProxyServer is used below only in dev (command !== 'build')
  const warehouseProxyServer = {
    target: warehouseServerUrl,
    changeOrigin: true, // sets Host header
    headers: {
      Origin: warehouseServerUrl,
      // Pass the HMIS hostname so the warehouse can resolve the correct data source (for multi-HMIS local setup).
      // The backend is not able to determine the hostname in the usual way (using trusted rails host resolution)
      // because dev server requests always appear to come from 'hmis-warehouse.dev.test'
      'X-Hmis-Dev-Host': devHmisHost,
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
      mkcert({
        savePath: resolve(
          __dirname,
          `.mkcert-${devHmisHost.replace(/\./g, '-')}`
        ),
      }),
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
      target: 'baseline-widely-available',
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
        // oauth2-proxy-hmis upstreams to a hardcoded host.docker.internal:5173,
        // so fail rather than drift to another port.
        strictPort: behindOAuthProxy,
        // Opening this server's own URL would bypass oauth2-proxy-hmis, and with
        // it SSO, so open the proxied entrypoint instead.
        open: behindOAuthProxy ? `https://${devHmisHost}/` : true,
        // oauth2-proxy-hmis reaches us from a container via host.docker.internal,
        // so bind all interfaces.
        host: behindOAuthProxy ? true : devHmisHost,
        // oauth2-proxy-hmis upstreams over https (with insecureSkipTLSVerify), so
        // the dev server has to speak TLS regardless of SERVER_HTTPS.
        https:
          behindOAuthProxy ||
          (env.SERVER_HTTPS === undefined ? true : env.SERVER_HTTPS === 'true'),
        watch: usePolling ? { usePolling } : undefined,
        // oauth2-proxy-hmis passHostHeader delivers the Host as hmis.dev.test, and
        // the browser reaches Traefik on 443 rather than our own port, so HMR's
        // websocket client has to dial 443.
        ...(behindOAuthProxy && {
          allowedHosts: [devHmisHost, 'host.docker.internal'],
          hmr: { clientPort: 443 },
        }),
        proxy: {
          '/hmis': warehouseProxyServer,
          '/dev-assets/theme': warehouseProxyServer,
          '/logo': warehouseProxyServer,
        },
      },
    }),
  };
});
