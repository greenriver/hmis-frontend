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
    // Set up new client, enroll, and begin intake
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

    // Deep-equal compare when closing and re-opening WIP saved assessment
    cy.testId('submitFormButton').first().click({ ctrlKey: true });
    cy.window().then((win) => {
      const hudValues = win.debug.hudValues;
      // Save assessment
      cy.testId('saveFormButton').first().click();
      // Re-open assessment and assert that hudValues match previous
      cy.testId('assessmentsPanel').find('table').find('a').first().click();
      cy.expectHudValuesToDeepEqual(hudValues);
    });

    // Make a change and save
    const incomeFromAnySource = '4.02.2';
    cy.checkOption(incomeFromAnySource, 'NO');
    cy.testId('saveFormButton').first().click();

    // Re-open and ensure change was persisted
    cy.testId('assessmentsPanel').find('table').find('a').first().click();
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'NO',
    });

    // Make a change and submit
    cy.checkOption(incomeFromAnySource, 'CLIENT_REFUSED');
    cy.testId('submitFormButton').first().click();

    // Re-open and make sure CLIENT_REFUSED saved
    cy.testId('assessmentsPanel').find('table').find('a').first().click();
    cy.testId('saveFormButton').should('not.exist');
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'CLIENT_REFUSED',
    });

    // Change to YES and submit
    cy.checkOption(incomeFromAnySource, 'YES');
    cy.testId('submitFormButton').first().click();

    // Re-open and make sure YES saved
    cy.testId('assessmentsPanel').find('table').find('a').first().click();
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'YES',
    });

    // Deep-equal compare when closing and re-opening submitted assessment
    cy.testId('submitFormButton').first().click({ ctrlKey: true });
    cy.window().then((win) => {
      const hudValues = win.debug.hudValues;
      // Submit assessment
      cy.testId('submitFormButton').first().click();
      // Re-open assessment and assert that hudValues match previous
      cy.testId('assessmentsPanel').find('table').find('a').first().click();
      cy.expectHudValuesToDeepEqual(hudValues);
    });
  }
);
