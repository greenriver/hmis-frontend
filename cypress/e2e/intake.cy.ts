import { startOfYesterday, format } from 'date-fns';
import { AlphaIncomeSources } from 'support/assessmentConstants';
import {
  incomePerSource,
  incomeSourcesGroup,
} from 'support/assessmentsCommands';
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
    // Select project
    cy.testId('projectSelect').click();
    cy.get('.MuiAutocomplete-popper .MuiAutocomplete-loading').should(
      'not.exist'
    );
    cy.get(`.MuiAutocomplete-listbox`)
      .find('li[role="option"]')
      .first()
      .as('firstProject');
    cy.get('@firstProject').click();
    // Set entry date
    cy.inputId('entry-date').clear();
    const yesterday = format(startOfYesterday(), 'MMddyyyy');
    cy.inputId('entry-date').type(yesterday);
    cy.testId('createEnrollmentButton').first().click();
    cy.testId('beginIntake').click();
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
    cy.testId('formButton-submit').first().click({ ctrlKey: true });
    cy.window().then((win) => {
      const hudValues = win.debug.hudValues;
      // Save assessment
      cy.testId('formButton-saveDraft').first().click();
      // Re-open assessment and assert that hudValues match previous
      cy.testId('panel-assessments').find('table').find('a').first().click();
      cy.expectHudValuesToDeepEqual(hudValues);

      // Ensure total income is calculated on page load
      cy.getById(incomeSourcesGroup)
        .findTestId('inputSum')
        .contains(incomePerSource * (AlphaIncomeSources.length + 1))
        .should('exist');
    });

    // Make a change and save
    const incomeFromAnySource = '4.02.2';
    cy.checkOption(incomeFromAnySource, 'NO');
    cy.testId('formButton-saveDraft').first().click();

    // Re-open and ensure change was persisted
    // cy.testId('panel-assessments').find('table').find('a').first().click();
    cy.testId('finishIntake').click();
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'NO',
    });

    // Make a change and submit
    cy.checkOption(incomeFromAnySource, 'CLIENT_REFUSED');
    cy.testId('formButton-submit').first().click();
    cy.confirmDialog();

    // Re-open and make sure CLIENT_REFUSED saved
    cy.testId('panel-assessments').find('table').find('a').first().click();
    cy.testId('formButton-saveDraft').should('not.exist');
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'CLIENT_REFUSED',
    });

    // Change to YES and submit
    cy.checkOption(incomeFromAnySource, 'YES');
    cy.inputId('4.02.A').type('200');
    cy.testId('formButton-submit').first().click();
    cy.confirmDialog();

    // Re-open and make sure YES saved
    cy.testId('panel-assessments').find('table').find('a').first().click();
    cy.expectHudValuesToInclude({
      'IncomeBenefit.incomeFromAnySource': 'YES',
      'IncomeBenefit.earned': 'YES',
      'IncomeBenefit.earnedAmount': 200,
    });

    // Deep-equal compare when closing and re-opening submitted assessment
    cy.testId('formButton-submit').first().click({ ctrlKey: true });
    cy.window().then((win) => {
      const hudValues = win.debug.hudValues;
      // Submit assessment
      cy.testId('formButton-submit').first().click();
      cy.confirmDialog();
      // Re-open assessment and assert that hudValues match previous
      cy.testId('panel-assessments').find('table').find('a').first().click();
      cy.expectHudValuesToDeepEqual(hudValues);
    });
    cy.testId('formButton-discard').first().click();

    // Delete assessment
    cy.testId('deleteAssessment').first().click();
    cy.confirmDialog();
    cy.testId('deleteAssessment').should('not.exist');
  }
);
