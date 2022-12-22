// This only works when running against the real backend.
// Must set the following env vars with real username/pw from local environment:

// export CYPRESS_EMAIL=
// export CYPRESS_PASSWORD=

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
  cy.visit('/');
});

it(
  'should perform HUD intake assessment',
  {
    viewportHeight: 1000, // extra long height so its easier to see what's going on
    viewportWidth: 1024,
  },
  () => {
    cy.createClient('Cy First', 'Cy Last');
    cy.testId('enrollButton').click();
    cy.testId('projectSelect').click();
    cy.get('li[role="option"]').first().click();
    cy.testId('createEnrollmentButton').first().click();
    cy.testId('finishIntakeButton').click();
    // cy.visit('/client/8042/enrollments/10099/assessments/intake/new');

    // Client Location - skip because we don't know about this project
    cy.inputId('3.16').click();

    // Prior Living Situation
    cy.assertPriorLivingSituation();

    // Income and Sources
    cy.assertIncomeAndSources();

    // Non-Cash Benefits
    cy.assertNonCashBenefits();

    // Health Insurance
    cy.assertHealthInsurance();

    // Disability
    cy.assertDisability();

    // Health and DV
    cy.assertHealthAndDV();

    cy.testId('submitFormButton').first().click({ ctrlKey: true });
    cy.window().then((win) => {
      const hudValues = win.debug.hudValues;

      // Save assessment
      cy.testId('saveFormButton').first().click();

      // Re-open assessment and assert that hudValues match previous
      cy.testId('assessmentsPanel').find('table').find('a').first().click();
      cy.expectHudValuesToDeepEqual(hudValues);
    });
  }
);
