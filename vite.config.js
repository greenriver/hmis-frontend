import dns from 'dns';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

dns.setDefaultResultOrder('ipv4first');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    envPrefix: 'PUBLIC_',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [react(), mkcert()],
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
    },
    // TODO create another env for testing that proxies to the mock server
    ...(command !== 'build' && {
      preview: {
        // cypress expects on 5173
        port: 5173,
        strictPort: true,
      },
      server: {
        port: 5173,
        open: true,
        host: 'hmis.dev.test',
        https: true,
        proxy: {
          '/hmis': {
            target: env.SERVER_URL || 'https://hmis-warehouse.dev.test',
            changeOrigin: true,
            secure: false,
            // toProxy: true,
            // prependPath: true,
            // localAddress: '127.0.0.1',
            // xfwd: true,
            // headers: {},
            configure: (proxy, options) => {
              console.debug('Starting proxy with options:', options);
            },
          },
        },
      },
    }),
  };
});
