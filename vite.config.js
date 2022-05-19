import { execSync } from 'child_process';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (mode !== 'production') {
    const commitDate = execSync('git log -1 --format=%cI').toString().trimEnd();
    const branchName = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trimEnd();
    const commitHash = execSync('git rev-parse --short HEAD')
      .toString()
      .trimEnd();

    process.env.VITE_GIT_COMMIT_DATE = commitDate;
    process.env.VITE_GIT_BRANCH_NAME = branchName;
    process.env.VITE_GIT_COMMIT_HASH = commitHash;
  }

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [react()],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
  };
});
