'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.decorators = exports.tags = exports.parameters = void 0;
var testing_1 = require('@apollo/client/testing');
var AdapterDateFns_1 = require('@mui/x-date-pickers/AdapterDateFns');
var LocalizationProvider_1 = require('@mui/x-date-pickers/LocalizationProvider');
var en_US_1 = require('date-fns/locale/en-US');
var react_1 = require('react');
var react_router_dom_1 = require('react-router-dom');
var theme_1 = require('../src/config/theme');
require('../src/index.css');
var requests_1 = require('../src/test/__mocks__/requests');
var RenderRouteWithOutletContext_1 = require('./components/RenderRouteWithOutletContext');
var material_1 = require('@mui/material');
var addon_themes_1 = require('@storybook/addon-themes');
exports.parameters = {
  layout: 'padded',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  apolloClient: {
    MockedProvider: testing_1.MockedProvider,
    mocks: [],
    addTypename: false,
  },
};
exports.tags = ['autodocs'];
exports.decorators = [
  function (Story, _a) {
    var parameters = _a.parameters;
    // React Router decorator can optionally provide a dashboard context if `dashboardContext` is passed.
    // Caller can optionally specify the client/enrollemnt mocks that should be used in the context by
    // passing `client` or `enrollment` parameters.
    var dashboardContext = parameters.dashboardContext,
      client = parameters.client,
      enrollment = parameters.enrollment;
    switch (dashboardContext) {
      case 'enrollment':
        return (
          <RenderRouteWithOutletContext_1.RenderRouteWithOutletContext
            context={{
              // data doesn't exactly match the fragment type that is used for Enrollment Dashboard, could be improved
              client: client || requests_1.RITA_ACKROYD,
              enrollment: enrollment || (0, requests_1.fakeEnrollment)(),
              enrollmentLoading: false,
            }}
          >
            {Story()}
          </RenderRouteWithOutletContext_1.RenderRouteWithOutletContext>
        );
      case 'client':
        return (
          <RenderRouteWithOutletContext_1.RenderRouteWithOutletContext
            // data doesn't exactly match the fragment type that is used for Enrollment Dashboard, could be improved
            context={{ client: client || requests_1.RITA_ACKROYD }}
          >
            {Story()}
          </RenderRouteWithOutletContext_1.RenderRouteWithOutletContext>
        );
      default:
        return (
          <react_router_dom_1.MemoryRouter>
            {Story()}
          </react_router_dom_1.MemoryRouter>
        );
    }
  },
  function (Story) {
    return (
      <LocalizationProvider_1.LocalizationProvider
        dateAdapter={AdapterDateFns_1.AdapterDateFns}
        adapterLocale={en_US_1.default}
      >
        {Story()}
      </LocalizationProvider_1.LocalizationProvider>
    );
  },
  (0, addon_themes_1.withThemeFromJSXProvider)({
    themes: {
      // If we provide more than one theme here, a toolbar menu will appear in
      // the Storybook UI to select among them
      default: theme_1.default,
    },
    defaultTheme: 'default',
    Provider: material_1.ThemeProvider,
    GlobalStyles: material_1.CssBaseline,
  }),
];
