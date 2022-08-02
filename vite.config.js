import { execSync } from 'child_process';
import dns from 'dns';
import fs from 'fs';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';

const setGitVariables = (process) => {
  const commitDate = execSync('git log -1 --format=%cI').toString().trimEnd();
  const branchName = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trimEnd();
  const commitHash = execSync('git rev-parse --short HEAD')
    .toString()
    .trimEnd();

  process.env.PUBLIC_GIT_COMMIT_DATE = commitDate;
  process.env.PUBLIC_GIT_BRANCH_NAME = branchName;
  process.env.PUBLIC_GIT_COMMIT_HASH = commitHash;
};

dns.setDefaultResultOrder('ipv4first');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode !== 'production') {
    setGitVariables(process);
  }

  return {
    envPrefix: 'PUBLIC_',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [react()],
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
    ...(command !== 'build' && {
      server: {
        open: true,
        host: 'hmis.dev.test',
        https: {
          key: fs.readFileSync('.cert/key.pem'),
          cert: fs.readFileSync('.cert/cert.pem'),
        },
        proxy: {
          '/hmis': {
            target: 'https://hmis-warehouse.dev.test',
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
