import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import en from 'date-fns/locale/en-US';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../src/config/theme';
import '../src/index.css';
import mocks, {
  fakeEnrollment,
  RITA_ACKROYD,
} from '../src/test/__mocks__/requests';
import { RenderRouteWithOutletContext } from './components/RenderRouteWithOutletContext';

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
    mocks: [], // add to stories
    // mocks, // this
    addTypename: false,
  },
};

export const decorators = [
  (Story, { parameters }) => {
    // React Router decorator can optionally provide a dashboard context if `dashboardContext` is passed.
    // Caller can optionally specify the client/enrollemnt mocks that should be used in the context by
    // passing `client` or `enrollment` parameters.
    const { dashboardContext, client, enrollment } = parameters;
    switch (dashboardContext) {
      case 'enrollment':
        return (
          <RenderRouteWithOutletContext
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
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en}>
        {Story()}
      </LocalizationProvider>
    </ThemeProvider>
  ),
];
export const tags = ['autodocs'];
