const { mergeConfig } = require('vite');
const { resolve } = require('path');
import react from '@vitejs/plugin-react';

const config = {
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': resolve(__dirname, './../src'),
          // Mock for the ActiveRecord BlobUpload module
          '@rails/activestorage/src/blob_upload': resolve(
            __dirname,
            './../src/test/__mocks__/activeStorageBlob.js'
          ),
        },
      },
      build: {
        rollupOptions: {
          // this doesn't come over in merge for some reason, so re-define it here
          onwarn(warning, defaultHandler) {
            if (warning.code === 'SOURCEMAP_ERROR') return;
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            defaultHandler(warning);
          },
        },
      },
    });
  },
  stories: [
    // Use implicit paths for all stories
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    // For a better structure, need to reorganize some things. Should first confirm approach that "src" has comment element components and "modules" have components for specific pages or modules, which is the vague pattern right now.
    // - Move src/components/clientDashboard components into module(s)
    // - Move src/components/pages into modules too?
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-apollo-client',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  typescript: {
    check: false,
    skipBabel: true,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      propFilter: (prop: any) => {
        return prop.parent
          ? prop.parent.name !== 'DOMAttributes' &&
              prop.parent.name !== 'HTMLAttributes' &&
              prop.parent.name !== 'AriaAttributes'
          : true;
      },
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
    },
  },
  docs: {},
};
export default config;
