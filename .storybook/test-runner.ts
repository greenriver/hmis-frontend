import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await configureAxe(page, {
      // Skip some rules for now as we work on addressing them
      rules: [
        {
          // TODO https://github.com/open-path/hmis-accessibility/issues/1
          id: 'autocomplete-valid',
          enabled: false,
        },
      ],
    });

    await checkA11y(page, '#storybook-root');
  },
};

export default config;
