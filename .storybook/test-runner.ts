// COMMENTED OUT for now until we want to actually turn on accessibility tests on CI
// See docs for more details including story- and component-level configuration:
// https://storybook.js.org/docs/writing-tests/accessibility-testing#automate-accessibility-tests-with-test-runner

// import type { TestRunnerConfig } from '@storybook/test-runner';
// import { injectAxe, checkA11y } from 'axe-playwright';
//
// /*
//  * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
//  * to learn more about the test-runner hooks API.
//  */
// const config: TestRunnerConfig = {
//   async preVisit(page) {
//     await injectAxe(page);
//   },
//   async postVisit(page) {
//     await checkA11y(page, '#storybook-root', {
//       detailedReport: true,
//       detailedReportOptions: {
//         html: true,
//       },
//     });
//   },
// };
//
// export default config;
