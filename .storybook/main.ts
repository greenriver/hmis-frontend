const { mergeConfig } = require('vite');
const { resolve } = require('path');
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
    });
  },
  stories: [
    '../src/**/*.stories.mdx',
    {
      directory: '../src/components',
      files: '**/*.stories.*',
      titlePrefix: 'Components',
    },
    '../src/modules/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
    'storybook-addon-apollo-client',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
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
