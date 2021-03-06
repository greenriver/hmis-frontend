import { MockedProvider } from '@apollo/client/testing';
import mocks from '../src/test/__mocks__/requests';
import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'padded',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  apolloClient: {
    MockedProvider,
    mocks,
    addTypename: false,
  },
};
