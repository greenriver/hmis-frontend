const { mergeConfig } = require('vite');
const { resolve } = require('path');
import type { StorybookViteConfig } from '@storybook/builder-vite';

const config: StorybookViteConfig = {
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: { '@': resolve(__dirname, './../src') },
      },
    });
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-apollo-client',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // propFilter: () => true,
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
  features: {
    storyStoreV7: true,
  },
};

export default config;
