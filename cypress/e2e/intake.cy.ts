import { AlphaIncomeSources } from 'support/assessmentConstants';
import {
  incomePerSource,
  incomeSourcesGroup,
} from 'support/assessmentsCommands';

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login();
  cy.visit('/');
});

it(
  'should perform HUD intake assessment',
  {
    viewportHeight: 1000, // extra long height so its easier to see what's going on
    viewportWidth: 1024,
  },
  () => {
    // Open a project
    cy.testId('navToProjects').click();
    cy.tableRows('allProjectsTable').first().click();
    cy.navItem('enrollments').click();

    // Create and enroll a new client
    cy.testId('addHouseholdButton').click();
    cy.testId('clientSearchForm').find('input').type('client name{enter}');
    cy.testId('addClientButton').click();
    cy.testId('dialog').should('be.visible');
    cy.testId('dialog').find('input[id="first-name"]').type('Cy First');
    cy.testId('dialog').find('input[id="last-name"]').type('Cy Last');
    cy.testId('dialog').find('button[type="submit"]').click();

    // Open up the enrollment
    cy.testId('editHouseholdMemberTable')
      .findTestId('clientName')
      .first()
      .click();

    // Open up the intake assessment
    cy.contains('Finish Intake Assessment').click();
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
      cy.navItem('assessments').click();
      cy.testId('enrollmentAssessmentsCard')
        .find('table')
        .find('a')
        .first()
        .click();
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
    cy.navItem('assessments').click();
    cy.testId('enrollmentAssessmentsCard')
      .find('table')
      .find('a')
      .first()
      .click();
    cy.testId('unlockAssessmentButton').click();
    cy.testId('formButton-submit').should('exist');
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
    cy.navItem('assessments').click();
    cy.testId('enrollmentAssessmentsCard')
      .find('table')
      .find('a')
      .first()
      .click();
    cy.testId('unlockAssessmentButton').click();
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
      cy.navItem('assessments').click();
      cy.testId('enrollmentAssessmentsCard')
        .find('table')
        .find('a')
        .first()
        .click();
      cy.testId('unlockAssessmentButton').click();
      cy.expectHudValuesToDeepEqual(hudValues);

      // Delete assessment
      cy.testId('deleteRecordButton-assessment').click();
      cy.confirmDialog();
    });
  }
);
