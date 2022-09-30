import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MemoryRouter } from 'react-router-dom';
import mocks from '../src/test/__mocks__/requests';
import '../src/index.css';
import theme from '../src/config/theme';

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

export const decorators = [
  (Story) => <MemoryRouter>{Story()}</MemoryRouter>,
  (Story) => (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {Story()}
      </LocalizationProvider>
    </ThemeProvider>
  ),
];
