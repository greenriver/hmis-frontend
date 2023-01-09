// This only works when running against the real backend.
// Must set the following env vars with real username/pw from local environment:

// export CYPRESS_EMAIL=
// export CYPRESS_PASSWORD=

Cypress.session.clearAllSavedSessions();

import { FundingSource, ProjectType } from '../../src/types/gqlTypes';

beforeEach(() => {
  cy.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
  cy.visit('/');
});

it('should create and update Organization, Project, Funder, Project CoC, and Inventory', () => {
  /*** Create organization ***/

  cy.testId('navToProjects').click();
  cy.testId('addOrganizationButton').click();
  cy.inputId('name').safeType('X Test Organization');
  cy.getById('description').type('Description{enter}line two{enter}line three');
  cy.getById('contact').type('Contact{enter}line two{enter}line three');
  cy.getById('victimServiceProvider').find('button[value="false"]').click();
  cy.testId('submitFormButton').click();

  /*** Create project ***/

  cy.testId('addProjectButton').click();
  cy.inputId('2.02.2').safeType('X Test Project');
  cy.getById('description').safeType('Project Description');
  cy.getById('contact').safeType('Project Contact');

  // Start and end dates
  cy.inputId('2.02.3').safeType('01/01/2022'); // start date
  cy.inputId('2.02.4').safeType('01/01/2020'); // end date (invalid, must be after start)

  // Project type
  const projectType = '2.02.6';
  const residentialAffiliation = '2.02.A';
  const trackingMethod = '2.02.C';

  cy.getById(trackingMethod).should('not.exist');
  cy.getById(residentialAffiliation).should('not.exist');

  cy.choose(projectType, ProjectType.Es);
  cy.getById(trackingMethod).should('exist');

  cy.choose(projectType, ProjectType.Ce);
  cy.getById(trackingMethod).should('not.exist');

  cy.choose(projectType, ProjectType.ServicesOnly);
  cy.getById(residentialAffiliation).should('exist');

  cy.choose(projectType, ProjectType.DayShelter);
  cy.getById(trackingMethod).should('not.exist');
  cy.getById(residentialAffiliation).should('not.exist');

  // Submit
  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert').should('exist'); // end date invalid

  // Fix and resubmit
  cy.inputId('2.02.4').clear(); // clear end date
  cy.testId('submitFormButton').click();

  // Edit project, assert details updated
  // TODO

  // cy.visit('/projects/688');

  /*** Funder ***/

  // Create funder
  cy.testId('addFunderButton').click();

  cy.inputId('grant-id').safeType('ABC123');

  cy.inputId('other').should('not.exist');
  cy.choose('funder', FundingSource.LocalOrOtherFundingSource);
  cy.inputId('other').should('exist');

  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert')
    .contains('Other funder must exist')
    .should('exist');

  cy.inputId('other').safeType('other funder details');

  // Test non-overlapping end date warning
  cy.inputId('start').safeType('01/01/2020');
  cy.inputId('end').safeType('01/01/2021');
  cy.testId('alert-date-range-warning').should('exist');

  // Invalid (end before start)
  cy.inputId('start').clear().safeType('01/01/2022');
  cy.inputId('end').clear().safeType('01/01/2021');

  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert')
    .contains('End date must be on or after start date')
    .should('exist');

  cy.inputId('end').clear();
  cy.testId('submitFormButton').click();

  cy.testId('funderCard').find('table tbody tr').should('have.length', 1);
  cy.testId('funderCard').findTestId('updateButton').click();

  // Edit funder, assert table updated

  cy.choose('funder', FundingSource.HudCocSafeHaven);
  cy.inputId('other').should('not.exist');
  cy.testId('submitFormButton').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 1);
  cy.testId('funderCard')
    .find('table tbody tr')
    .contains('Safe Haven')
    .should('exist');

  // Create another funder
  cy.testId('addFunderButton').click();
  cy.choose('funder', FundingSource.HudEsgCv);
  cy.inputId('grant-id').safeType('ABC123');
  cy.inputId('start').safeType('01/01/2022');
  cy.inputId('end').safeType('01/01/2025');
  cy.testId('submitFormButton').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 2);

  // Delete funder, assert table updated
  cy.testId('funderCard').findTestId('deleteButton').first().click();
  cy.testId('cancelDialogAction').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 2);
  cy.testId('funderCard').findTestId('deleteButton').first().click();
  cy.testId('confirmDialogAction').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 1);

  /*** Project CoC ***/
  cy.testId('addProjectCocButton').click();
  // TODO
  cy.testId('discardFormButton').click();

  /*** Inventory ***/
  cy.testId('addInventoryButton').click();
  // TODO
  cy.testId('discardFormButton').click();

  /*** Close project (should warn about open funders) ***/

  // TODO
});
