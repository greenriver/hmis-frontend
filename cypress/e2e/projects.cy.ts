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
  /*** Organization ***/

  // Create organization
  cy.testId('navToProjects').click();
  cy.testId('addOrganizationButton').click();
  cy.inputId('name').safeType('X Test Organization');
  cy.getById('description').type('Description{enter}line two{enter}line three');
  cy.getById('contact').type('Contact{enter}line two{enter}line three');
  cy.getById('victimServiceProvider').find('button[value="false"]').click();
  cy.testId('submitFormButton').click();
  cy.testId('organizationDetailsCard').contains('line two');

  // Update organization
  cy.testId('updateOrganizationButton').click();
  cy.getById('description').clear().safeType('Updated description');
  cy.testId('submitFormButton').click();
  cy.testId('organizationDetailsCard').contains('Updated description');

  /*** Project ***/

  const projectName = 'X Test Project';
  cy.testId('addProjectButton').click();
  cy.inputId('2.02.2').safeType(projectName);
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
  const expectedFormValues = {
    projectName: 'X Test Project',
    description: 'Project Description',
    contactInformation: 'Project Contact',
    operatingStartDate: '2022-01-01',
    operatingEndDate: null,
    projectType: 'DAY_SHELTER',
  };
  cy.expectHudValuesToDeepEqual(expectedFormValues);
  cy.testId('submitFormButton').click();

  // Confirm details are correct
  cy.testId('projectDetailsCard').contains('Day Shelter');

  // Navigate to Organization page
  cy.testId('breadcrumb-1').click();

  // Assert project shows up in table
  cy.testId('projectsCard').find('table tbody tr').should('have.length', 1);
  cy.testId('projectsCard')
    .find('table tbody tr')
    .contains(projectName)
    .should('exist');

  // Navigate back to project page
  cy.testId('projectsCard').find('table tbody tr').click();

  // Edit project, assert details updated
  cy.testId('updateProjectButton').click();
  // Form values should have nulls filled in
  cy.expectHudValuesToDeepEqual({
    ...expectedFormValues,
    housingType: null,
    targetPopulation: 'NOT_APPLICABLE',
    HOPWAMedAssistedLivingFac: null,
    continuumProject: null,
    HMISParticipatingProject: null,
  });

  const newProjectName = 'X Renamed Project';
  cy.inputId('2.02.2').clear().safeType(newProjectName);
  cy.choose(projectType, ProjectType.Ph);
  cy.testId('submitFormButton').click();

  // Assert changes to project details are reflected
  cy.get('h3').first().contains(newProjectName);
  cy.testId('projectDetailsCard').contains('Permanent Housing');

  // Navigate to Organization page, ensure change to project type is reflected there too
  cy.testId('breadcrumb-1').click();
  cy.testId('projectsCard').find('table tbody tr').should('have.length', 1);
  cy.testId('projectsCard')
    .find('table tbody tr')
    .contains('Permanent Housing')
    .should('exist');

  // Navigate back to project page
  cy.testId('projectsCard').find('table tbody tr').click();

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
  cy.expectHudValuesToDeepEqual({
    endDate: null,
    funder: 'LOCAL_OR_OTHER_FUNDING_SOURCE',
    grantId: 'ABC123',
    otherFunder: 'other funder details',
    startDate: '2022-01-01',
  });
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
  cy.expectHudValuesToDeepEqual({
    endDate: '2025-01-01',
    funder: 'HUD_ESG_CV',
    grantId: 'ABC123',
    startDate: '2022-01-01',
  });
  cy.testId('submitFormButton').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 2);

  // Delete funder, assert table updated
  cy.testId('funderCard').findTestId('deleteButton').first().click();
  cy.testId('cancelDialogAction').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 2);
  cy.testId('funderCard').findTestId('deleteButton').first().click();
  cy.testId('confirmDialogAction').click();
  cy.testId('funderCard').find('table tbody tr').should('have.length', 1);

  /** Try to create inventory (unable to because there are no ProjectCoC records yet) */

  cy.testId('addInventoryButton').click();
  cy.checkOption('hhtype', 'HOUSEHOLDS_WITH_ONLY_CHILDREN');
  cy.checkOption('es-availability', 'OVERFLOW');
  cy.checkOption('es-bed-type', 'VOUCHER');
  cy.inputId('2.07.1').safeType('01/01/2022');
  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert').contains('CoC code must exist').should('exist');
  cy.testId('discardFormButton').click();

  /*** Project CoC ***/

  // Create new ProjectCoC
  cy.testId('addProjectCocButton').click();
  cy.choose('coc', 'MA-505');
  cy.choose('geocode', '250126');
  cy.checkOption('geotype', 'RURAL');
  cy.inputId('address1').safeType('Addr 1');
  cy.inputId('address2').safeType('Addr 2');
  cy.inputId('city').safeType('City');
  cy.inputId('zip').safeType('00001');
  cy.expectHudValuesToDeepEqual({
    cocCode: 'MA-505',
    geocode: '250126',
    geographyType: 'RURAL',
    address1: 'Addr 1',
    address2: 'Addr 2',
    city: 'City',
    state: 'MA', // SHould be auto-filled
    zip: '00001',
  });
  cy.testId('submitFormButton').click();

  // Assert it shows up
  cy.testId('projectCocCard').find('table tbody tr').should('have.length', 1);
  cy.testId('projectCocCard')
    .find('table tbody tr')
    .contains('MA-505')
    .should('exist');

  // Update it and ensure changes are reflected in the table
  cy.testId('projectCocCard').findTestId('updateButton').click();
  cy.choose('state', 'AZ');
  cy.testId('submitFormButton').click();
  cy.testId('projectCocCard').find('table tbody tr').should('have.length', 1);
  cy.testId('projectCocCard')
    .find('table tbody tr')
    .contains('AZ')
    .should('exist');

  // Add another ProjectCoC
  cy.testId('addProjectCocButton').click();
  cy.choose('coc', 'MA-502');
  cy.choose('geocode', '250126');
  cy.expectHudValuesToDeepEqual({
    cocCode: 'MA-502',
    geocode: '250126',
    state: 'MA',
  });
  cy.testId('submitFormButton').click();
  cy.testId('projectCocCard').find('table tbody tr').should('have.length', 2);

  // Delete the second ProjectCoC
  cy.testId('projectCocCard').findTestId('deleteButton').first().click();
  cy.testId('confirmDialogAction').click();
  cy.testId('projectCocCard').find('table tbody tr').should('have.length', 1);

  /*** Inventory ***/

  // Create new Inventory
  cy.testId('addInventoryButton').click();
  cy.inputId('coc').invoke('val').should('not.be.empty'); // should autofill
  cy.checkOption('hhtype', 'HOUSEHOLDS_WITH_ONLY_CHILDREN');
  cy.checkOption('es-availability', 'OVERFLOW');
  cy.checkOption('es-bed-type', 'VOUCHER');

  cy.inputId('2.07.1').safeType('01/01/2022'); // start date
  cy.inputId('2.07.2').safeType('01/01/2020'); // end date (invalid, must be after start)

  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert')
    .contains('Inventory end date must be on or after start date')
    .should('exist');

  // Fix end date
  cy.inputId('2.07.2').clear().safeType('01/01/2023');

  cy.expectHudValuesToDeepEqual({
    cocCode: 'MA-505',
    householdType: 'HOUSEHOLDS_WITH_ONLY_CHILDREN',
    availability: 'OVERFLOW',
    esBedType: 'VOUCHER',
    inventoryStartDate: '2022-01-01',
    inventoryEndDate: '2023-01-01',
  });

  // Submit (create Inventory)
  cy.testId('submitFormButton').click();
  // Navigate to Project page
  cy.testId('breadcrumb-2').click();

  // Assert it shows up in table
  cy.testId('inventoryCard').find('table tbody tr').should('have.length', 1);
  cy.testId('inventoryCard')
    .find('table tbody tr')
    .contains('Households with only children')
    .should('exist');

  // Update it and ensure changes are reflected in the table
  cy.testId('inventoryCard').findTestId('updateButton').click();
  cy.checkOption('hhtype', 'HOUSEHOLDS_WITHOUT_CHILDREN');
  cy.testId('submitFormButton').click();
  cy.testId('inventoryCard').find('table tbody tr').should('have.length', 1);
  cy.testId('inventoryCard')
    .find('table tbody tr')
    .contains('Households without children')
    .should('exist');

  // Add another Inventory record
  cy.testId('addInventoryButton').click();
  cy.inputId('coc').invoke('val').should('not.be.empty'); // should autofill
  cy.checkOption('hhtype', 'HOUSEHOLDS_WITH_AT_LEAST_ONE_ADULT_AND_ONE_CHILD');
  cy.inputId('2.07.1').safeType('01/01/2020'); // start date (too early)

  // Try to submit, expect error
  cy.testId('submitFormButton').click();
  cy.testId('formErrorAlert')
    .contains('Inventory start date must be on or after project start date')
    .should('exist');

  // Fix start date and submit again
  cy.inputId('2.07.1').clear().safeType('06/01/2022');
  cy.testId('submitFormButton').click();

  // Navigate to Project page
  cy.testId('breadcrumb-2').click();
  cy.testId('inventoryCard').find('table tbody tr').should('have.length', 2);

  // Delete an Inventory record
  cy.testId('inventoryCard').findTestId('deleteButton').last().click();
  cy.testId('confirmDialogAction').click();
  cy.testId('inventoryCard').find('table tbody tr').should('have.length', 1);

  /*** Close project (should warn about open funders) ***/
  cy.testId('updateProjectButton').click();
  cy.inputId('2.02.4').clear().safeType('01/31/2022');
  cy.testId('submitFormButton').click();
  cy.testId('confirmDialogAction').click();

  /*** Delete project and organization ***/
  cy.testId('deleteProjectButton').click();
  cy.testId('confirmDialogAction').click();

  cy.testId('deleteOrganizationButton').click();
  cy.testId('confirmDialogAction').click();
});
