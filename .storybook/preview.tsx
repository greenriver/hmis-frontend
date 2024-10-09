import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import { EnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import { MockedProvider } from '@apollo/client/testing';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import en from 'date-fns/locale/en-US';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../src/config/theme';
import '../src/index.css';
import { fakeEnrollment, RITA_ACKROYD } from '../src/test/__mocks__/requests';
import { RenderRouteWithOutletContext } from './components/RenderRouteWithOutletContext';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

export const parameters = {
  layout: 'padded',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  apolloClient: {
    MockedProvider,
    mocks: [], // mocks are passed in each story
    addTypename: false,
  },
};

export const tags = ['autodocs'];

export const decorators = [
  (Story, { parameters }) => {
    // React Router decorator can optionally provide a dashboard context if `dashboardContext` is passed.
    // Caller can optionally specify the client/enrollemnt mocks that should be used in the context by
    // passing `client` or `enrollment` parameters.
    const { dashboardContext, client, enrollment } = parameters;
    switch (dashboardContext) {
      case 'enrollment':
        return (
          <RenderRouteWithOutletContext<EnrollmentDashboardContext>
            context={{
              // data doesn't exactly match the fragment type that is used for Enrollment Dashboard, could be improved
              client: client || RITA_ACKROYD,
              enrollment: enrollment || fakeEnrollment(),
              enrollmentLoading: false,
            }}
          >
            {Story()}
          </RenderRouteWithOutletContext>
        );
      case 'client':
        return (
          <RenderRouteWithOutletContext<ClientDashboardContext>
            // data doesn't exactly match the fragment type that is used for Enrollment Dashboard, could be improved
            context={{ client: client || RITA_ACKROYD }}
          >
            {Story()}
          </RenderRouteWithOutletContext>
        );
      default:
        return <MemoryRouter>{Story()}</MemoryRouter>;
    }
  },
  (Story) => (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en}>
      {Story()}
    </LocalizationProvider>
  ),
  withThemeFromJSXProvider({
    themes: {
      // If we provide more than one theme here, a toolbar menu will appear in
      // the Storybook UI to select among them
      default: theme,
    },
    defaultTheme: 'default',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
];
